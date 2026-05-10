from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from ai_schemas import AITask
from ai_service import AIService
from db import client, db

SAMPLE_CONTEXT = {
    "patientName": "Ahmad Mansour",
    "primaryCaregiver": "Sarah Mansour",
    "timeOfDay": "evening",
    "question": "Where am I?",
    "location": "Home",
    "diagnosis": "Alzheimer's Disease",
    "stage": "Moderate",
    "events": [
        {"time": "08:30", "title": "Breakfast", "type": "meal"},
        {"time": "09:00", "title": "Medicine taken", "type": "medication"},
        {"time": "11:05", "title": "Asked 'Where am I?' twice", "type": "memory"},
        {"time": "14:00", "title": "Watched family video", "type": "memory"},
    ],
    "people": [
        {"name": "Sarah Mansour", "relationship": "Daughter", "calmingEffect": "High"},
        {"name": "Omar Mansour", "relationship": "Son", "calmingEffect": "Medium"},
    ],
    "riskScores": {
        "wandering": "medium",
        "fall": "low",
        "confusion": "moderate",
        "hydration": "low",
    },
    "period": "weekly",
}

TASKS = [
    AITask.DAILY_SUMMARY,
    AITask.RECOMMENDATIONS,
    AITask.CLINICAL_OBSERVATIONS,
    AITask.REPORT,
    AITask.MEMORY_RECALL,
    AITask.CONFUSION_SUPPORT,
    AITask.EMOTIONAL_EXPLANATION,
]


async def run() -> None:
    service = AIService()
    await db.ai_output_cache.delete_many({"patientId": "patient-ahmad-001"})
    await db.reports.delete_many({"patientId": "patient-ahmad-001"})
    await db.ai_observations.delete_many({"patientId": "patient-ahmad-001"})
    await db.ai_conversations.delete_many({"patientId": "patient-ahmad-001"})

    status = await service.get_status()
    print("AI STATUS:")
    print(json.dumps(status, indent=2))
    expect_real_provider = status["hasApiKey"] and not status["fallbackMode"]

    for task in TASKS:
        print(f"\n--- Testing {task.value} ---")
        first = await service.generate(
            task=task,
            payload=SAMPLE_CONTEXT,
            patient_id="patient-ahmad-001",
            locale="en",
            use_cache=True,
        )
        second = await service.generate(
            task=task,
            payload=SAMPLE_CONTEXT,
            patient_id="patient-ahmad-001",
            locale="en",
            use_cache=True,
        )

        assert first["task"] == task.value
        assert first["output"]
        assert second["cached"] is True
        if expect_real_provider:
            assert first["provider"] == status["executionProvider"], f"Expected real provider for {task.value}, got {first['provider']}"
            assert not first.get("fallbackUsed", False), f"Unexpected fallback for {task.value}: {first.get('fallbackReason')}"
        if task in {AITask.CLINICAL_OBSERVATIONS, AITask.REPORT}:
            assert first["output"]["disclaimers"]["doctor_review_required"] is True
        print(
            json.dumps(
                {
                    "firstProvider": first["provider"],
                    "firstCached": first["cached"],
                    "secondCached": second["cached"],
                    "generatedAt": first["generatedAt"],
                },
                indent=2,
            )
        )

    report_count = await db.reports.count_documents({"patientId": "patient-ahmad-001"})
    observation_count = await db.ai_observations.count_documents({"patientId": "patient-ahmad-001"})
    conversation_count = await db.ai_conversations.count_documents({"patientId": "patient-ahmad-001"})
    cache_count = await db.ai_output_cache.count_documents({"patientId": "patient-ahmad-001"})

    assert report_count >= 2
    assert observation_count >= 1
    assert conversation_count >= 2
    assert cache_count == len(TASKS)

    print("\nPersistence checks passed:")
    print(
        json.dumps(
            {
                "reports": report_count,
                "aiObservations": observation_count,
                "aiConversations": conversation_count,
                "cacheRecords": cache_count,
            },
            indent=2,
        )
    )

    client.close()


if __name__ == "__main__":
    asyncio.run(run())
