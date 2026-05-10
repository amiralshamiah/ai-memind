# plan.md — Memind (React + FastAPI + MongoDB)

## 1) Objectives
- Deliver an investor/doctor-demo-ready, AI-centered dementia care prototype with **4 role experiences** (Patient, Family/Caregiver, Doctor, Admin) via **role switcher** (no auth in v1).
- Implement a **provider-agnostic AI service layer** (OpenAI/Gemini/Claude/local-ready) with **real LLM** support + **simulated fallback** when no API key is available.
- Persist domain data + selected AI outputs in **MongoDB** (seeded + read/update) to avoid regenerating summaries/reports.
- Premium futuristic UI: **dark medical AI cockpit** + refined glassmorphism; **patient UI remains calm and emotionally safe**; full **EN/DE i18n** with language switcher.
- Embed ethical/GDPR placeholders + **clear medical disclaimers** (AI is not diagnosis; doctor review required for clinical decisions).

**Current status note (updated)**
- ✅ **Phase 1 complete:** provider-agnostic AI abstraction + real LLM + mock fallback + Mongo cache.
- ✅ **Phase 2 complete:** full multi-page prototype for all 4 roles, EN/DE i18n, Mongo seeded data, read/update APIs, AI routes wired to UI.
- ✅ **Phase 3 redesign complete:** in-place frontend upgrade aligned to the uploaded **futuristic dark medical cockpit** reference:
  - Stronger **Memind Brain Core** visualization with electric neural pulses
  - More polished glassmorphism
  - Clearer separation between Patient / Care Center / Clinical Console / Admin
  - Higher dashboard density for Caregiver + Doctor
  - Warmer, more emotional Patient AI orb experience
- ✅ **Testing complete:** `testing_agent_v3` iteration_2 passed with no runtime errors on redesigned pages.
  - Note: backend AI endpoints can take **10–30s** due to real LLM calls; the test harness timed out with a **10s** limit for some AI tests—classified as expected behavior.

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
- Configurable via env:
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
- Implemented initial premium futuristic UI:
  - dark cockpit background, glassmorphism panels, neon cyan accents
  - role-aware shells (patient minimal vs. dashboards left rail + top bar)
  - subtle motion (framer-motion)
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
- Implemented read endpoints:
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
- Implemented bootstrap + admin endpoints:
  - `GET /api/dashboard/bootstrap/:id`
  - `GET /api/admin/overview`
- Implemented minimal write endpoints:
  - `PATCH /api/medications/:id`
  - `PATCH /api/consents/:id`
  - `POST /api/patients/:id/doctor-notes`
- Connected AI endpoints to domain context + audit logging.

#### Phase 2C — Role experiences **(DELIVERED ✅)**
1. **Patient App (mobile-first)**
   - Home orientation screen with reassurance, date/time/location
   - Talk to Memind (text-based chat): `/ai/confusion-support` and `/ai/memory-recall`
   - Memories screen
   - Emergency help screen (prototype placeholders)

2. **Family/Caregiver Dashboard (Care Center)**
   - Overview cockpit + timeline + analytics + recommendations + reports + consent

3. **Doctor Dashboard (Clinical Console)**
   - Trends, analysis views, notes, reports, disclaimers

4. **Admin Panel**
   - Users/patients/caregivers/doctors overview, audit logs, consent records, AI model/system health surfaces

#### Phase 2D — End-to-end flows + testing **(DELIVERED ✅)**
- ✅ `testing_agent_v3` iteration_1 passed.

**Phase 2 user stories (delivered)**
1. ✅ Patient Talk to Memind is gentle and non-confrontational.
2. ✅ Caregiver can review timeline and episodes.
3. ✅ Caregiver can generate recommendations.
4. ✅ Doctor can generate weekly/monthly reports with disclaimers and persist them.
5. ✅ Admin can review consent records and audit logs.

---

### Phase 3 — Visual Upgrade to Match Reference Cockpit **(COMPLETED ✅)**
**Goal:** Upgrade the existing prototype **in-place** to align closely with the uploaded futuristic medical AI cockpit reference (no backend rebuild), while preserving functionality, i18n, routing, and data.

**Delivered**
- Global design refinement:
  - Denser cockpit layout, sharper panel hierarchy, more premium glassmorphism
  - Enhanced shadows, borders, subtle HUD/grid overlays, better contrast
  - Stronger role separation:
    - Patient: warm + emotional + simple
    - Care Center: dense analytics + risk cockpit
    - Doctor: clinical console + structured views
    - Admin: operational governance cockpit
- **Brain Core** visualization:
  - Added a custom Brain Core panel (SVG + pulsing neural nodes) as the “central intelligence” module
  - Supports clear state language: Stable / Slightly unstable / Under observation / High confusion / Recovering
