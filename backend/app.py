import hashlib
import hmac
import logging
from typing import Any

from flask import Flask, g, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from jsonschema import Draft202012Validator, ValidationError
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge

from cache import cache
from config import (
    AUTH_REQUIRED,
    DEBUG_MODE,
    FLASK_PORT,
    FRONTEND_ORIGINS,
    MAX_CONTENT_LENGTH_BYTES,
    MAX_USER_INPUT_CHARS,
    PLAN_DAILY_QUOTA,
    PLAN_RATE_LIMIT,
    RATELIMIT_STORAGE_URI,
    TRIPZY_API_KEYS,
)
from jobs import GENERIC_PLAN_ERROR, TripJobManager, plan_cache_key, sanitize_result
from workflow import TravelPlanWorkflow

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH_BYTES

CORS(
    app,
    resources={r"/*": {"origins": FRONTEND_ORIGINS}},
    supports_credentials=False,
)

TRIP_REQUEST_SCHEMA = {
    "type": "object",
    "properties": {
        "user_input": {
            "type": "string",
            "minLength": 1,
            "maxLength": MAX_USER_INPUT_CHARS,
        }
    },
    "required": ["user_input"],
    "additionalProperties": False,
}
trip_request_validator = Draft202012Validator(TRIP_REQUEST_SCHEMA)

workflow = TravelPlanWorkflow()
job_manager = TripJobManager(workflow)


def _request_api_key() -> str:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip()
    return request.headers.get("X-Tripzy-API-Key", "").strip()


def _api_key_is_valid(api_key: str) -> bool:
    if not api_key:
        return False
    return any(hmac.compare_digest(api_key, configured_key) for configured_key in TRIPZY_API_KEYS)


def _identity_from_api_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode("utf-8")).hexdigest()[:24]


def _current_client_id() -> str:
    api_key = _request_api_key()
    if _api_key_is_valid(api_key):
        return f"key:{_identity_from_api_key(api_key)}"
    return f"ip:{get_remote_address()}"


def rate_limit_key() -> str:
    return getattr(g, "client_id", _current_client_id())


limiter = Limiter(
    key_func=rate_limit_key,
    app=app,
    storage_uri=RATELIMIT_STORAGE_URI,
    default_limits=[],
)


@app.before_request
def authenticate_api_request():
    if request.method == "OPTIONS":
        return None

    if not request.path.startswith("/api/") or request.path == "/api/health":
        return None

    api_key = _request_api_key()
    if AUTH_REQUIRED and not _api_key_is_valid(api_key):
        return jsonify({"error": "Unauthorized"}), 401

    g.client_id = _current_client_id()
    return None


def _parse_trip_request() -> tuple[str | None, tuple[Any, int] | None]:
    if not request.is_json:
        return None, (jsonify({"error": "Request body must be JSON"}), 415)

    data = request.get_json(silent=True)
    if data is None:
        return None, (jsonify({"error": "Invalid JSON request body"}), 400)

    try:
        trip_request_validator.validate(data)
    except ValidationError:
        return None, (
            jsonify({"error": f"user_input must be a non-empty string up to {MAX_USER_INPUT_CHARS} characters"}),
            400,
        )

    user_input = data["user_input"].strip()
    if not user_input:
        return None, (jsonify({"error": "user_input cannot be empty"}), 400)

    return user_input, None


def _not_found_response() -> tuple[Any, int]:
    return jsonify({"error": "Trip not found"}), 404

@app.route('/', methods=['GET'])
def hello():
    return jsonify({'message': 'Tripzy API - AI-powered Travel Planning', 'status': 'running'})

@app.route('/api/plan', methods=['POST'])
@limiter.limit(PLAN_DAILY_QUOTA)
@limiter.limit(PLAN_RATE_LIMIT)
def plan_trip():
    """
    Backward-compatible synchronous endpoint.
    Prefer POST /api/trips for long-running trip planning jobs.
    """
    try:
        user_input, error_response = _parse_trip_request()
        if error_response:
            return error_response

        cache_key = plan_cache_key(user_input)
        cached_result = cache.get_json(cache_key)
        if cached_result is not None:
            return jsonify(cached_result), 200

        result = sanitize_result(workflow.plan_travel(user_input))
        cache.set_json(cache_key, result)
        return jsonify(result), 200
    except Exception:
        logger.exception("Error in /api/plan")
        return jsonify({'error': GENERIC_PLAN_ERROR}), 500


@app.route('/api/trips', methods=['POST'])
@limiter.limit(PLAN_DAILY_QUOTA)
@limiter.limit(PLAN_RATE_LIMIT)
def create_trip():
    user_input, error_response = _parse_trip_request()
    if error_response:
        return error_response

    trip_id, status = job_manager.submit(rate_limit_key(), user_input)
    status_code = 200 if status == "completed" else 202
    return jsonify({
        "trip_id": trip_id,
        "status": status,
        "status_url": f"/api/trips/{trip_id}/status",
        "result_url": f"/api/trips/{trip_id}",
    }), status_code


@app.route('/api/trips/<trip_id>/status', methods=['GET'])
@limiter.limit("120 per minute")
def get_trip_status(trip_id: str):
    status = job_manager.get_status(trip_id, rate_limit_key())
    if not status:
        return _not_found_response()
    return jsonify(status), 200


@app.route('/api/trips/<trip_id>', methods=['GET'])
@limiter.limit("120 per minute")
def get_trip(trip_id: str):
    job = job_manager.get_result(trip_id, rate_limit_key())
    if not job:
        return _not_found_response()

    if job["status"] != "completed":
        return jsonify({
            "trip_id": job["id"],
            "status": job["status"],
            "error": job["error_message"] if job["status"] == "failed" else None,
        }), 202 if job["status"] in {"queued", "running"} else 500

    return jsonify(job["result"]), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'API is running',
        'version': '0.1.0'
    }), 200


@app.errorhandler(RequestEntityTooLarge)
def handle_request_too_large(error):
    return jsonify({"error": "Request body is too large"}), 413


@app.errorhandler(HTTPException)
def handle_http_exception(error):
    return jsonify({"error": error.description}), error.code


@app.errorhandler(Exception)
def handle_unexpected_exception(error):
    logger.exception("Unhandled application error")
    return jsonify({"error": GENERIC_PLAN_ERROR}), 500


if __name__ == '__main__':
    app.run(debug=DEBUG_MODE, port=FLASK_PORT, host='0.0.0.0')
