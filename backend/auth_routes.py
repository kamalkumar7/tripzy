"""
Google OAuth authentication routes.

Flow:
  1. Frontend gets a Google ID token via Google Sign-In button.
  2. POST /api/auth/google  { "id_token": "<google-id-token>" }
  3. Backend verifies the token with Google, upserts the user in MongoDB,
     and returns a signed JWT.
  4. Frontend stores the JWT and sends it as  Authorization: Bearer <jwt>
     on subsequent requests.
"""

import logging
from datetime import datetime, timezone, timedelta

import jwt
from flask import Blueprint, jsonify, request
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from config import GOOGLE_CLIENT_ID, JWT_SECRET, JWT_EXPIRY_HOURS
from db import get_users_collection

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _issue_jwt(user: dict) -> str:
    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "picture": user.get("picture", ""),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def _verify_google_token(token: str) -> dict:
    """Verify Google ID token and return its claims. Raises ValueError on failure."""
    request_obj = google_requests.Request()
    claims = google_id_token.verify_oauth2_token(token, request_obj, GOOGLE_CLIENT_ID)
    if claims.get("aud") != GOOGLE_CLIENT_ID:
        raise ValueError("Token audience mismatch")
    return claims


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.route("/google", methods=["POST"])
def google_login():
    """Exchange a Google ID token for a Tripzy JWT."""
    data = request.get_json(silent=True) or {}
    token = (data.get("id_token") or "").strip()

    if not token:
        return jsonify({"error": "id_token is required"}), 400

    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google auth is not configured on the server"}), 503

    try:
        claims = _verify_google_token(token)
    except Exception as exc:
        logger.warning("Google token verification failed: %s", exc)
        return jsonify({"error": "Invalid or expired Google token"}), 401

    google_id = claims["sub"]
    users = get_users_collection()

    # Upsert user by google_id
    users.update_one(
        {"google_id": google_id},
        {
            "$set": {
                "email": claims.get("email", ""),
                "name": claims.get("name", ""),
                "picture": claims.get("picture", ""),
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "google_id": google_id,
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )

    user = users.find_one({"google_id": google_id})
    jwt_token = _issue_jwt(user)

    return jsonify({
        "token": jwt_token,
        "user": {
            "email": user["email"],
            "name": user.get("name", ""),
            "picture": user.get("picture", ""),
        },
    }), 200


@auth_bp.route("/me", methods=["GET"])
def me():
    """Return current user info from JWT. No DB call needed."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return jsonify({"error": "Missing token"}), 401

    token = auth_header[7:].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    return jsonify({
        "email": payload.get("email"),
        "name": payload.get("name"),
        "picture": payload.get("picture"),
    }), 200