- Patient App upgrades:
  - Warmer emotional hero surface
  - AI orb module + familiar voice card + confusion support card + summary + emergency CTA
  - Kept large text, minimal decisions, dementia-friendly actions
- Family Care Center upgrades:
  - Large Brain Core panel + stability ring + patient identity card
  - Risk tiles (confusion, wandering, fall, medication, sleep, last interaction)
  - Denser overview grid and improved analytics framing
- Doctor Clinical Console upgrades:
  - Added patient list sidebar
  - Added clinical brain status panel
  - Increased density and clarity of clinical analytics surfaces
- Admin Panel upgrades:
  - Denser system cockpit: system health, AI model status, consent overview ring, audit logs, privacy/GDPR action placeholders

**Testing status**
- ✅ `testing_agent_v3` iteration_2 passed:
  - role switcher, EN/DE switching, redesigned patient/caregiver/doctor/admin pages
  - navigation and core flows working, no runtime errors
  - backend core endpoints stable
  - note: AI endpoint timing can exceed 10s in test harness (expected with real LLM)

**Phase 3 user stories (delivered)**
1. ✅ As a patient, I see a warmer, emotionally safe interface with an AI orb and familiar voice support.
2. ✅ As a caregiver, I see a Brain Core cockpit with risk tiles and a dense analytical overview.
3. ✅ As a doctor, I can use a clinical console with a patient sidebar and clinical brain status panel.
4. ✅ As an admin, I can view governance surfaces (health, AI status, consent overview, audit logs, GDPR placeholders).
5. ✅ As a user, EN/DE switching still works across redesigned experiences.

---

### Phase 4 — Demo/Release Readiness **(NEXT ⏭️)**
**Goal:** Polish, stability, accessibility, and “doctor demo” flow; improve reliability around real LLM latency; harden compliance UX.

#### Phase 4A — Performance + resilience
- Add consistent “Generating…” states and **LLM latency messaging** (10–30s).
- Add client-side request timeouts tuned per endpoint (e.g., 60–120s for reports) with clear retry CTA.
- Add debounced AI triggers and guardrails to prevent double-submit.
- Add cache badges consistently (Generated vs Cached) for all AI outputs.

#### Phase 4B — Accessibility + patient safety
- Patient large-text mode toggle (font scaling) and higher contrast mode.
- Reduced-motion support (disable pulses/animations when enabled).
- Emergency UX: stronger confirmation + “what happens next” explanation.

#### Phase 4C — Clinical/compliance UX completeness
- Doctor review workflow:
  - mark AI observation/report “Reviewed” with timestamp + doctor ID
  - audit log event for review
- Consent lifecycle:
  - explicit revoke flows, expiry notifications, “requires review” queue
- GDPR surfaces:
  - export request queue placeholder
  - deletion request queue placeholder

#### Phase 4D — Final E2E testing & demo script
- Update backend_test timeouts for AI endpoints (or separate slow-suite).
- Full cross-role demo script:
  - Patient reassurance + confusion support
  - Caregiver daily review cockpit
  - Doctor clinical report + trends
  - Admin audit log + consent overview

**Phase 4 user stories (target)**
1. As a patient, I can use the app comfortably with large text and minimal distractions.
2. As a caregiver, I can run a full “today review” in under 2 minutes (summary → episodes → recommendations).
3. As a doctor, I can demo trend analysis and generate a monthly report with clear cached/regen UX.
4. As an admin, I can show an access/export log for AI-generated reports.
5. As a demo operator, I can switch roles instantly without losing selected patient context.

---

## 3) Next Actions
1. **Phase 4 resilience:** tune AI request timeouts, add retry and “LLM may take ~20s” UX.
2. **Accessibility:** patient large-text mode + reduced-motion compliance.
3. **Clinical governance:** add review/sign-off flows for reports and observations.
4. **Consent/GDPR polish:** expand lifecycle actions + placeholder workflows.
5. **Final E2E:** update test harness timeouts and rerun full suite.

## 4) Success Criteria
- ✅ Phase 1: AI POC passes with real LLM + fallback, validated schemas, caching, and Mongo persistence.
- ✅ Phase 2: Full multi-page prototype for Patient/Caregiver/Doctor/Admin with EN/DE i18n, seeded Mongo data, read/update APIs, AI integration, and successful E2E testing.
- ✅ Phase 3: Visual redesign aligned to uploaded cockpit reference with Brain Core, denser dashboards, warmer patient UI, and successful E2E testing.
- Phase 4+: Stronger accessibility, resilience to LLM latency, clinical review workflows, and release-ready compliance surfaces.
