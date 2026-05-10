# plan.md — Memind (React + FastAPI + MongoDB)

## 1) Objectives
- Deliver an investor/doctor-demo-ready, AI-centered dementia care prototype with **4 role experiences** (Patient, Family/Caregiver, Doctor, Admin) via **role switcher** (no auth in v1).
- Implement a **provider-agnostic AI service layer** (OpenAI/Gemini/Claude/local-ready) with **real LLM** support + **simulated fallback** when no API key is available.
- Persist domain data + selected AI outputs in **MongoDB** (seeded + read/update) to avoid regenerating summaries/reports.
- Premium futuristic UI (dark glassmorphism + neon accents) + dementia-friendly patient UI; full **EN/DE i18n** with language switcher.
- Embed ethical/GDPR placeholders + **clear medical disclaimers** (AI is not diagnosis; doctor review required for clinical decisions).

**Current status note**
- Phase 1 (Core AI POC) has been completed successfully (details in Phase 1 section). The project is ready to proceed to Phase 2 full app development.

## 2) Implementation Steps

### Phase 1 — Core AI POC (Isolation) **(COMPLETED ✅)**
**Goal:** Prove end-to-end: prompt → provider abstraction → LLM call (or fallback) → structured JSON → Mongo persistence → retrieval.

**Completed work**
- Implemented backend **provider-agnostic AI service layer**:
  - `AIProvider` interface with JSON generation.
  - `EmergentUniversalProvider` (provider+model configurable) using `EMERGENT_LLM_KEY`.
  - `MockProvider` fallback mode for no-key demos and error fallback.
- Implemented **task router** for required v1 LLM tasks:
  - daily summaries
  - caregiver recommendations
  - doctor-facing clinical observations
  - weekly/monthly reports
  - memory recall responses
  - confusion support responses
  - emotional response explanations
- Implemented **Pydantic schemas** per task + enforced medical disclaimer fields.
- Implemented **Mongo cache** (`ai_output_cache`) keyed by hash of task+payload+locale.
- Implemented **artifact persistence** to Mongo where useful:
  - `reports` persisted for daily/report tasks
  - `ai_observations` persisted for clinical observations
  - `ai_conversations` persisted for memory recall + confusion support
- Implemented FastAPI endpoints:
  - `GET /api/ai/status`
  - `POST /api/ai/daily-summary`
  - `POST /api/ai/recommendations`
  - `POST /api/ai/clinical-observations`
  - `POST /api/ai/report`
  - `POST /api/ai/memory-recall`
  - `POST /api/ai/confusion-support`
  - `POST /api/ai/emotional-explanation`
- Added isolated test harness: `/app/backend/scripts/test_ai_core.py`.

**Runtime model choice (current default)**
- Default runtime model set to **OpenAI `gpt-5-nano`** for **budget-efficient, reliable execution** during iterative development and demos.
- Provider/model remain fully configurable via environment variables:
  - `AI_PROVIDER` (e.g., `openai`, later `anthropic`, `gemini`, `local`)
  - `AI_MODEL` (e.g., `gpt-5-nano`, `gpt-5.1`, etc.)
  - `AI_FORCE_MOCK=true` to force fallback mode for safe demos

**Validation results**
- All 7 AI tasks executed successfully with **real provider** (`openai/gpt-5-nano`).
- Cache hit/miss behavior passed.
- Mongo persistence checks passed:
  - `reports`, `ai_observations`, `ai_conversations`, and `ai_output_cache` populated as expected.

**Phase 1 user stories (delivered)**
1. ✅ As a developer, I can switch AI provider via env/config without changing UI components.
2. ✅ As a system, I fall back to simulated AI when no API key exists so demos never break.
3. ✅ As a doctor, I receive AI observations in a structured format with a visible non-diagnostic disclaimer.
4. ✅ As a caregiver, I can request a daily summary and get a cached result if already generated.
5. ✅ As an admin, I can view AI provider status (configured / fallback) and last generation timestamps.

---

### Phase 2 — V1 App Development (Full-stack MVP, no auth) **(NEXT ⏭️)**
**Goal:** Build complete navigation + core pages for all roles, backed by Mongo seeded data + AI endpoints (already available).

