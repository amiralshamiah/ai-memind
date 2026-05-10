from __future__ import annotations

import hashlib
import json
import os
import re
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Type

from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage
from pydantic import BaseModel

from ai_schemas import (
    AI_DISCLAIMER_DE,
    AI_DISCLAIMER_EN,
    AITask,
    ClinicalObservationsOutput,
    ConfusionSupportOutput,
    DailySummaryOutput,
    EmotionalExplanationOutput,
    MemoryRecallOutput,
    RecommendationsOutput,
    ReportOutput,
    TASK_SCHEMA_MAP,
)
from db import db, serialize_doc

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")


@dataclass
class ProviderExecution:
    provider: str
    model: str
    output_text: str
    fallback_used: bool = False
    fallback_reason: str | None = None


class AIProvider:
    provider_name: str = "base"
    model_name: str = "none"

    async def generate_json(self, system_prompt: str, user_prompt: str, schema_model: Type[BaseModel]) -> ProviderExecution:
        raise NotImplementedError


class EmergentUniversalProvider(AIProvider):
    def __init__(self, provider_name: str, model_name: str, api_key: str):
        self.provider_name = provider_name
        self.model_name = model_name
        self.api_key = api_key

    async def generate_json(self, system_prompt: str, user_prompt: str, schema_model: Type[BaseModel]) -> ProviderExecution:
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"memind-{self.provider_name}-{uuid.uuid4()}",
            system_message=system_prompt,
        ).with_model(self.provider_name, self.model_name)
        response = await chat.send_message(UserMessage(text=user_prompt))
        json_payload = extract_json_payload(response)
        schema_model.model_validate_json(json_payload)
        return ProviderExecution(provider=self.provider_name, model=self.model_name, output_text=json_payload)


class MockProvider(AIProvider):
    def __init__(self, provider_name: str = "mock", model_name: str = "memind-simulated"):
        self.provider_name = provider_name
        self.model_name = model_name

    async def generate_json(self, system_prompt: str, user_prompt: str, schema_model: Type[BaseModel]) -> ProviderExecution:
        payload = extract_context_payload(user_prompt)
        task = payload.get("task")
        locale = payload.get("locale", "en")
        mock_output = build_mock_output(task=task, payload=payload, locale=locale)
        validated = schema_model.model_validate(mock_output)
        return ProviderExecution(
            provider=self.provider_name,
            model=self.model_name,
            output_text=validated.model_dump_json(),
        )


class LocalStubProvider(MockProvider):
    def __init__(self):
        super().__init__(provider_name="local", model_name="local-ready-stub")


