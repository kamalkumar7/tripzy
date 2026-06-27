import json
from pathlib import Path
from typing import Any

from sqlalchemy import Column, DateTime, MetaData, String, Table, Text, create_engine, select
from sqlalchemy.engine import Engine
from sqlalchemy.sql import func

from config import DATABASE_URL


def _default_database_url() -> str:
    data_dir = Path(__file__).resolve().parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{data_dir / 'tripzy.db'}"


def _normalize_database_url(url: str | None) -> str:
    if not url:
        return _default_database_url()
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


class TripStore:
    def __init__(self, database_url: str | None = DATABASE_URL) -> None:
        self.engine: Engine = create_engine(_normalize_database_url(database_url), pool_pre_ping=True)
        self.metadata = MetaData()
        self.jobs = Table(
            "trip_jobs",
            self.metadata,
            Column("id", String(64), primary_key=True),
            Column("user_id", String(128), nullable=False, index=True),
            Column("status", String(32), nullable=False, index=True),
            Column("user_input", Text, nullable=False),
            Column("result_json", Text),
            Column("error_message", Text),
            Column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
            Column("updated_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
            Column("started_at", DateTime(timezone=True)),
            Column("completed_at", DateTime(timezone=True)),
        )
        self.metadata.create_all(self.engine)

    def create_job(self, job_id: str, user_id: str, user_input: str) -> None:
        with self.engine.begin() as conn:
            conn.execute(
                self.jobs.insert().values(
                    id=job_id,
                    user_id=user_id,
                    status="queued",
                    user_input=user_input,
                )
            )

    def create_completed_job(self, job_id: str, user_id: str, user_input: str, result: dict[str, Any]) -> None:
        with self.engine.begin() as conn:
            conn.execute(
                self.jobs.insert().values(
                    id=job_id,
                    user_id=user_id,
                    status="completed",
                    user_input=user_input,
                    result_json=json.dumps(result, default=str),
                    completed_at=func.now(),
                )
            )

    def mark_running(self, job_id: str) -> None:
        self._update(job_id, status="running", started_at=func.now())

    def mark_succeeded(self, job_id: str, result: dict[str, Any]) -> None:
        self._update(
            job_id,
            status="completed",
            result_json=json.dumps(result, default=str),
            error_message=None,
            completed_at=func.now(),
        )

    def mark_failed(self, job_id: str, error_message: str) -> None:
        self._update(job_id, status="failed", error_message=error_message, completed_at=func.now())

    def get_job(self, job_id: str, user_id: str) -> dict[str, Any] | None:
        with self.engine.begin() as conn:
            row = (
                conn.execute(
                    select(self.jobs).where(self.jobs.c.id == job_id, self.jobs.c.user_id == user_id)
                )
                .mappings()
                .first()
            )
        return self._serialize_row(row) if row else None

    def _update(self, job_id: str, **values: Any) -> None:
        values["updated_at"] = func.now()
        with self.engine.begin() as conn:
            conn.execute(self.jobs.update().where(self.jobs.c.id == job_id).values(**values))

    def _serialize_row(self, row: Any) -> dict[str, Any]:
        result = dict(row)
        for key in ["created_at", "updated_at", "started_at", "completed_at"]:
            value = result.get(key)
            if value is not None:
                result[key] = value.isoformat()

        if result.get("result_json"):
            result["result"] = json.loads(result["result_json"])
        else:
            result["result"] = None
        result.pop("result_json", None)
        return result
