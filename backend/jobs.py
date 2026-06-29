import hashlib
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from cache import cache
from config import CACHE_TTL_SECONDS, PLAN_TIMEOUT_SECONDS, REDIS_URL, TRIP_JOB_WORKERS, TRIP_QUEUE_BACKEND
from storage import TripStore

logger = logging.getLogger(__name__)

GENERIC_PLAN_ERROR = "Unable to generate a travel plan right now. Please try again later."
PUBLIC_ERROR_CODES = {"RATE_LIMIT"}


def plan_cache_key(user_input: str) -> str:
    normalized = " ".join(user_input.strip().lower().split())
    return cache.make_key("trip-plan", normalized)


def sanitize_result(result: dict[str, Any]) -> dict[str, Any]:
    cleaned = dict(result)
    if cleaned.get("error") and cleaned["error"] not in PUBLIC_ERROR_CODES:
        cleaned["error"] = GENERIC_PLAN_ERROR
    return cleaned


class TripJobManager:
    def __init__(self, workflow: Any) -> None:
        self.workflow = workflow
        self.store = TripStore()
        self.queue = None
        self.executor = None
        if TRIP_QUEUE_BACKEND == "rq":
            if not REDIS_URL:
                raise RuntimeError("REDIS_URL is required when TRIP_QUEUE_BACKEND=rq")
            from redis import Redis
            from rq import Queue

            self.queue = Queue("tripzy", connection=Redis.from_url(REDIS_URL))
        else:
            self.executor = ThreadPoolExecutor(max_workers=TRIP_JOB_WORKERS, thread_name_prefix="tripzy-job")
        self.futures: dict[str, Any] = {}

    def submit(self, user_id: str, user_input: str) -> tuple[str, str]:
        job_id = uuid.uuid4().hex
        cached_result = cache.get_json(plan_cache_key(user_input))
        if cached_result is not None:
            self.store.create_completed_job(job_id, user_id, user_input, cached_result)
            return job_id, "completed"

        self.store.create_job(job_id, user_id, user_input)
        if self.queue:
            self.queue.enqueue("tasks.run_trip_job", job_id, user_input, job_timeout=PLAN_TIMEOUT_SECONDS)
            return job_id, "queued"

        future = self.executor.submit(self._run_job, job_id, user_input)
        self.futures[job_id] = future
        future.add_done_callback(lambda _: self.futures.pop(job_id, None))
        return job_id, "queued"

    def get_status(self, job_id: str, user_id: str) -> dict[str, Any] | None:
        job = self.store.get_job(job_id, user_id)
        if not job:
            return None
        return {
            "trip_id": job["id"],
            "status": job["status"],
            "created_at": job["created_at"],
            "updated_at": job["updated_at"],
            "started_at": job["started_at"],
            "completed_at": job["completed_at"],
            "error": job["error_message"] if job["status"] == "failed" else None,
        }

    def get_result(self, job_id: str, user_id: str) -> dict[str, Any] | None:
        return self.store.get_job(job_id, user_id)

    def _run_job(self, job_id: str, user_input: str) -> None:
        import traceback, sys
        short_id = hashlib.sha256(job_id.encode()).hexdigest()[:12]
        logger.info("JOB START %s  input=%r", short_id, user_input[:80])
        self.store.mark_running(job_id)
        try:
            result = sanitize_result(self.workflow.plan_travel(user_input, job_id=job_id, store=self.store))
            cache.set_json(plan_cache_key(user_input), result, CACHE_TTL_SECONDS)
            self.store.mark_succeeded(job_id, result)
            logger.info("JOB DONE  %s", short_id)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error("JOB FAIL  %s  error=%s\n%s", short_id, exc, tb)
            sys.stderr.flush()
            self.store.mark_failed(job_id, GENERIC_PLAN_ERROR)
