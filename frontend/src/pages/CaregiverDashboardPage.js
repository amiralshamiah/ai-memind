import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  BellRing,
  BrainCircuit,
  ChartArea,
  Clock3,
  HeartPulse,
  MapPinned,
  MoonStar,
  Network,
  Pill,
  ShieldAlert,
  ShieldPlus,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "../components/ui/sonner";
import { AppShell } from "../components/memind/AppShell";
import { AiStatusRing, BrainCorePanel, EthicsConsentBanner, GlassPanel, MemoryGraphNetwork, RiskCard } from "../components/memind/Primitives";
import { fetchDashboardBundle, generateAiTask, updateConsent, updateMedication } from "../lib/api";
import { useI18n } from "../lib/i18n";

const riskPalette = ["#00D4FF", "#3DDC97", "#FFB020", "#FF6B6B", "#8C78FF", "#5EA8FF"];

export default function CaregiverDashboardPage({ patients, selectedPatientId, setSelectedPatientId }) {
  const location = useLocation();
  const section = location.pathname.split("/")[2] || "overview";
  const { t, localizeText, formatDateTime, language } = useI18n();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dailySummary, setDailySummary] = useState(null);
  const [recommendationResponse, setRecommendationResponse] = useState(null);

  const navItems = [
    { to: "/caregiver", label: t("common.overview"), icon: Activity, testId: "caregiver-nav-overview" },
    { to: "/caregiver/timeline", label: t("common.timeline"), icon: Clock3, testId: "caregiver-nav-timeline" },
    { to: "/caregiver/memory-graph", label: t("common.memoryGraph"), icon: Network, testId: "caregiver-nav-memory-graph" },
    { to: "/caregiver/relationships", label: t("common.relationships"), icon: Users, testId: "caregiver-nav-relationships" },
    { to: "/caregiver/memories", label: t("common.memories"), icon: BrainCircuit, testId: "caregiver-nav-memories" },
    { to: "/caregiver/analytics", label: t("common.analytics"), icon: HeartPulse, testId: "caregiver-nav-analytics" },
    { to: "/caregiver/episodes", label: t("common.episodes"), icon: BellRing, testId: "caregiver-nav-episodes" },
    { to: "/caregiver/safety", label: t("common.safety"), icon: MapPinned, testId: "caregiver-nav-safety" },
    { to: "/caregiver/medication", label: t("common.medication"), icon: Pill, testId: "caregiver-nav-medication" },
    { to: "/caregiver/recommendations", label: t("common.recommendations"), icon: BrainCircuit, testId: "caregiver-nav-recommendations" },
    { to: "/caregiver/reports", label: t("common.reports"), icon: ChartArea, testId: "caregiver-nav-reports" },
    { to: "/caregiver/consents", label: t("common.consents"), icon: ShieldAlert, testId: "caregiver-nav-consents" },
  ];

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardBundle(selectedPatientId);
        setBundle(data);
        setDailySummary(data.reports.find((report) => report.period === "daily") || null);
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [selectedPatientId]);

  const patient = bundle?.patient;
  const trendData = useMemo(
    () =>
      (bundle?.riskScores || []).map((entry) => ({
        date: formatDateTime(entry.timestamp, { month: "short", day: "numeric" }),
        confusion: entry.confusion,
        wandering: entry.wandering,
        isolation: entry.isolation,
      })),
    [bundle, formatDateTime]
  );

  const riskChartData = useMemo(
    () =>
      patient
        ? [
            { subject: t("caregiver.riskLabels.confusion"), value: patient.riskScores?.confusion || 0 },
            { subject: t("caregiver.riskLabels.wandering"), value: patient.riskScores?.wandering || 0 },
            { subject: t("caregiver.riskLabels.fall"), value: patient.riskScores?.fall || 0 },
            { subject: t("caregiver.riskLabels.medication"), value: patient.riskScores?.medication || 0 },
            { subject: t("caregiver.riskLabels.dehydration"), value: patient.riskScores?.dehydration || 0 },
            { subject: t("caregiver.riskLabels.isolation"), value: patient.riskScores?.isolation || 0 },
          ]
        : [],
    [patient, t]
  );

  const emotionalSuccess = [
    { label: t("caregiver.sarahVoice"), value: 82 },
    { label: t("caregiver.familyPhotos"), value: 64 },
    { label: t("caregiver.oldMusic"), value: 58 },
    { label: t("caregiver.calmAiDialogue"), value: 52 },
    { label: t("caregiver.genericAiVoice"), value: 22 },
    { label: t("caregiver.directCorrection"), value: 12 },
  ];

  const timelineFilters = [
    { key: "all", label: t("common.all") },
    { key: "medication", label: t("caregiver.timelineFilters.medication") },
    { key: "mood", label: t("caregiver.timelineFilters.mood") },
    { key: "memory", label: t("caregiver.timelineFilters.memory") },
    { key: "safety", label: t("caregiver.timelineFilters.safety") },
    { key: "family", label: t("caregiver.timelineFilters.family") },
    { key: "ai_intervention", label: t("caregiver.timelineFilters.ai") },
  ];

  const filteredEvents = useMemo(() => {
    if (!bundle?.events) return [];
    if (filter === "all") return bundle.events;
    if (filter === "family") return bundle.events.filter((event) => event.type === "family");
    return bundle.events.filter((event) => event.type === filter);
  }, [bundle, filter]);

  const brainMetrics = [
    { label: t("brain.state"), value: localizeText(patient?.currentState) },
    { label: t("brain.orientation"), value: `${patient?.domainScores?.orientation || 0}%` },
    { label: t("brain.memoryRecall"), value: `${patient?.domainScores?.memoryRecall || 0}%` },
    { label: t("brain.emotionalLoad"), value: patient?.riskScores?.confusion > 30 ? (language === "de" ? "Mittel" : "Moderate") : (language === "de" ? "Niedrig" : "Low") },
    { label: t("brain.confusionPressure"), value: `${patient?.riskScores?.confusion || 0}%` },
    { label: t("brain.attentionStability"), value: `${patient?.domainScores?.socialResponse || 0}%` },
    { label: t("brain.aiConfidence"), value: `${patient?.aiConfidence || 0}%` },
  ];

  const memoryNetworkNodes = [
    ...(bundle?.people || []).slice(0, 4).map((person) => ({ label: person.name, detail: localizeText(person.relationship) })),
    ...(bundle?.memories || []).slice(0, 4).map((memory) => ({ label: localizeText(memory.title), detail: localizeText(memory.memorySourceLabel) })),
  ];

  const eventIconMap = {
    medication: Pill,
    mood: HeartPulse,
    memory: BrainCircuit,
    family: Users,
    safety: ShieldPlus,
    ai_intervention: Sparkles,
  };

  const generateDailySummary = async () => {
    const result = await generateAiTask("/ai/daily-summary", {
      patientId: selectedPatientId,
      locale: language,
      context: { actorRole: "caregiver", timeOfDay: "evening" },
    });
    setDailySummary({ ...result.output, createdAt: result.generatedAt, cached: result.cached, provider: result.provider });
    toast.success(result.cached ? t("common.cached") : t("common.generated"));
  };

  const generateRecommendations = async () => {
    const result = await generateAiTask("/ai/recommendations", {
      patientId: selectedPatientId,
      locale: language,
      context: { actorRole: "caregiver" },
    });
    setRecommendationResponse(result);
    toast.success(result.cached ? t("common.cached") : t("common.generated"));
  };

  const markMedicationTaken = async (medicationId) => {
    const updated = await updateMedication(medicationId, { adherenceStatus: language === "de" ? "Eingenommen" : "Taken", actorRole: "caregiver" });
    setBundle((prev) => ({ ...prev, medications: prev.medications.map((item) => (item.id === medicationId ? updated : item)) }));
    toast.success(t("common.done"));
  };

  const toggleConsent = async (consentId, status) => {
    const updated = await updateConsent(consentId, { status, actorRole: "caregiver" });
    setBundle((prev) => ({ ...prev, consents: prev.consents.map((item) => (item.id === consentId ? updated : item)) }));
    toast.success(t("common.save"));
  };

  const topRight = (
    <div className="flex flex-wrap items-center gap-2">
      {patients.map((option) => (
        <button
          className={`rounded-full border px-4 py-2 text-xs transition-colors duration-200 ${selectedPatientId === option.id ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"}`}
          data-testid={`caregiver-patient-selector-${option.id}`}
          key={option.id}
          onClick={() => setSelectedPatientId(option.id)}
          type="button"
        >
          {option.name}
        </button>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[310px_minmax(0,1fr)] 2xl:grid-cols-[310px_230px_minmax(460px,1fr)]">
        <GlassPanel className="space-y-5" dataTestid="caregiver-identity-card" variant="strong">
          <div className="flex items-center gap-4">
            <img alt={patient?.name} className="h-24 w-24 rounded-[26px] object-cover" src={patient?.avatar} />
            <div className="space-y-2">
              <p className="font-display text-3xl text-white">{patient?.name}</p>
              <p className="text-sm text-white/58">{t("caregiver.ageDiagnosis").replace("{{age}}", patient?.age || "—").replace("{{diagnosis}}", localizeText(patient?.diagnosis))}</p>
              <p className="text-sm text-white/58">{localizeText(patient?.stage)} · {localizeText(patient?.location)}</p>
              <Badge className="rounded-full border border-emerald-300/22 bg-emerald-400/10 px-3 py-1 text-emerald-200">{localizeText(patient?.status)}</Badge>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">{t("caregiver.careTeam")}</p>
              <p className="mt-2 text-white">{bundle?.caregiver?.name}</p>
              <p className="text-sm text-white/58">{bundle?.doctor?.name}</p>
            </div>
          </div>
        </GlassPanel>

        <div className="xl:order-3 xl:col-span-2 2xl:order-2 2xl:col-span-1">
          <AiStatusRing
            dataTestid="caregiver-live-monitor-status-ring"
            label={t("caregiver.cognitiveStability")}
            score={`${patient?.cognitiveScore || 0}`}
            status={localizeText(patient?.currentState)}
            subScores={[
              { label: t("brain.emotionalLoad"), value: `${patient?.domainScores?.moodStability || 0}%` },
              { label: t("brain.memoryRecall"), value: `${patient?.domainScores?.memoryRecall || 0}%` },
              { label: t("brain.orientation"), value: `${patient?.domainScores?.orientation || 0}%` },
              { label: t("common.safety"), value: `${patient?.domainScores?.safety || 0}%` },
            ]}
          />
        </div>

        <div className="xl:order-2 xl:col-span-1 2xl:order-3 2xl:col-span-1">
          <BrainCorePanel
            dataTestid="caregiver-brain-core-panel"
            labels={{ metricsTitle: t("brain.metricsTitle"), rhythmLabel: t("brain.rhythm") }}
            metrics={brainMetrics}
            state={localizeText(patient?.currentState)}
            subtitle={t("brain.familySubtitle")}
            title={t("brain.title")}
            variant="caregiver"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <RiskCard dataTestid="caregiver-risk-confusion" icon={BrainCircuit} label={t("caregiver.riskLabels.confusion")} sublabel={t("common.active")} tone="violet" value={`${patient?.riskScores?.confusion || 0}%`} />
        <RiskCard dataTestid="caregiver-risk-wandering" icon={MapPinned} label={t("caregiver.riskLabels.wandering")} sublabel={t("common.safety")} tone="amber" value={`${patient?.riskScores?.wandering || 0}%`} />
        <RiskCard dataTestid="caregiver-risk-fall" icon={ShieldPlus} label={t("caregiver.riskLabels.fall")} sublabel={t("common.safety")} tone="mint" value={`${patient?.riskScores?.fall || 0}%`} />
        <RiskCard dataTestid="caregiver-risk-medication" icon={Pill} label={t("caregiver.riskLabels.medication")} sublabel={t("common.medication")} tone="cyan" value={`${patient?.medicationAdherence || 0}%`} />
        <RiskCard dataTestid="caregiver-risk-sleep" icon={MoonStar} label={t("common.sleepQuality")} sublabel={t("common.active")} tone="violet" value={`${patient?.sleepQuality || 0}%`} />
        <RiskCard dataTestid="caregiver-risk-last-interaction" icon={UserRound} label={t("common.lastInteraction")} sublabel={t("common.caregiver")} tone="cyan" value={patient?.lastInteraction || "—"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.95fr_0.8fr]">
        <GlassPanel className="space-y-4" dataTestid="caregiver-timeline-preview" variant="strong">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-2xl text-white">{t("caregiver.timelineToday")}</p>
            <Button asChild className="bg-white/10 text-white hover:bg-white/14"><Link data-testid="caregiver-timeline-link" to="/caregiver/timeline">{t("common.view")}</Link></Button>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {(bundle?.events || []).slice(0, 8).map((event) => {
              const EventIcon = eventIconMap[event.type] || Activity;
              return (
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3" key={event.id}>
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100">
                    <EventIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm text-white">{localizeText(event.title)}</p>
                      <span className="font-mono-display text-xs text-white/42">{formatDateTime(event.timestamp, { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/52">{localizeText(event.aiInterpretation)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        <div className="space-y-4">
          <GlassPanel className="space-y-4" dataTestid="caregiver-live-ai-observation-panel" variant="glow">
            <p className="font-display text-2xl text-white">{t("caregiver.observationCard")}</p>
            <p className="text-base leading-7 text-white/70">{t("caregiver.liveObservationText")}</p>
          </GlassPanel>

          <GlassPanel className="space-y-4" dataTestid="caregiver-recommendations-preview" variant="strong">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-2xl text-white">{t("caregiver.aiRecommendations")}</p>
                <p className="mt-2 text-sm text-white/58">{t("caregiver.calmingInsight")}</p>
              </div>
              <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="caregiver-generate-recommendations-button" onClick={generateRecommendations} type="button">{t("common.refresh")}</Button>
            </div>
            {(recommendationResponse?.output?.recommendations || []).slice(0, 3).map((item, index) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={`${item.reason}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{item.priority}</Badge>
                  <span className="font-mono-display text-xs text-white/42">{item.confidence}%</span>
                </div>
                <p className="mt-3 text-sm text-white">{item.reason}</p>
                <p className="mt-2 text-sm leading-6 text-white/58">{item.suggested_action}</p>
              </div>
            ))}
          </GlassPanel>
        </div>

        <GlassPanel className="space-y-4" dataTestid="caregiver-risk-radar-panel" variant="strong">
          <p className="font-display text-2xl text-white">{t("caregiver.riskRadar")}</p>
          <ResponsiveContainer height={260} width="100%">
            <RadarChart data={riskChartData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <Radar dataKey="value" fill="rgba(140,120,255,0.3)" fillOpacity={0.6} stroke="#8C78FF" />
            </RadarChart>
          </ResponsiveContainer>
        </GlassPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5" dataTestid="caregiver-emotional-response-overview" variant="strong">
          <div className="mb-4">
            <p className="font-display text-2xl text-white">{t("caregiver.emotionalResponse")}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{t("caregiver.calmingInsight")}</p>
          </div>
          <ResponsiveContainer height={270} width="100%">
            <BarChart data={emotionalSuccess}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {emotionalSuccess.map((entry, index) => <Cell fill={riskPalette[index % riskPalette.length]} key={entry.label} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassPanel>

        <GlassPanel className="space-y-4" dataTestid="caregiver-memory-graph-overview" variant="strong">
          <div>
            <p className="font-display text-2xl text-white">{t("caregiver.memoryGraphTitle")}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{t("caregiver.memoryGraphSubtitle")}</p>
          </div>
          <MemoryGraphNetwork centerLabel={patient?.name || "Ahmad"} dataTestid="caregiver-memory-network" nodes={memoryNetworkNodes} />
        </GlassPanel>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-4">
      <GlassPanel className="space-y-4" dataTestid="caregiver-timeline-filters-panel" variant="strong">
        <div className="flex flex-wrap gap-2">
          {timelineFilters.map((option) => (
            <button className={`rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${filter === option.key ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"}`} data-testid={`caregiver-timeline-filter-${option.key}`} key={option.key} onClick={() => setFilter(option.key)} type="button">{option.label}</button>
          ))}
        </div>
      </GlassPanel>
      {filteredEvents.map((event) => (
        <GlassPanel className="space-y-3" dataTestid={`caregiver-event-${event.id}`} key={event.id} variant="strong">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl text-white">{localizeText(event.title)}</p>
              <p className="text-sm text-white/58">{localizeText(event.description)}</p>
            </div>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{event.severity}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{localizeText(event.aiInterpretation)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{localizeText(event.actionTaken)}</div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const renderMemoryGraph = () => (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassPanel className="space-y-4" dataTestid="caregiver-memory-graph-card-list" variant="strong">
        <p className="font-display text-2xl text-white">{t("caregiver.memoryGraphTitle")}</p>
        {bundle?.people?.slice(0, 5).map((person, index) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={person.id}>
            <p className="text-sm text-white">{person.name}</p>
            <p className="mt-1 text-sm text-white/58">{localizeText(person.relationship)} · {localizeText(person.calmingEffect)}</p>
            <div className="mt-3 flex items-center gap-3 text-xs text-cyan-100/72">
              <span className="rounded-full border border-cyan-300/24 bg-cyan-300/10 px-3 py-1">Node {index + 1}</span>
              <span>{localizeText(person.notes)}</span>
            </div>
          </div>
        ))}
      </GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="caregiver-memory-graph-network-panel" variant="strong">
        <p className="text-sm leading-6 text-white/58">{t("brain.relationalSubtitle")}</p>
        <MemoryGraphNetwork centerLabel={patient?.name || "Ahmad"} dataTestid="caregiver-memory-network-route" nodes={memoryNetworkNodes} />
      </GlassPanel>
    </div>
  );

  const renderRelationships = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bundle?.people?.map((person) => (
        <GlassPanel className="space-y-4" dataTestid={`caregiver-relationship-${person.id}`} key={person.id} variant="strong">
          <div className="flex items-center gap-4">
            <img alt={person.name} className="h-16 w-16 rounded-2xl object-cover" src={person.photo} />
            <div>
              <p className="font-display text-xl text-white">{person.name}</p>
              <p className="text-sm text-white/58">{localizeText(person.relationship)}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-white/62">
            <p>{localizeText(person.emotionalImpact)}</p>
            <p>{localizeText(person.notes)}</p>
            <p>{localizeText(person.voiceSampleStatus)}</p>
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const renderMemoriesLibrary = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bundle?.memories?.map((memory) => (
        <GlassPanel className="overflow-hidden p-0" dataTestid={`caregiver-memory-library-${memory.id}`} key={memory.id} variant="strong">
          <img alt={localizeText(memory.title)} className="h-48 w-full object-cover" src={memory.mediaUrl} />
          <div className="space-y-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-xl text-white">{localizeText(memory.title)}</p>
              <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{memory.type}</Badge>
            </div>
            <p className="text-sm leading-6 text-white/58">{localizeText(memory.aiSummary)}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/62">{localizeText(memory.memorySourceLabel)}</p>
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const renderAnalytics = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="p-5" dataTestid="caregiver-emotional-analytics-chart" variant="strong">
        <p className="font-display text-2xl text-white">{t("common.analytics")}</p>
        <ResponsiveContainer height={280} width="100%">
          <BarChart data={emotionalSuccess}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {emotionalSuccess.map((entry, index) => <Cell fill={riskPalette[index % riskPalette.length]} key={entry.label} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </GlassPanel>
      <BrainCorePanel
        dataTestid="caregiver-analytics-brain-core"
        labels={{ metricsTitle: t("brain.metricsTitle"), rhythmLabel: t("brain.rhythm") }}
        metrics={brainMetrics}
        state={localizeText(patient?.currentState)}
        subtitle={t("brain.familySubtitle")}
        title={t("brain.title")}
        variant="caregiver"
      />
    </div>
  );

  const renderEpisodes = () => (
    <div className="space-y-4">
      {bundle?.episodes?.map((episode) => (
        <GlassPanel className="space-y-4" dataTestid={`caregiver-episode-${episode.id}`} key={episode.id} variant="strong">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-white">{localizeText(episode.type)}</p>
              <p className="mt-2 text-sm text-white/58">{localizeText(episode.trigger)} · {episode.duration}</p>
            </div>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{episode.severity}</Badge>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{localizeText(episode.patientPhrase)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{localizeText(episode.aiResponse)}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62">{localizeText(episode.interventionUsed)}</div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62">{localizeText(episode.outcome)}</div>
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const renderSafety = () => (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassPanel className="space-y-4" dataTestid="caregiver-safety-map-panel" variant="strong">
        <div className="rounded-[24px] border border-dashed border-cyan-300/26 bg-[linear-gradient(160deg,rgba(0,212,255,0.10),rgba(255,255,255,0.02))] p-6 text-white/62">
          <MapPinned className="h-8 w-8 text-cyan-200" />
          <p className="mt-4 font-display text-2xl text-white">{localizeText(patient?.location)}</p>
          <p className="mt-3 text-sm leading-6">Safe zones active · Door sensors online · Live location sharing available</p>
        </div>
        <div className="space-y-2 text-sm text-white/58">{bundle?.alerts?.map((alert) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3" key={alert.id}>{localizeText(alert.title)}</div>)}</div>
      </GlassPanel>
      <GlassPanel className="p-5" dataTestid="caregiver-safety-trend-chart" variant="strong">
        <p className="font-display text-2xl text-white">Safety trajectory</p>
        <ResponsiveContainer height={280} width="100%">
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="safetyGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <Tooltip />
            <Area dataKey="wandering" fill="url(#safetyGradient)" stroke="#00D4FF" type="monotone" />
            <Area dataKey="confusion" fill="rgba(255,176,32,0.08)" stroke="#FFB020" type="monotone" />
          </AreaChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  );

  const renderMedication = () => (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassPanel className="space-y-4" dataTestid="caregiver-medication-list" variant="strong">
        {bundle?.medications?.map((medication) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={medication.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl text-white">{medication.name}</p>
                <p className="text-sm text-white/58">{medication.dosage} · {localizeText(medication.schedule)}</p>
              </div>
              <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid={`caregiver-mark-medication-${medication.id}`} onClick={() => markMedicationTaken(medication.id)} type="button">{t("common.done")}</Button>
            </div>
            <p className="mt-3 text-sm text-white/58">{localizeText(medication.adherenceStatus)}</p>
          </div>
        ))}
      </GlassPanel>
      <GlassPanel className="p-5" dataTestid="caregiver-medication-adherence-chart" variant="strong">
        <p className="font-display text-2xl text-white">Medication adherence</p>
        <ResponsiveContainer height={280} width="100%">
          <BarChart data={bundle?.medications?.map((medication) => ({ name: medication.name, adherence: medication.missedCount === 0 ? 94 : 88 })) || []}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="adherence" fill="#3DDC97" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GlassPanel>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-4">
      <GlassPanel className="flex items-center justify-between gap-3" dataTestid="caregiver-recommendations-toolbar" variant="strong">
        <div>
          <p className="font-display text-2xl text-white">{t("common.recommendations")}</p>
          <p className="text-sm text-white/58">{t("caregiver.calmingInsight")}</p>
        </div>
        <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="caregiver-refresh-recommendations-button" onClick={generateRecommendations} type="button">{t("common.refresh")}</Button>
      </GlassPanel>
      {(recommendationResponse?.output?.recommendations || []).map((item, index) => (
        <GlassPanel className="space-y-3" dataTestid={`caregiver-recommendation-${index}`} key={`${item.reason}-${index}`} variant="strong">
          <div className="flex items-center justify-between gap-3">
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{item.priority}</Badge>
            <span className="font-mono-display text-xs text-white/42">{item.confidence}% {t("common.confidence")}</span>
          </div>
          <p className="text-base text-white">{item.reason}</p>
          <p className="text-sm leading-6 text-white/58">{item.suggested_action}</p>
        </GlassPanel>
      ))}
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <GlassPanel className="flex items-center justify-between gap-3" dataTestid="caregiver-report-toolbar" variant="strong">
        <div>
          <p className="font-display text-2xl text-white">{t("common.reports")}</p>
          <p className="text-sm text-white/58">{t("caregiver.reportPreview")}</p>
        </div>
        <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="caregiver-generate-summary-button" onClick={generateDailySummary} type="button">{t("caregiver.generateSummary")}</Button>
      </GlassPanel>
      {bundle?.reports?.map((report, index) => (
        <GlassPanel className="space-y-3" dataTestid={`caregiver-report-${index}`} key={report.id || `${report.period}-${index}`} variant="strong">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-white">{localizeText(report.title) || report.title}</p>
              <p className="text-sm text-white/58">{report.period} · {formatDateTime(report.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{report.provider || "ai"}</Badge>
          </div>
          <p className="text-sm leading-7 text-white/62">{localizeText(report.summary) || report.summary}</p>
        </GlassPanel>
      ))}
    </div>
  );

  const renderConsents = () => (
    <div className="space-y-4">
      <EthicsConsentBanner dataTestid="caregiver-consent-ethics-banner" />
      {bundle?.consents?.map((consent) => (
        <GlassPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" dataTestid={`caregiver-consent-${consent.id}`} key={consent.id} variant="strong">
          <div>
            <p className="font-display text-xl text-white">{localizeText(consent.category)}</p>
            <p className="mt-2 text-sm text-white/58">{localizeText(consent.grantedTo)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["granted", "pending", "requires_review"].map((status) => (
              <button className={`rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${consent.status === status ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"}`} data-testid={`caregiver-consent-toggle-${consent.id}-${status}`} key={status} onClick={() => toggleConsent(consent.id, status)} type="button">{status}</button>
            ))}
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const sectionView = {
    overview: renderOverview(),
    timeline: renderTimeline(),
    "memory-graph": renderMemoryGraph(),
    relationships: renderRelationships(),
    memories: renderMemoriesLibrary(),
    analytics: renderAnalytics(),
    episodes: renderEpisodes(),
    safety: renderSafety(),
    medication: renderMedication(),
    recommendations: renderRecommendations(),
    reports: renderReports(),
    consents: renderConsents(),
  };

  return <AppShell role="caregiver" subtitle={t("roles.caregiver.subtitle")} title={t("roles.caregiver.title")} navItems={navItems} topRight={topRight}>{loading ? <GlassPanel className="h-[520px] animate-pulse bg-white/[0.04]" dataTestid="caregiver-loading-state" /> : sectionView[section] || renderOverview()}</AppShell>;
}
