import os

from dotenv import load_dotenv

load_dotenv()


def _csv(name: str, default: str = "") -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


def _bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _int(name: str, default: int, minimum: int | None = None) -> int:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        value = int(raw_value)
    except ValueError:
        return default
    if minimum is not None:
        return max(value, minimum)
    return value


FLASK_ENV = os.getenv("FLASK_ENV", "development").strip().lower()
IS_PRODUCTION = FLASK_ENV in {"prod", "production"}

DEBUG_MODE = _bool("FLASK_DEBUG", False)
FLASK_PORT = _int("FLASK_PORT", 5000, minimum=1)

FRONTEND_ORIGINS = _csv(
    "FRONTEND_ORIGINS",
    os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"),
)

TRIPZY_API_KEYS = _csv("TRIPZY_API_KEYS")
AUTH_REQUIRED = _bool("TRIPZY_AUTH_REQUIRED", IS_PRODUCTION or bool(TRIPZY_API_KEYS))

MAX_CONTENT_LENGTH_BYTES = _int("MAX_CONTENT_LENGTH_BYTES", 16 * 1024, minimum=1024)
MAX_USER_INPUT_CHARS = _int("MAX_USER_INPUT_CHARS", 1000, minimum=50)
REQUEST_TIMEOUT_SECONDS = _int("REQUEST_TIMEOUT_SECONDS", 30, minimum=1)
PLAN_TIMEOUT_SECONDS = _int("PLAN_TIMEOUT_SECONDS", 120, minimum=10)

RATELIMIT_STORAGE_URI = os.getenv("RATELIMIT_STORAGE_URI", "memory://")
PLAN_RATE_LIMIT = os.getenv("TRIPZY_PLAN_RATE_LIMIT", "5 per minute")
PLAN_DAILY_QUOTA = os.getenv("TRIPZY_PLAN_DAILY_QUOTA", "20 per day")

REDIS_URL = os.getenv("REDIS_URL")
CACHE_TTL_SECONDS = _int("CACHE_TTL_SECONDS", 24 * 60 * 60, minimum=60)

DATABASE_URL = os.getenv("DATABASE_URL")
TRIP_QUEUE_BACKEND = os.getenv("TRIP_QUEUE_BACKEND", "thread").strip().lower()
TRIP_JOB_WORKERS = _int("TRIP_JOB_WORKERS", 2, minimum=1)
