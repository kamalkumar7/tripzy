"""MongoDB connection helper."""
import logging
from functools import lru_cache

from pymongo import MongoClient
from pymongo.database import Database

from config import MONGO_URI, MONGO_DB_NAME

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_db() -> Database:
    """Return a cached MongoDB database instance."""
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client[MONGO_DB_NAME]
    logger.info("Connected to MongoDB database: %s", MONGO_DB_NAME)
    return db


def get_users_collection():
    return get_db()["users"]
