"""
Saved trips routes.

POST /api/trips/save    — save a trip plan to MongoDB (JWT required)
GET  /api/trips/saved   — list all saved trips for the current user (JWT required)
DELETE /api/trips/saved/<id> — remove a saved trip (JWT required)
"""

import logging
from datetime import datetime, timezone

import jwt
from bson import ObjectId
from flask import Blueprint, jsonify, request

from config import JWT_SECRET
from db import get_db

logger = logging.getLogger(__name__)
trips_bp = Blueprint("saved_trips", __name__, url_prefix="/api/saved-trips")


# ---------------------------------------------------------------------------
# Auth helper
# ---------------------------------------------------------------------------

def _require_auth():
    """Decode JWT from Authorization header. Returns (payload, None) or (None, error_response)."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.lower().startswith("bearer "):
        return None, (jsonify({"error": "Missing token"}), 401)
    token = auth_header[7:].strip()
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload, None
    except jwt.ExpiredSignatureError:
        return None, (jsonify({"error": "Token expired"}), 401)
    except jwt.InvalidTokenError:
        return None, (jsonify({"error": "Invalid token"}), 401)


def _serialize(doc: dict) -> dict:
    """Convert MongoDB doc to JSON-safe dict."""
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@trips_bp.route("", methods=["POST"])
def save_trip():
    """Save the current trip plan to MongoDB, linked to the authenticated user."""
    payload, err = _require_auth()
    if err:
        return err

    data = request.get_json(silent=True) or {}
    trip_plan = data.get("trip_plan")
    if not trip_plan:
        return jsonify({"error": "trip_plan is required"}), 400

    user_id   = payload.get("sub")
    destination = (
        trip_plan.get("travel_details", {}).get("destination", "Unknown")
    )

    collection = get_db()["saved_trips"]

    # Upsert by (user_id, destination) so the same trip isn't saved twice
    result = collection.update_one(
        {"user_id": user_id, "destination": destination},
        {
            "$set": {
                "trip_plan": trip_plan,
                "destination": destination,
                "updated_at": datetime.now(timezone.utc),
            },
            "$setOnInsert": {
                "user_id": user_id,
                "created_at": datetime.now(timezone.utc),
            },
        },
        upsert=True,
    )

    saved_id = str(result.upserted_id) if result.upserted_id else None
    if not saved_id:
        # Was updated — fetch the existing _id
        doc = collection.find_one({"user_id": user_id, "destination": destination}, {"_id": 1})
        saved_id = str(doc["_id"]) if doc else None

    return jsonify({"saved": True, "id": saved_id, "destination": destination}), 200


@trips_bp.route("", methods=["GET"])
def list_saved_trips():
    """Return all saved trips for the authenticated user (summary list)."""
    payload, err = _require_auth()
    if err:
        return err

    user_id = payload.get("sub")
    collection = get_db()["saved_trips"]

    docs = list(
        collection.find(
            {"user_id": user_id},
            # Return summary fields only (not the full plan) for the list view
            {"trip_plan.travel_details": 1, "destination": 1, "created_at": 1, "updated_at": 1},
        ).sort("updated_at", -1).limit(50)
    )

    trips = []
    for doc in docs:
        trips.append({
            "id": str(doc["_id"]),
            "destination": doc.get("destination", ""),
            "travel_details": doc.get("trip_plan", {}).get("travel_details", {}),
            "saved_at": doc.get("updated_at", doc.get("created_at", "")).isoformat()
                        if doc.get("updated_at") else "",
        })

    return jsonify({"trips": trips}), 200


@trips_bp.route("/<trip_id>", methods=["DELETE"])
def delete_saved_trip(trip_id: str):
    """Remove a saved trip by ID."""
    payload, err = _require_auth()
    if err:
        return err

    user_id = payload.get("sub")
    try:
        oid = ObjectId(trip_id)
    except Exception:
        return jsonify({"error": "Invalid trip ID"}), 400

    collection = get_db()["saved_trips"]
    result = collection.delete_one({"_id": oid, "user_id": user_id})

    if result.deleted_count == 0:
        return jsonify({"error": "Trip not found"}), 404

    return jsonify({"deleted": True}), 200