class AIService:
    def __init__(self) -> None:
        self.configured_provider = os.environ.get("AI_PROVIDER", "openai").lower()
        self.configured_model = os.environ.get("AI_MODEL", "gpt-5.2")
        self.force_mock = os.environ.get("AI_FORCE_MOCK", "false").lower() == "true"
        self.allow_error_fallback = os.environ.get("AI_ALLOW_ERROR_FALLBACK", "true").lower() == "true"
        self.api_key = os.environ.get("EMERGENT_LLM_KEY", "")
        self.cache_collection = db.ai_output_cache

    def _resolve_provider(self) -> AIProvider:
        if self.force_mock:
            return MockProvider(provider_name="mock", model_name="forced-fallback")
        if self.configured_provider == "local":
            return LocalStubProvider()
        if not self.api_key:
            return MockProvider(provider_name="mock", model_name="no-key-fallback")
        return EmergentUniversalProvider(
            provider_name=self.configured_provider,
            model_name=self.configured_model,
            api_key=self.api_key,
        )

    async def get_status(self) -> dict[str, Any]:
        provider = self._resolve_provider()
        return {
            "configuredProvider": self.configured_provider,
            "configuredModel": self.configured_model,
            "executionProvider": provider.provider_name,
            "executionModel": provider.model_name,
            "fallbackMode": provider.provider_name in {"mock", "local"} or self.force_mock or not self.api_key,
            "hasApiKey": bool(self.api_key),
            "lastGeneratedAt": await self._last_generated_at(),
        }

    async def _last_generated_at(self) -> str | None:
        doc = await self.cache_collection.find_one(sort=[("createdAt", -1)])
        serialized = serialize_doc(doc)
        return serialized.get("createdAt") if serialized else None

    async def generate(self, task: AITask, payload: dict[str, Any], patient_id: str, locale: str = "en", use_cache: bool = True) -> dict[str, Any]:
        schema_model = TASK_SCHEMA_MAP[task]
        cache_key = self._hash_payload(task, patient_id, payload, locale)
        if use_cache:
            cached_doc = await self.cache_collection.find_one({"task": task.value, "patientId": patient_id, "inputHash": cache_key})
            if cached_doc:
                serialized = serialize_doc(cached_doc)
                return {
                    "task": task.value,
                    "patientId": patient_id,
                    "cached": True,
                    "provider": serialized["provider"],
                    "model": serialized["model"],
                    "generatedAt": serialized["createdAt"],
                    "output": serialized["output"],
                }

        provider = self._resolve_provider()
        system_prompt = build_system_prompt(task, locale)
        user_prompt = build_user_prompt(task, payload, locale)

        try:
            execution = await provider.generate_json(system_prompt, user_prompt, schema_model)
        except Exception as exc:
            if not self.allow_error_fallback or isinstance(provider, MockProvider):
                raise
            fallback_provider = MockProvider(provider_name="mock", model_name=f"fallback-after-error:{provider.provider_name}")
            execution = await fallback_provider.generate_json(system_prompt, user_prompt, schema_model)
            execution.fallback_used = True
            execution.fallback_reason = str(exc)

        validated_output = schema_model.model_validate_json(execution.output_text)
        output_payload = validated_output.model_dump()

        cache_doc = {
            "task": task.value,
            "patientId": patient_id,
            "inputHash": cache_key,
            "provider": execution.provider,
            "model": execution.model,
            "locale": locale,
            "output": output_payload,
            "fallbackUsed": execution.fallback_used,
            "fallbackReason": execution.fallback_reason,
            "createdAt": datetime.now(timezone.utc),
        }
        await self.cache_collection.insert_one(cache_doc)
        await self._persist_task_artifacts(task, patient_id, locale, output_payload, execution)

        return {
            "task": task.value,
            "patientId": patient_id,
            "cached": False,
            "provider": execution.provider,
            "model": execution.model,
            "generatedAt": cache_doc["createdAt"].isoformat(),
            "fallbackUsed": execution.fallback_used,
            "fallbackReason": execution.fallback_reason,
            "output": output_payload,
        }

    async def _persist_task_artifacts(
        self,
        task: AITask,
        patient_id: str,
        locale: str,
        output_payload: dict[str, Any],
        execution: ProviderExecution,
    ) -> None:
        created_at = datetime.now(timezone.utc)
        base_doc = {
            "patientId": patient_id,
            "locale": locale,
            "provider": execution.provider,
            "model": execution.model,
            "createdAt": created_at,
            "output": output_payload,
        }

        if task in {AITask.DAILY_SUMMARY, AITask.REPORT}:
            await db.reports.insert_one(
                {
                    **base_doc,
                    "period": output_payload.get("period", task.value.replace("_", " ")),
                    "title": output_payload.get("title", task.value.replace("_", " ").title()),
                    "summary": output_payload.get("summary") or output_payload.get("executive_summary", ""),
                    "generatedBy": "ai-service",
                    "reviewedByDoctor": False,
                }
            )
        if task == AITask.CLINICAL_OBSERVATIONS:
            await db.ai_observations.insert_one(
                {
                    **base_doc,
                    "type": task.value,
                    "confidence": max((item.get("confidence", 0) for item in output_payload.get("observations", [])), default=0),
                    "summary": output_payload.get("observation_summary", ""),
                    "recommendation": output_payload.get("trend_note", ""),
                    "doctorReviewRequired": True,
                }
            )
        if task in {AITask.CONFUSION_SUPPORT, AITask.MEMORY_RECALL}:
            await db.ai_conversations.insert_one(
                {
                    **base_doc,
                    "type": task.value,
                    "preview": output_payload.get("response", ""),
                }
            )

    @staticmethod
    def _hash_payload(task: AITask, patient_id: str, payload: dict[str, Any], locale: str) -> str:
        normalized = json.dumps(
            {"task": task.value, "patientId": patient_id, "locale": locale, "payload": payload},
            ensure_ascii=False,
            sort_keys=True,
            default=str,
        )
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def build_system_prompt(task: AITask, locale: str) -> str:
    common = (
        "You are Memind, an AI support layer for dementia and Alzheimer's care. "
        "Return ONLY valid JSON matching the provided schema. Do not include markdown fences. "
        "Never present observations as medical diagnosis. Always keep tone calm, respectful, and safety-focused. "
        f"Preferred language for human-facing narrative: {'German' if locale == 'de' else 'English'}."
    )
    task_guidance = {
        AITask.DAILY_SUMMARY: "Create a human-friendly daily summary for family caregivers with reassuring tone.",
        AITask.RECOMMENDATIONS: "Create practical caregiver recommendations based on patterns and risk signals.",
        AITask.CLINICAL_OBSERVATIONS: "Create doctor-facing non-diagnostic clinical observations with confidence scores and doctor review flags.",
        AITask.REPORT: "Create a weekly or monthly structured report suitable for doctor review and family understanding.",
        AITask.MEMORY_RECALL: "Answer memory recall questions gently. Never harshly correct the patient. Label content as AI-generated or family-provided.",
        AITask.CONFUSION_SUPPORT: "Offer calming, grounding support. Never argue with the patient. Use gentle redirection.",
        AITask.EMOTIONAL_EXPLANATION: "Explain likely emotional triggers and calming interventions for caregivers using supportive language.",
    }
    return f"{common} {task_guidance[task]}"


