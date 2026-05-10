from __future__ import annotations

import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ReturnDocument

from ai_schemas import AIRequest, AITask
from ai_service import AIService
from db import close_db, db, serialize_doc
from models import ConsentUpdateRequest, DoctorNoteCreateRequest, MedicationUpdateRequest
from seed_data import seed_demo_data

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("memind")

app = FastAPI(title="Memind API", version="0.2.0")
api_router = APIRouter(prefix="/api")
ai_service = AIService()


async def record_audit_log(actor_role: str, action: str, patient_id: str | None, target: str, details: dict[str, Any] | None = None, consent_status: str | None = None) -> None:
    await db.audit_logs.insert_one(
        {
            "id": f"audit-{uuid.uuid4()}",
            "actorRole": actor_role,
            "action": action,
            "patientId": patient_id,
            "target": target,
            "details": details or {},
            "consentStatus": consent_status or "granted",
            "timestamp": datetime.now(timezone.utc),
        }
    )


async def get_patient_or_404(patient_id: str) -> dict[str, Any]:
    patient = await db.patients.find_one({"id": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


async def get_related_party(collection_name: str, doc_id: str | None) -> dict[str, Any] | None:
    if not doc_id:
        return None
    return serialize_doc(await db[collection_name].find_one({"id": doc_id}))


async def collection_for_patient(collection_name: str, patient_id: str, sort_field: str = "timestamp") -> list[dict[str, Any]]:
    results = await db[collection_name].find({"patientId": patient_id}).sort(sort_field, -1).to_list(200)
    return serialize_doc(results)


async def build_ai_context(patient_id: str, extra_context: dict[str, Any], period: str | None) -> dict[str, Any]:
    patient = serialize_doc(await get_patient_or_404(patient_id))
    caregiver = await get_related_party("caregivers", patient.get("primaryCaregiverId"))
    doctor = await get_related_party("doctors", patient.get("assignedDoctorId"))
    people = await collection_for_patient("people", patient_id, sort_field="id")
    memories = await collection_for_patient("memories", patient_id, sort_field="usageCount")
    episodes = await collection_for_patient("episodes", patient_id, sort_field="timestamp")
    medications = await collection_for_patient("medications", patient_id, sort_field="name")
    risk_scores = await collection_for_patient("risk_scores", patient_id, sort_field="timestamp")
    events = await collection_for_patient("events", patient_id, sort_field="timestamp")
    return {
        "patientName": patient.get("name"),
        "primaryCaregiver": caregiver.get("name") if caregiver else None,
        "doctor": doctor.get("name") if doctor else None,
        "diagnosis": patient.get("diagnosis"),
        "stage": patient.get("stage"),
        "location": patient.get("location"),
        "status": patient.get("status"),
        "cognitiveScore": patient.get("cognitiveScore"),
        "domainScores": patient.get("domainScores"),
        "riskScores": patient.get("riskScores"),
        "people": people[:5],
        "memories": memories[:5],
        "episodes": episodes[:5],
        "medications": medications,
        "events": events[:8],
        "riskHistory": risk_scores[-7:],
        "period": period,
        **extra_context,
    }


async def run_ai_task(task: AITask, request: AIRequest) -> dict[str, Any]:
    try:
        payload = await build_ai_context(request.patientId, request.context or {}, request.period)
        result = await ai_service.generate(
            task=task,
            payload=payload,
            patient_id=request.patientId,
            locale=request.locale,
            use_cache=request.useCache,
        )
        await record_audit_log(
            actor_role=request.context.get("actorRole", "role-switcher"),
            action=f"generated_{task.value}",
            patient_id=request.patientId,
            target=task.value,
            details={"cached": result.get("cached"), "provider": result.get("provider")},
        )
        return result
    except Exception as exc:
        logger.exception("AI task failed", extra={"task": task.value})
        raise HTTPException(status_code=500, detail=f"AI task {task.value} failed: {exc}") from exc


@api_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "Memind API online"}


@api_router.get("/ai/status")
async def ai_status() -> dict[str, Any]:
    return await ai_service.get_status()


@api_router.get("/patients")
async def get_patients() -> list[dict[str, Any]]:
    patients = await db.patients.find({}, {"_id": 0}).to_list(50)
    return serialize_doc(patients)


@api_router.get("/patients/{patient_id}")
async def get_patient(patient_id: str) -> dict[str, Any]:
    patient = serialize_doc(await get_patient_or_404(patient_id))
    patient["primaryCaregiver"] = await get_related_party("caregivers", patient.get("primaryCaregiverId"))
    patient["assignedDoctor"] = await get_related_party("doctors", patient.get("assignedDoctorId"))
    return patient


@api_router.get("/patients/{patient_id}/events")
async def get_patient_events(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("events", patient_id)


@api_router.get("/patients/{patient_id}/memories")
async def get_patient_memories(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("memories", patient_id, sort_field="usageCount")


@api_router.get("/patients/{patient_id}/people")
async def get_patient_people(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("people", patient_id, sort_field="id")


@api_router.get("/patients/{patient_id}/episodes")
async def get_patient_episodes(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("episodes", patient_id)


@api_router.get("/patients/{patient_id}/medications")
async def get_patient_medications(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("medications", patient_id, sort_field="name")


@api_router.get("/patients/{patient_id}/reports")
async def get_patient_reports(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    reports = await db.reports.find({"patientId": patient_id}).sort("createdAt", -1).to_list(100)
    return serialize_doc(reports)


@api_router.get("/patients/{patient_id}/ai-observations")
async def get_patient_ai_observations(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    observations = await db.ai_observations.find({"patientId": patient_id}).sort("createdAt", -1).to_list(100)
    return serialize_doc(observations)


@api_router.get("/patients/{patient_id}/risk-scores")
async def get_patient_risk_scores(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("risk_scores", patient_id)


@api_router.get("/patients/{patient_id}/consents")
async def get_patient_consents(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    return await collection_for_patient("consents", patient_id)


@api_router.get("/patients/{patient_id}/doctor-notes")
async def get_patient_doctor_notes(patient_id: str) -> list[dict[str, Any]]:
    await get_patient_or_404(patient_id)
    notes = await db.doctor_notes.find({"patientId": patient_id}).sort("createdAt", -1).to_list(100)
    return serialize_doc(notes)


@api_router.get("/dashboard/bootstrap/{patient_id}")
async def get_dashboard_bootstrap(patient_id: str) -> dict[str, Any]:
    patient = await get_patient(patient_id)
    caregiver = patient.get("primaryCaregiver")
    doctor = patient.get("assignedDoctor")
    payload = {
        "patient": patient,
        "caregiver": caregiver,
        "doctor": doctor,
        "events": await get_patient_events(patient_id),
        "memories": await get_patient_memories(patient_id),
        "people": await get_patient_people(patient_id),
        "episodes": await get_patient_episodes(patient_id),
        "medications": await get_patient_medications(patient_id),
        "reports": await get_patient_reports(patient_id),
        "aiObservations": await get_patient_ai_observations(patient_id),
        "riskScores": await get_patient_risk_scores(patient_id),
        "consents": await get_patient_consents(patient_id),
        "doctorNotes": await get_patient_doctor_notes(patient_id),
        "alerts": serialize_doc(await db.alerts.find({"patientId": patient_id}).sort("createdAt", -1).to_list(50)),
        "devices": serialize_doc(await db.devices.find({"patientId": patient_id}).sort("lastSeen", -1).to_list(50)),
        "aiStatus": await ai_service.get_status(),
    }
    return payload


@api_router.get("/admin/overview")
async def get_admin_overview() -> dict[str, Any]:
    patients = await db.patients.count_documents({})
    doctors = await db.doctors.count_documents({})
    caregivers = await db.caregivers.count_documents({})
    pending_consents = await db.consents.count_documents({"status": {"$in": ["pending", "requires_review"]}})
    alerts = await db.alerts.count_documents({})
    audit_logs = serialize_doc(await db.audit_logs.find({}).sort("timestamp", -1).to_list(100))
    system_health = serialize_doc(await db.system_health.find({}).sort("timestamp", -1).to_list(20))
    devices = serialize_doc(await db.devices.find({}).sort("lastSeen", -1).to_list(50))
    return {
        "summary": {
            "totalPatients": patients,
            "activeDoctors": doctors,
            "activeCaregivers": caregivers,
            "pendingConsentApprovals": pending_consents,
            "activeAlerts": alerts,
            "aiSystemStatus": "healthy",
            "apiHealth": "operational",
            "storageStatus": "stable",
        },
        "auditLogs": audit_logs,
        "systemHealth": system_health,
        "devices": devices,
        "consents": serialize_doc(await db.consents.find({}).sort("timestamp", -1).to_list(100)),
        "aiStatus": await ai_service.get_status(),
        "patients": serialize_doc(await db.patients.find({}, {"_id": 0}).to_list(50)),
        "doctors": serialize_doc(await db.doctors.find({}, {"_id": 0}).to_list(20)),
        "caregivers": serialize_doc(await db.caregivers.find({}, {"_id": 0}).to_list(50)),
        "alerts": serialize_doc(await db.alerts.find({}).sort("createdAt", -1).to_list(50)),
    }


@api_router.patch("/medications/{medication_id}")
async def update_medication(medication_id: str, request: MedicationUpdateRequest) -> dict[str, Any]:
    last_taken = request.lastTaken or datetime.now(timezone.utc).isoformat()
    updated = await db.medications.find_one_and_update(
        {"id": medication_id},
        {
            "$set": {
                "adherenceStatus": {"en": request.adherenceStatus, "de": request.adherenceStatus},
                "lastTaken": last_taken,
            }
        },
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Medication not found")
    await record_audit_log(request.actorRole, "updated_medication", updated.get("patientId"), medication_id, {"status": request.adherenceStatus, "note": request.note or ""})
    return serialize_doc(updated)


@api_router.patch("/consents/{consent_id}")
async def update_consent(consent_id: str, request: ConsentUpdateRequest) -> dict[str, Any]:
    updated = await db.consents.find_one_and_update(
        {"id": consent_id},
        {"$set": {"status": request.status, "expiresAt": request.expiresAt or None}},
        return_document=ReturnDocument.AFTER,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Consent not found")
    await record_audit_log(request.actorRole, "updated_consent", updated.get("patientId"), consent_id, {"status": request.status}, request.status)
    return serialize_doc(updated)


@api_router.post("/patients/{patient_id}/doctor-notes")
async def create_doctor_note(patient_id: str, request: DoctorNoteCreateRequest) -> dict[str, Any]:
    await get_patient_or_404(patient_id)
    doc = {
        "id": f"doctor-note-{uuid.uuid4()}",
        "patientId": patient_id,
        "doctorId": request.doctorId,
        "note": {"en": request.note, "de": request.note},
        "carePlan": {"en": request.carePlan or "", "de": request.carePlan or ""},
        "followUpRecommendation": {"en": request.followUpRecommendation or "", "de": request.followUpRecommendation or ""},
        "createdAt": request.createdAt,
    }
    await db.doctor_notes.insert_one(doc)
    await record_audit_log("doctor", "created_doctor_note", patient_id, doc["id"], {"doctorId": request.doctorId})
    return serialize_doc(doc)


@api_router.post("/ai/daily-summary")
async def daily_summary(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.DAILY_SUMMARY, request)


@api_router.post("/ai/recommendations")
async def recommendations(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.RECOMMENDATIONS, request)


@api_router.post("/ai/report")
async def report(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.REPORT, request)


@api_router.post("/ai/confusion-support")
async def confusion_support(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.CONFUSION_SUPPORT, request)


@api_router.post("/ai/memory-recall")
async def memory_recall(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.MEMORY_RECALL, request)


@api_router.post("/ai/clinical-observations")
async def clinical_observations(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.CLINICAL_OBSERVATIONS, request)


@api_router.post("/ai/emotional-explanation")
async def emotional_explanation(request: AIRequest) -> dict[str, Any]:
    return await run_ai_task(AITask.EMOTIONAL_EXPLANATION, request)


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    await seed_demo_data(db)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_db()
