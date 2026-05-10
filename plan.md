# plan.md — Memind (React + FastAPI + MongoDB)

## 1) Objectives
- Deliver an investor/doctor-demo-ready, AI-centered dementia care prototype with **4 role experiences** (Patient, Family/Caregiver, Doctor, Admin) via **role switcher** (no auth in v1).
- Implement a **provider-agnostic AI service layer** (OpenAI/Gemini/Claude/local-ready) with **real LLM** support + **simulated fallback** when no API key is available.
- Persist domain data + selected AI outputs in **MongoDB** (seeded + read/update) to avoid regenerating summaries/reports.
- Premium futuristic UI (dark glassmorphism + neon accents) + dementia-friendly patient UI; full **EN/DE i18n** with language switcher.
- Embed ethical/GDPR placeholders + **clear medical disclaimers** (AI is not diagnosis; doctor review required for clinical decisions).

**Current status note (updated)**
- ✅ **Phase 1 complete:** provider-agnostic AI abstraction + real LLM + mock fallback + Mongo cache.
- ✅ **Phase 2 complete:** full multi-page prototype for all 4 roles, EN/DE i18n, Mongo seeded data, read/update APIs, AI routes wired to UI, and premium futuristic UI.
- ✅ **Testing complete:** `testing_agent_v3` iteration_1 passed with no backend or frontend bugs; no runtime errors on role pages.

---

## 2) Implementation Steps

### Phase 1 — Core AI POC (Isolation) **(COMPLETED ✅)**
**Goal:** Prove end-to-end: prompt → provider abstraction → LLM call (or fallback) → structured JSON → Mongo persistence → retrieval.

**Delivered**
- Backend **provider-agnostic AI service layer**:
  - `AIProvider` interface
  - `EmergentUniversalProvider` (provider+model configurable) using `EMERGENT_LLM_KEY`
  - `MockProvider` fallback mode for no-key demos and error fallback
- Required v1 LLM tasks implemented:
  - daily summaries
  - caregiver recommendations
  - doctor-facing clinical observations
  - weekly/monthly reports
  - memory recall responses
  - confusion support responses
  - emotional response explanations
- Pydantic schemas per task + disclaimer fields enforced.
- Mongo cache collection: `ai_output_cache` keyed by hashed inputs.
- Persistence of AI artifacts to Mongo:
  - `reports` for daily/report
  - `ai_observations` for clinical observations
  - `ai_conversations` for memory recall + confusion support
- FastAPI AI endpoints:
  - `GET /api/ai/status`
  - `POST /api/ai/daily-summary`
  - `POST /api/ai/recommendations`
  - `POST /api/ai/clinical-observations`
  - `POST /api/ai/report`
  - `POST /api/ai/memory-recall`
  - `POST /api/ai/confusion-support`
  - `POST /api/ai/emotional-explanation`
- Isolated test harness: `/app/backend/scripts/test_ai_core.py`

**Runtime model choice (current default)**
- Default model: **OpenAI `gpt-5-nano`** for budget-efficient, reliable execution.
- Still fully configurable via env:
  - `AI_PROVIDER` (e.g., `openai`, later `anthropic`, `gemini`, `local`)
  - `AI_MODEL` (e.g., `gpt-5-nano`, `gpt-5.1`, …)
  - `AI_FORCE_MOCK=true` to force fallback for safe demos

**Validation results**
- All 7 AI tasks execute successfully with **real provider** (`openai/gpt-5-nano`).
- Cache hit/miss behavior passed.
- Mongo persistence checks passed (`reports`, `ai_observations`, `ai_conversations`, `ai_output_cache`).

**Phase 1 user stories (delivered)**
1. ✅ As a developer, I can switch AI provider via env/config without changing UI components.
2. ✅ As a system, I fall back to simulated AI when no API key exists so demos never break.
3. ✅ As a doctor, I receive AI observations in structured format with a visible non-diagnostic disclaimer.
4. ✅ As a caregiver, I can request a daily summary and get a cached result if already generated.
5. ✅ As an admin, I can view AI provider status (configured/fallback) and last generation timestamps.

---

### Phase 2 — V1 App Development (Full-stack MVP, no auth) **(COMPLETED ✅)**
**Goal:** Build complete navigation + core pages for all roles, backed by Mongo seeded data + AI endpoints.

#### Phase 2A — Frontend foundation + design system **(DELIVERED ✅)**
- Implemented **role switcher** landing page with AI live/fallback status and patient selection.
- Implemented **EN/DE i18n structure**:
  - `src/i18n/en.json`, `src/i18n/de.json`
  - `I18nProvider` + `useI18n()` with `t()` + `localizeText()` helper for seeded `{en,de}` objects
  - Language switcher in all experiences
