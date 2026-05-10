from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Any

from bson import ObjectId
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ.get("DB_NAME", "memind")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]


def serialize_value(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_value(item) for item in value]
    if isinstance(value, dict):
        return {key: serialize_value(val) for key, val in value.items()}
    return value


def serialize_doc(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if document is None:
        return None
    return serialize_value(document)


async def close_db() -> None:
    client.close()
