import hashlib
import logging

from cache import cache
from config import CACHE_TTL_SECONDS
from jobs import GENERIC_PLAN_ERROR, plan_cache_key, sanitize_result
from storage import TripStore
from workflow import TravelPlanWorkflow

logger = logging.getLogger(__name__)


def run_trip_job(job_id: str, user_input: str) -> None:
    store = TripStore()
    store.mark_running(job_id)
    try:
        workflow = TravelPlanWorkflow()
        result = sanitize_result(workflow.plan_travel(user_input))
        cache.set_json(plan_cache_key(user_input), result, CACHE_TTL_SECONDS)
        store.mark_succeeded(job_id, result)
    except Exception:
        logger.exception("Trip queue job failed: %s", hashlib.sha256(job_id.encode()).hexdigest()[:12])
        store.mark_failed(job_id, GENERIC_PLAN_ERROR)
