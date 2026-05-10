from __future__ import annotations

import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai_schemas import AIRequest, AITask
from ai_service import AIService
from db import close_db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("memind")

app = FastAPI(title="Memind API", version="0.1.0")
api_router = APIRouter(prefix="/api")
ai_service = AIService()


@api_router.get("/")
async def root() -> dict:
    return {"message": "Memind API online"}


@api_router.get("/ai/status")
async def ai_status() -> dict:
    return await ai_service.get_status()


async def run_ai_task(task: AITask, request: AIRequest) -> dict:
    try:
        return await ai_service.generate(
            task=task,
            payload={**request.context, "period": request.period},
            patient_id=request.patientId,
            locale=request.locale,
            use_cache=request.useCache,
        )
    except Exception as exc:
        logger.exception("AI task failed", extra={"task": task.value})
        raise HTTPException(status_code=500, detail=f"AI task {task.value} failed: {exc}") from exc


@api_router.post("/ai/daily-summary")
async def daily_summary(request: AIRequest) -> dict:
    return await run_ai_task(AITask.DAILY_SUMMARY, request)


@api_router.post("/ai/recommendations")
async def recommendations(request: AIRequest) -> dict:
    return await run_ai_task(AITask.RECOMMENDATIONS, request)


@api_router.post("/ai/report")
async def report(request: AIRequest) -> dict:
    return await run_ai_task(AITask.REPORT, request)


@api_router.post("/ai/confusion-support")
async def confusion_support(request: AIRequest) -> dict:
    return await run_ai_task(AITask.CONFUSION_SUPPORT, request)


@api_router.post("/ai/memory-recall")
async def memory_recall(request: AIRequest) -> dict:
    return await run_ai_task(AITask.MEMORY_RECALL, request)


@api_router.post("/ai/clinical-observations")
async def clinical_observations(request: AIRequest) -> dict:
    return await run_ai_task(AITask.CLINICAL_OBSERVATIONS, request)


@api_router.post("/ai/emotional-explanation")
async def emotional_explanation(request: AIRequest) -> dict:
    return await run_ai_task(AITask.EMOTIONAL_EXPLANATION, request)


app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_event() -> None:
    await close_db()