#### Phase 2A — Frontend foundation + design system
- **Routing + Role switcher**
  - Landing page with role tiles: Patient / Caregiver / Doctor / Admin
  - Persist selected role + selected patient in app state
- **i18n (EN/DE) baseline**
  - JSON dictionaries: `en.json`, `de.json`
  - Language switcher visible in all dashboards (and patient app where appropriate)
  - Rule: no hardcoded UI strings in components
- **Design guidelines (implementation-ready)**
  - Dark-mode default, glass cards, subtle glow accents (blue/violet), soft gradients
  - Patient UI: calm, minimal, large typography, high-contrast, minimal decisions, safe language
  - Caregiver UI: cinematic command center; status rings, timeline, recommendations, alerts
  - Doctor UI: clinical console; charts, trend panels, structured observations with disclaimers
  - Admin UI: clean ops-console; tables, audit logs, consent records
- **Reusable UI kit**
  - GlassCard, StatRing, TrendSparkline, Timeline, Badge (cached/generated), DisclaimerBanner
  - Loading/skeleton states and error boundaries for AI calls

#### Phase 2B — Mongo domain models + seed data (read/update)
- Implement models/collections (seeded with realistic narrative around one or more patients, e.g., Ahmad):
  - Patient, Caregiver, Doctor
  - Event (timeline), Episode (confusion/behavior), Medication (schedule + adherence)
  - Memory, Person (relationships)
  - Consent, RiskScore, AuditLog
  - Reports, AIObservation, AIConversation (already partially supported by Phase 1 persistence)
- Implement seed script + ensure deterministic IDs for demos.
- Add read endpoints (from spec) + minimal update flows:
  - caregiver: medication adherence update, episode tagging
  - doctor: notes / care plan updates
  - admin: consent toggles, device placeholders

#### Phase 2C — Role experiences (minimum complete, non-empty)
1. **Patient App (mobile-first)**
   - Home: greeting (“Good morning, Ahmad. You are safe.”), date/time/location
   - “Talk to Memind” chat UI backed by AI endpoints:
     - memory recall (`/ai/memory-recall`)
     - confusion support (`/ai/confusion-support`)
   - Today summary page (cached AI daily summary)
   - Memories page (cards)
   - My Family page (cards + call placeholder)
   - Emergency page (caregiver/emergency placeholders)
   - Safety requirement: gentle language, non-confrontational responses

2. **Family/Caregiver Dashboard (Care Center)**
   - Overview cockpit:
     - patient identity card
     - cognitive stability score (seeded + trend)
     - risk radar widgets
     - today timeline
     - recommendations preview
   - Pages:
     - Live Patient Monitor (simulated refresh)
     - Daily Timeline (filters)
     - Emotional analytics (charts)
     - Confusion episodes + AI explanation
     - Medication & daily care (adherence)
     - AI recommendations (generate + cached history)
     - AI reports list/view (daily/weekly)
     - Permissions & consent (read/update placeholders)

3. **Doctor Dashboard (Clinical Console)**
   - Patient list sidebar + selected patient overview
   - Pages:
     - Cognitive Trend Analysis (charts)
     - Speech & Language Analysis (simulated analytics + stored observations)
     - Behavioral episode review
     - Notes & care plan (update)
     - Clinical observations (AI) with prominent disclaimer
     - Report generator (weekly/monthly) using cached persistence

4. **Admin Panel**
   - Sections: Users, Patients, Doctors, Caregivers, Devices, Alerts, Audit Logs, AI Model Status, Consent Records, System Health
   - Include audit events when:
     - AI report generated
     - report viewed/export placeholder
     - consent toggled

#### Phase 2D — End-to-end flows + testing
- **E2E demo flows to guarantee**
  1. Caregiver generates daily summary → reload shows cached badge
  2. Doctor generates weekly report → stored in `reports` and visible in UI
  3. Patient asks orientation question → confusion support response displayed
  4. Caregiver reviews clinical observations → disclaimer visible
  5. Language switch EN↔DE across all major screens