- Implemented premium futuristic UI per `/app/design_guidelines.md`:
  - dark cockpit background, glassmorphism panels, subtle neon cyan accents
  - role-aware shells (patient minimal vs. dashboards left rail + top bar)
  - motion (framer-motion) used subtly
- Built reusable UI components:
  - `AppShell` (role-aware)
  - `GlassPanel`
  - `AiStatusRing`
  - `EthicsConsentBanner`
  - `PatientBottomNav`
  - `ChatComposer`

#### Phase 2B — Mongo domain models + seed data + REST APIs **(DELIVERED ✅)**
- Seeded Mongo collections with deterministic IDs + realistic narrative data:
  - patients, caregivers, doctors
  - events, episodes, medications
  - people, memories
  - reports, ai_observations
  - consents, risk_scores
  - doctor_notes, audit_logs
  - devices, alerts, system_health
- Implemented read endpoints (spec-aligned + needed extras):
  - `GET /api/patients`
  - `GET /api/patients/:id`
  - `GET /api/patients/:id/events`
  - `GET /api/patients/:id/memories`
  - `GET /api/patients/:id/people`
  - `GET /api/patients/:id/episodes`
  - `GET /api/patients/:id/medications`
  - `GET /api/patients/:id/reports`
  - `GET /api/patients/:id/ai-observations`
  - `GET /api/patients/:id/risk-scores`
  - `GET /api/patients/:id/consents`
  - `GET /api/patients/:id/doctor-notes`
- Implemented bootstrap and admin endpoints:
  - `GET /api/dashboard/bootstrap/:id` (single-call UI bundle)
  - `GET /api/admin/overview`
- Implemented write endpoints (v1 minimal update support):
  - `PATCH /api/medications/:id` (adherence updates)
  - `PATCH /api/consents/:id` (consent toggles)
  - `POST /api/patients/:id/doctor-notes` (doctor note creation)
- Connected AI endpoints to domain context and audit logging:
  - AI endpoints build context from Mongo (patient + events + episodes + meds + risk)
  - audit entries inserted for AI generation actions

#### Phase 2C — Role experiences **(DELIVERED ✅)**
1. **Patient App (mobile-first)**
   - Home orientation screen with reassurance, date/time/location
   - Talk to Memind (text-based chat): uses `/ai/confusion-support` or `/ai/memory-recall`
   - Memories screen with media cards
   - Emergency help screen (prototype placeholders)
   - Dementia-friendly tone: gentle, non-confrontational

2. **Family/Caregiver Dashboard (Care Center)**
   - Overview cockpit: identity, stability ring, risk metrics, timeline preview
   - Sections/pages delivered:
     - Daily Timeline with filters
     - Memory Graph cards
     - People & Relationships
     - Memories library
     - Emotional analytics with charts
     - Confusion episodes list
     - Safety & location view + alerts
     - Medication & daily care + adherence update
     - AI recommendations (generate)
     - AI reports list
     - Permissions & consent toggles

3. **Doctor Dashboard (Clinical Console)**
   - Patient selection + clinical status ring
   - Sections/pages delivered:
     - Cognitive trends chart
     - Speech & language analysis chart
     - Behavioral episode review
     - Intervention effectiveness chart
     - Medication correlation chart
     - Doctor notes & care plan (create note)
     - AI reports list
   - AI observations/report generation wired with disclaimers

4. **Admin Panel**
   - Overview metrics + AI model status + system health
   - Sections/pages delivered:
     - Users listing (patients + doctors/caregivers)
     - Audit logs
     - AI model status
     - Consent records
     - System health + devices list
   - Governance-oriented visuals and disclaimers present

#### Phase 2D — End-to-end flows + testing **(DELIVERED ✅)**
**Guaranteed demo flows (verified)**
1. Caregiver generates daily summary → cached behavior supported via backend cache.
2. Doctor generates weekly/monthly report → persisted to Mongo `reports`.
3. Patient asks orientation question → confusion support response returned and displayed.
4. Clinical outputs show prominent non-diagnostic disclaimers.
5. Language switch EN↔DE across major screens.

**Testing status**
- ✅ `testing_agent_v3` iteration_1: passed all checks
  - role switching, EN/DE switching, patient AI flow, caregiver actions, doctor actions, admin navigation
  - backend APIs and AI endpoints respond correctly
  - no runtime errors on role pages

**Phase 2 user stories (delivered)**
1. ✅ As a patient, I can press “Talk to Memind” and get a gentle orientation response that never argues.
2. ✅ As a caregiver, I can view the timeline and review confusion episodes.
3. ✅ As a caregiver, I can request AI recommendations and get actionable steps.
4. ✅ As a doctor, I can generate weekly/monthly reports with disclaimers and persist them.
5. ✅ As an admin, I can review consent records and see audit logs.

