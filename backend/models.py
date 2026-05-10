from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel, Field


class MedicationUpdateRequest(BaseModel):
    actorRole: str = "caregiver"
    adherenceStatus: str
    lastTaken: Optional[str] = None
    note: Optional[str] = None


class ConsentUpdateRequest(BaseModel):
    actorRole: str = "admin"
    status: str
    expiresAt: Optional[str] = None


class DoctorNoteCreateRequest(BaseModel):
    doctorId: str
    note: str
    carePlan: Optional[str] = None
    followUpRecommendation: Optional[str] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AuditLogCreateRequest(BaseModel):
    actorRole: str
    action: str
    patientId: Optional[str] = None
    target: str
    details: dict[str, Any] = Field(default_factory=dict)