def build_user_prompt(task: AITask, payload: dict[str, Any], locale: str) -> str:
    schema = TASK_SCHEMA_MAP[task].model_json_schema()
    enriched_payload = {"task": task.value, "locale": locale, **payload}
    return (
        "Generate structured JSON for the following Memind task.\n"
        f"Task: {task.value}\n"
        f"JSON schema: {json.dumps(schema, ensure_ascii=False)}\n"
        "Important rules:\n"
        f"- Include disclaimer strings exactly or equivalently matching these meanings: '{AI_DISCLAIMER_EN}' / '{AI_DISCLAIMER_DE}'.\n"
        "- For clinical or report outputs, set doctor_review_required to true.\n"
        "- For confusion support and memory recall, be gentle and non-confrontational.\n"
        "- Use realistic healthcare-safe language, not diagnosis.\n"
        f"Context JSON: {json.dumps(enriched_payload, ensure_ascii=False, default=str)}"
    )


def extract_json_payload(raw_text: str) -> str:
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    if cleaned.startswith("{") or cleaned.startswith("["):
        return cleaned
    match = re.search(r"(\{.*\}|\[.*\])", cleaned, flags=re.DOTALL)
    if not match:
        raise ValueError(f"Unable to parse JSON payload from model response: {raw_text}")
    return match.group(1)


def extract_context_payload(prompt: str) -> dict[str, Any]:
    marker = "Context JSON:"
    if marker not in prompt:
        return {}
    raw = prompt.split(marker, 1)[1].strip()
    return json.loads(raw)