---

### Phase 3 — Feature Expansion + Hardening **(NEXT ⏭️)**
**Goal:** Make it demo-resilient, deepen analytics and write flows, refine AI persistence/caching semantics, and improve accessibility + release readiness.

#### Phase 3A — AI quality, safety, and persistence refinements
- **Prompt templates per task** (versioned) and locale-aware prompting.
- **Time-window caching semantics**:
  - daily summaries cache per date
  - weekly/monthly reports cache per period window
  - recommendations cache with TTL and/or “changes detected” invalidation
- **Red-flag detection + escalation banner**:
  - wandering risk spikes, unsafe exit attempts, self-harm language → caregiver/doctor/emergency guidance
- Persist more AI outputs as first-class artifacts:
  - link AI outputs to events/episodes (foreign keys)
  - store model/provider/latency metadata and input summary (auditability)

#### Phase 3B — Deeper write flows (caregiver/doctor/admin)
- Caregiver:
  - create/edit episodes (tag triggers, interventions, outcomes)
  - richer medication adherence (per-dose logs)
  - add caregiver notes to timeline
- Doctor:
  - structured care plans and follow-up schedules
  - “reviewed” workflow for AI observations/reports (doctor sign-off)
- Admin:
  - consent lifecycle actions (approve/deny/revoke)
  - audit log filtering + export placeholder

#### Phase 3C — Analytics depth + charting
- Caregiver:
  - emotion stability trend over time, confusion episode frequency chart
  - safety timeline correlations (noise/sleep/hydration proxies)
- Doctor:
  - cognitive domain trend charts (orientation, memory recall, language)
  - intervention effectiveness metrics with deltas
  - medication correlation views with better labeling and confidence

#### Phase 3D — UX hardening + accessibility polish
- Patient:
  - large-text mode toggle, stronger focus/contrast checks
  - simplified “Today” page and clearer emergency confirmations
- Dashboards:
  - improved loading/skeleton states for slow LLM calls
  - consistent “Generated at / Cached” badges everywhere
  - error boundary components and safe fallback messaging

**Phase 3 user stories (target)**
1. As a caregiver, I can create and tag a confusion episode and link it to interventions.
2. As a doctor, I can review and sign off AI observations and reports (review status persisted).
3. As a caregiver, I can see trends: confusion frequency, emotional stability, and safety risk trajectories.
4. As an admin, I can manage consent lifecycle (grant/revoke) and see consistent audit trails.
5. As a patient, I can enable large-text mode and navigate safely with minimal cognitive load.

---

### Phase 4 — Demo/Release Readiness **(FUTURE)**
**Goal:** Polish, stability, and “doctor demo” flow, plus compliance UX completeness.
- Performance + resilience: retries/timeouts, safe error toasts, debounced AI triggers, caching UX.
- Accessibility: WCAG AA checks; keyboard navigation for dashboards; reduced motion support.
- Compliance UX: clearer consent flows, export/delete placeholders, audit log completeness.
- Final E2E test pass across roles + devices + languages.

**Phase 4 user stories (target)**
1. As a patient, I can use the app comfortably with large text and minimal distractions.
2. As a caregiver, I can run a full “today review” in under 2 minutes (summary → episodes → recommendations).
3. As a doctor, I can demo trend analysis and generate a monthly report without regeneration delays.
4. As an admin, I can show auditors an access/export log for AI-generated reports.
5. As a demo operator, I can switch roles instantly without losing selected patient context.

---

## 3) Next Actions
1. **Phase 3 AI hardening:** implement time-window cache semantics + locale-aware prompt templates.
2. **Safety escalation:** add red-flag detection and escalation UI banners (caregiver + doctor).
3. **Write flows:** add episode creation/tagging + richer medication logs + doctor review workflow.
4. **Analytics depth:** expand charts and correlations; improve clinical console precision.
5. **Accessibility + resilience:** patient large-text mode, improved loading states for real LLM calls, error boundaries.

## 4) Success Criteria
- ✅ Phase 1: AI POC passes with real LLM + fallback, validated schemas, caching, and Mongo persistence.
- ✅ Phase 2: Full multi-page prototype for Patient/Caregiver/Doctor/Admin with EN/DE i18n, seeded Mongo data, read/update APIs, AI integration, and successful E2E testing.
- Phase 3+: Improved safety escalation behavior, richer write flows, deeper analytics, and stronger accessibility.
- Demo readiness: generate daily summary + recommendations + clinical observation + weekly report; reload shows cached artifacts and stored history; disclaimers and consent visibility are prominent across roles.