- **Testing roadmap**
  - Backend: pytest smoke tests for key endpoints; regression test for cache hit/miss
  - Frontend: route-level smoke checks; i18n key coverage check
  - Manual acceptance checklist per role (no broken pages; no empty placeholder-only views)

**Phase 2 user stories (target)**
1. As a patient, I can press “Talk to Memind” and get a gentle orientation response that never argues.
2. As a caregiver, I can view today’s timeline and open a confusion episode detail with AI explanation.
3. As a caregiver, I can request AI recommendations and see actionable, safety-focused steps.
4. As a doctor, I can generate a weekly report with clear disclaimers and avoid regeneration via cached artifacts.
5. As an admin, I can review consent records and see an audit log of report generations.

---

### Phase 3 — Feature Expansion + Hardening
**Goal:** Make it demo-resilient, deeper analytics, better data write flows, and more AI persistence.
- AI improvements:
  - Locale-aware prompt templates (EN/DE)
  - Safer outputs: red-flag detection (wandering, self-harm language) → banner: “Contact caregiver/doctor/emergency”
  - Better caching semantics (time windows: daily/weekly/monthly)
  - Store more outputs as first-class domain artifacts (reports, observations)
- Data interactions:
  - Medication adherence modeling, correlation views
  - Episode creation + tagging; link AI outputs to events/episodes
  - Consent flows for location/voice/report sharing (UI + persistence)
- UI depth:
  - AI Memory Graph visualization
  - Printable report view + export placeholder + audit log event
  - Admin: AI model status shows provider/model, latency sample, last errors
- Testing:
  - Broader API tests; snapshot tests for i18n keys; regression for AI fallback/caching

**Phase 3 user stories**
1. As a caregiver, I can mark a medication as taken and see it reflected in timeline and adherence chart.
2. As a doctor, I can add a care plan note and see it alongside AI observations.
3. As a caregiver, I can view a “Memory Graph” connecting people, places, and memories.
4. As an admin, I can toggle AI fallback mode (force-mock) for safe demos.
5. As a user, I can switch EN/DE and all UI labels (including disclaimers) update without broken strings.

---

### Phase 4 — Demo/Release Readiness
**Goal:** Polish, stability, and “doctor demo” flow.
- Performance + resilience: debounced AI calls, retries, timeouts, safe error toasts
- Accessibility: large text mode for patient, high-contrast, keyboard navigation
- Compliance UX: clearer consent flows, export/delete placeholders, audit log completeness
- Final E2E testing pass across roles + devices + languages

**Phase 4 user stories**
1. As a patient, I can use the app comfortably with large text and minimal distractions.
2. As a caregiver, I can run a full “today review” in under 2 minutes (summary → episodes → recommendations).
3. As a doctor, I can demo trend analysis and generate a monthly report without waiting on regeneration.
4. As an admin, I can show auditors an access/export log for AI-generated reports.
5. As a demo operator, I can switch roles instantly without losing selected patient context.

## 3) Next Actions
1. **Phase 2 scaffolding:** build frontend routing (role switcher) + base layouts per role; add EN/DE i18n structure.
2. **Domain modeling:** implement Mongo models + seed script for patients/events/episodes/memories/medications/consents.
3. **API expansion:** implement GET endpoints from spec + minimal update endpoints (notes, adherence, consent toggles).
4. **Connect AI to UI:** wire caregiver + doctor report pages to `/api/ai/*` with cached badges and stored history.
5. **E2E demo checklist:** run role-by-role acceptance tests + automated backend smoke tests.

## 4) Success Criteria
- ✅ Phase 1: AI POC passes with real LLM + fallback, validated schemas, caching, and Mongo persistence.
- Phase 2+: All 4 role experiences are navigable with no broken pages; patient app is mobile-usable; dashboards are desktop/tablet-optimized.
- EN/DE switcher covers all visible UI strings; no hardcoded English in components.
- Mongo seeded data supports realistic demo narratives; read + key update flows work.
- Clinical outputs show prominent non-diagnostic disclaimers; consent/audit placeholders exist and are visible.
- End-to-end demo: generate daily summary + recommendations + clinical observation + weekly report; reload shows cached artifacts and stored history.