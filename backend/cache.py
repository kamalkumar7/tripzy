import hashlib
import json
import logging
import threading
import time
from typing import Any, Callable

from config import CACHE_TTL_SECONDS, REDIS_URL

logger = logging.getLogger(__name__)


class Cache:
    def __init__(self) -> None:
        self._memory: dict[str, tuple[float, Any]] = {}
        self._lock = threading.RLock()
        self._redis = None

        if REDIS_URL:
            try:
                import redis

                self._redis = redis.Redis.from_url(REDIS_URL, decode_responses=True)
                self._redis.ping()
            except Exception:
                logger.exception("Redis cache unavailable; falling back to in-memory cache")
                self._redis = None

    def make_key(self, namespace: str, *parts: Any) -> str:
        payload = json.dumps(parts, sort_keys=True, default=str, separators=(",", ":"))
        digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"tripzy:{namespace}:{digest}"

    def get_json(self, key: str) -> Any | None:
        if self._redis:
            value = self._redis.get(key)
            return json.loads(value) if value else None

        with self._lock:
            item = self._memory.get(key)
            if not item:
                return None
            expires_at, value = item
            if expires_at < time.time():
                self._memory.pop(key, None)
                return None
            return value

    def set_json(self, key: str, value: Any, ttl_seconds: int = CACHE_TTL_SECONDS) -> None:
        if self._redis:
            self._redis.setex(key, ttl_seconds, json.dumps(value, default=str))
            return

        with self._lock:
            self._memory[key] = (time.time() + ttl_seconds, value)

    def get_or_set(
        self,
        namespace: str,
        parts: tuple[Any, ...],
        factory: Callable[[], Any],
        ttl_seconds: int = CACHE_TTL_SECONDS,
    ) -> Any:
        key = self.make_key(namespace, *parts)
        cached = self.get_json(key)
        if cached is not None:
            return cached

        value = factory()
        self.set_json(key, value, ttl_seconds)
        return value


cache = Cache()
