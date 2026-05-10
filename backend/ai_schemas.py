from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


AI_DISCLAIMER_EN = "AI observations are not medical diagnosis. Medical decisions require doctor review."
AI_DISCLAIMER_DE = "KI-Beobachtungen sind keine medizinische Diagnose. Medizinische Entscheidungen erfordern eine ärztliche Prüfung."
VOICE_CONSENT_EN = "Voice cloning and memory reconstruction require explicit consent."
VOICE_CONSENT_DE = "Stimmrekonstruktion und Gedächtnisrekonstruktion erfordern eine ausdrückliche Einwilligung."


class AITask(str, Enum):
    DAILY_SUMMARY = "daily_summary"
    RECOMMENDATIONS = "recommendations"
    CLINICAL_OBSERVATIONS = "clinical_observations"
    REPORT = "report"
    MEMORY_RECALL = "memory_recall"
    CONFUSION_SUPPORT = "confusion_support"
    EMOTIONAL_EXPLANATION = "emotional_explanation"


class MedicalDisclaimer(BaseModel):
    ai_not_diagnosis_en: str = Field(default=AI_DISCLAIMER_EN)
    ai_not_diagnosis_de: str = Field(default=AI_DISCLAIMER_DE)
    consent_warning_en: str = Field(default=VOICE_CONSENT_EN)
    consent_warning_de: str = Field(default=VOICE_CONSENT_DE)
    doctor_review_required: bool = Field(default=False)


class SummaryLine(BaseModel):
    label: str
    detail: str


class DailySummaryOutput(BaseModel):
    title: str
    summary: str
    key_points: List[str]
    timeline_highlights: List[SummaryLine]
    reassurance_message: str
    caregiver_note: str
    disclaimers: MedicalDisclaimer


class RecommendationItem(BaseModel):
    priority: str
    reason: str
    suggested_action: str
    confidence: int = Field(ge=0, le=100)
    doctor_review_required: bool = False


class RecommendationsOutput(BaseModel):
    summary: str
    recommendations: List[RecommendationItem]
    care_focus: str
    disclaimers: MedicalDisclaimer


class ClinicalObservationItem(BaseModel):
    category: str
    summary: str
    confidence: int = Field(ge=0, le=100)
    recommended_follow_up: str
    doctor_review_required: bool = True


class ClinicalObservationsOutput(BaseModel):
    observation_summary: str
    observations: List[ClinicalObservationItem]
    trend_note: str
    disclaimers: MedicalDisclaimer = Field(default_factory=lambda: MedicalDisclaimer(doctor_review_required=True))


class ReportSection(BaseModel):
    heading: str
    bullets: List[str]


class ReportOutput(BaseModel):
    title: str
    period: str
    executive_summary: str
    sections: List[ReportSection]
    follow_up_recommendations: List[str]
    disclaimers: MedicalDisclaimer = Field(default_factory=lambda: MedicalDisclaimer(doctor_review_required=True))


class MemoryRecallOutput(BaseModel):
    response: str
    supporting_memories: List[str]
    memory_source_label: str
    reassurance: str
    disclaimers: MedicalDisclaimer


class ConfusionSupportOutput(BaseModel):
    response: str
    calming_steps: List[str]
    escalation_needed: bool
    safety_note: str
    disclaimers: MedicalDisclaimer


class EmotionalExplanationOutput(BaseModel):
    explanation: str
    calming_interventions: List[str]
    agitation_triggers: List[str]
    confidence: int = Field(ge=0, le=100)
    disclaimers: MedicalDisclaimer


class AIRequest(BaseModel):
    patientId: str
    locale: str = "en"
    useCache: bool = True
    context: dict
    period: Optional[str] = None


TASK_SCHEMA_MAP = {
    AITask.DAILY_SUMMARY: DailySummaryOutput,
    AITask.RECOMMENDATIONS: RecommendationsOutput,
    AITask.CLINICAL_OBSERVATIONS: ClinicalObservationsOutput,
    AITask.REPORT: ReportOutput,
    AITask.MEMORY_RECALL: MemoryRecallOutput,
    AITask.CONFUSION_SUPPORT: ConfusionSupportOutput,
    AITask.EMOTIONAL_EXPLANATION: EmotionalExplanationOutput,
}