def build_mock_output(task: str | None, payload: dict[str, Any], locale: str) -> dict[str, Any]:
    patient_name = payload.get("patientName", "Ahmad Mansour")
    caregiver_name = payload.get("primaryCaregiver", "Sarah Mansour")
    time_of_day = payload.get("timeOfDay", "morning")
    question = payload.get("question", "Where am I?")
    period = payload.get("period", "weekly")

    if task == AITask.DAILY_SUMMARY.value:
        return DailySummaryOutput(
            title=("Tageszusammenfassung" if locale == "de" else "Daily Summary"),
            summary=(
                f"{patient_name} remained mostly stable today with brief confusion during the {time_of_day}."
                if locale != "de"
                else f"{patient_name} blieb heute überwiegend stabil, mit kurzer Verwirrung am {time_of_day}."
            ),
            key_points=[
                "Breakfast completed",
                "Medication taken on time",
                f"Call with {caregiver_name} improved mood",
            ],
            timeline_highlights=[
                {"label": "08:30", "detail": "Breakfast and hydration completed"},
                {"label": "10:12", "detail": f"Spoke with {caregiver_name}"},
                {"label": "13:20", "detail": "Mild anxiety detected and resolved"},
            ],
            reassurance_message=(
                f"{patient_name} is safe at home and responded well to familiar voices."
                if locale != "de"
                else f"{patient_name} ist zu Hause sicher und reagierte gut auf vertraute Stimmen."
            ),
            caregiver_note=(
                "Noise reduction in the early evening may reduce confusion episodes."
                if locale != "de"
                else "Weniger Lärm am frühen Abend könnte Verwirrungsphasen reduzieren."
            ),
            disclaimers={"doctor_review_required": False},
        ).model_dump()

    if task == AITask.RECOMMENDATIONS.value:
        return RecommendationsOutput(
            summary=(
                "Three actions are likely to improve comfort and reduce confusion."
                if locale != "de"
                else "Drei Maßnahmen können Komfort verbessern und Verwirrung reduzieren."
            ),
            recommendations=[
                {
                    "priority": "high",
                    "reason": "Confusion rises between 18:00 and 20:00.",
                    "suggested_action": "Reduce noise and begin calm routine before sunset.",
                    "confidence": 88,
                    "doctor_review_required": False,
                },
                {
                    "priority": "high",
                    "reason": f"{caregiver_name}'s voice is the most successful calming cue.",
                    "suggested_action": f"Play or schedule a short {caregiver_name} voice check-in during high-risk periods.",
                    "confidence": 92,
                    "doctor_review_required": False,
                },
                {
                    "priority": "medium",
                    "reason": "Hydration and music correlate with calmer afternoons.",
                    "suggested_action": "Offer water and familiar music before periods of restlessness.",
                    "confidence": 76,
                    "doctor_review_required": False,
                },
            ],
            care_focus=(
                "Use familiar voice cues and reduce sensory overload."
                if locale != "de"
                else "Verwenden Sie vertraute Stimmen und reduzieren Sie sensorische Überlastung."
            ),
            disclaimers={"doctor_review_required": False},
        ).model_dump()

    if task == AITask.CLINICAL_OBSERVATIONS.value:
        return ClinicalObservationsOutput(
            observation_summary=(
                "Orientation questions increased slightly while safety remained stable."
                if locale != "de"
                else "Orientierungsfragen nahmen leicht zu, während die Sicherheit stabil blieb."
            ),
            observations=[
                {
                    "category": "orientation",
                    "summary": "Repeated location questions increased during late afternoon transitions.",
                    "confidence": 84,
                    "recommended_follow_up": "Review evening routine and assess environmental triggers.",
                    "doctor_review_required": True,
                },
                {
                    "category": "language",
                    "summary": "Name recall appears mildly slower compared with prior week.",
                    "confidence": 73,
                    "recommended_follow_up": "Monitor over the next 7 days and compare with speech patterns.",
                    "doctor_review_required": True,
                },
            ],
            trend_note=(
                "Observation only: patterns may warrant closer review but are not diagnostic."
                if locale != "de"
                else "Nur Beobachtung: Muster sollten überprüft werden, sind aber nicht diagnostisch."
            ),
        ).model_dump()

    if task == AITask.REPORT.value:
        return ReportOutput(
            title=("Weekly Clinical Report" if locale != "de" else "Wöchentlicher klinischer Bericht"),
            period=period,
            executive_summary=(
                f"{patient_name} showed generally stable daily functioning with mild evening confusion and strong response to family voice cues."
                if locale != "de"
                else f"{patient_name} zeigte insgesamt stabile Tagesfunktionen mit leichter abendlicher Verwirrung und guter Reaktion auf vertraute Familienstimmen."
            ),
            sections=[
                {"heading": "Cognitive trend", "bullets": ["Stability score remained near 72/100", "Question repetition rose modestly in evenings"]},
                {"heading": "Medication adherence", "bullets": ["Adherence remained above 90%", "No high-risk missed doses detected"]},
                {"heading": "Interventions", "bullets": [f"{caregiver_name}'s voice showed the strongest calming effect", "Direct correction should be avoided"]},
            ],
            follow_up_recommendations=[
                "Continue familiar voice interventions.",
                "Track evening transition triggers for 2 more weeks.",
                "Review observations with clinician before any care-plan change.",
            ],
        ).model_dump()

    if task == AITask.MEMORY_RECALL.value:
        return MemoryRecallOutput(
            response=(
                f"You are at home, {patient_name}. It is a calm {time_of_day}, and {caregiver_name} will check in with you."
                if locale != "de"
                else f"Sie sind zu Hause, {patient_name}. Es ist ein ruhiger {time_of_day}, und {caregiver_name} wird sich bei Ihnen melden."
            ),
            supporting_memories=[
                "Family photos from yesterday's visit",
                "Living room with wedding photo nearby",
            ],
            memory_source_label="AI-generated from family-provided and recorded data",
            reassurance=(
                "You are safe, and I am here with you."
                if locale != "de"
                else "Sie sind sicher, und ich bin bei Ihnen."
            ),
            disclaimers={"doctor_review_required": False},
        ).model_dump()

    if task == AITask.CONFUSION_SUPPORT.value:
        return ConfusionSupportOutput(
            response=(
                f"It is okay. You are safe at home, {patient_name}. Tell me what feels familiar right now."
                if locale != "de"
                else f"Alles ist gut. Sie sind zu Hause sicher, {patient_name}. Erzählen Sie mir, was Ihnen gerade vertraut vorkommt."
            ),
            calming_steps=[
                "Lower nearby noise",
                f"Play {caregiver_name}'s voice message",
                "Show a familiar family photo",
            ],
            escalation_needed=False,
            safety_note=(
                f"Respond gently to the phrase '{question}' and avoid direct correction."
                if locale != "de"
                else f"Reagieren Sie sanft auf den Satz '{question}' und vermeiden Sie direkte Korrekturen."
            ),
            disclaimers={"doctor_review_required": False},
        ).model_dump()

    return EmotionalExplanationOutput(
        explanation=(
            "The patient appears calmer when familiar voices and visual anchors are used, while noise and fatigue increase stress."
            if locale != "de"
            else "Der Patient wirkt ruhiger bei vertrauten Stimmen und visuellen Ankern, während Lärm und Müdigkeit Stress erhöhen."
        ),
        calming_interventions=[
            f"{caregiver_name}'s voice",
            "Wedding photo",
            "Low-volume old music",
        ],
        agitation_triggers=[
            "Evening noise",
            "Fatigue after long activity",
            "Direct contradiction",
        ],
        confidence=81,
        disclaimers={"doctor_review_required": False},
    ).model_dump()
