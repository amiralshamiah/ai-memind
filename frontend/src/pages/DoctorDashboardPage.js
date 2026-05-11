import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Activity, BrainCircuit, ClipboardPen, FileHeart, MessageSquareText, Pill, Sparkles, Stethoscope, UserRound } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { toast } from "../components/ui/sonner";
import { AppShell } from "../components/memind/AppShell";
import { BrainCorePanel, EthicsConsentBanner, GlassPanel, MetricTile, RiskCard } from "../components/memind/Primitives";
import { createDoctorNote, fetchDashboardBundle, generateAiTask } from "../lib/api";
import { useI18n } from "../lib/i18n";

export default function DoctorDashboardPage({ patients, selectedPatientId, setSelectedPatientId }) {
  const location = useLocation();
  const section = location.pathname.split("/")[2] || "overview";
  const { t, localizeText, formatDateTime, language } = useI18n();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [carePlan, setCarePlan] = useState("");
  const [followUp, setFollowUp] = useState("");

  const navItems = [
    { to: "/doctor", label: t("common.overview"), icon: Stethoscope, testId: "doctor-nav-overview" },
    { to: "/doctor/cognitive", label: t("common.cognitive"), icon: BrainCircuit, testId: "doctor-nav-cognitive" },
    { to: "/doctor/speech", label: t("common.speech"), icon: MessageSquareText, testId: "doctor-nav-speech" },
    { to: "/doctor/behavior", label: t("common.behavior"), icon: Activity, testId: "doctor-nav-behavior" },
    { to: "/doctor/interventions", label: t("common.interventions"), icon: Sparkles, testId: "doctor-nav-interventions" },
    { to: "/doctor/correlation", label: t("common.correlation"), icon: Pill, testId: "doctor-nav-correlation" },
    { to: "/doctor/notes", label: t("common.notes"), icon: ClipboardPen, testId: "doctor-nav-notes" },
    { to: "/doctor/reports", label: t("common.reports"), icon: FileHeart, testId: "doctor-nav-reports" },
  ];

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        setBundle(await fetchDashboardBundle(selectedPatientId));
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [selectedPatientId]);

  const patient = bundle?.patient;
  const cognitiveTrendData = useMemo(
    () => (bundle?.riskScores || []).map((entry, index) => ({ day: index + 1, stability: 100 - entry.confusion + 6, repetition: entry.confusion / 2, orientation: 100 - entry.wandering / 1.2 })),
    [bundle]
  );
  const speechData = useMemo(
    () => (bundle?.riskScores || []).map((entry, index) => ({ week: index + 1, speechSpeed: 110 - entry.confusion / 1.5, nameRecall: 70 - index * 2, pauses: 18 + index })),
    [bundle]
  );
  const interventionData = [
    { label: t("caregiver.sarahVoice"), success: 82, agitationReduction: 76 },
    { label: t("caregiver.familyPhotos"), success: 64, agitationReduction: 55 },
    { label: t("caregiver.oldMusic"), success: 58, agitationReduction: 52 },
    { label: t("caregiver.calmAiDialogue"), success: 52, agitationReduction: 46 },
    { label: language === "de" ? "Schrittweise Anleitung" : "Step-by-step guidance", success: 44, agitationReduction: 39 },
    { label: language === "de" ? "Direkte Erinnerung" : "Direct reminders", success: 35, agitationReduction: 24 },
    { label: t("caregiver.directCorrection"), success: 12, agitationReduction: 9 },
  ];
  const brainMetrics = [
    { label: t("brain.state"), value: localizeText(patient?.currentState) },
    { label: t("doctor.eveningInstability"), value: patient?.riskScores?.confusion > 30 ? (language === "de" ? "Leicht" : "Mild") : t("common.stable") },
    { label: t("brain.aiConfidence"), value: `${patient?.aiConfidence || 0}%` },
    { label: t("common.sleepQuality"), value: `${patient?.sleepQuality || 0}%` },
    { label: t("caregiver.riskLabels.medication"), value: `${patient?.medicationAdherence || 0}%` },
    { label: t("doctor.cognitiveFluctuation"), value: patient?.riskScores?.confusion > 30 ? `${patient.riskScores.confusion}%` : "—" },
  ];

  const speechMetrics = [
    { label: t("doctor.speechSpeed"), value: "96 wpm", detail: language === "de" ? "verlangsamt" : "slower" },
    { label: t("doctor.pauses"), value: "+18%", detail: language === "de" ? "Abendstunden" : "evening" },
    { label: t("doctor.repeatedWords"), value: "+22%", detail: language === "de" ? "leichter Anstieg" : "mild rise" },
    { label: t("doctor.vocabularyDecline"), value: "low", detail: language === "de" ? "beobachten" : "monitor" },
    { label: t("doctor.nameRecall"), value: "moderate", detail: language === "de" ? "Familiennamen" : "family names" },
    { label: t("doctor.wordFinding"), value: "mild", detail: language === "de" ? "nicht diagnostisch" : "not diagnostic" },
  ];

  const reportPreviewSections = [
    language === "de" ? "Kognitive Zusammenfassung" : "Cognitive summary",
    language === "de" ? "Verhaltensänderungen" : "Behavioral changes",
    language === "de" ? "Medikamentenadhärenz" : "Medication adherence",
    language === "de" ? "Auffällige Episoden" : "Notable episodes",
    language === "de" ? "Sprach- und Kommunikationsbeobachtungen" : "Speech/language observations",
    language === "de" ? "KI-Beobachtungen" : "AI observations",
    language === "de" ? "Betreuernotizen" : "Caregiver notes",
    language === "de" ? "Ärztliche Empfehlungen" : "Recommended follow-up",
  ];

  const generateObservations = async () => {
    const result = await generateAiTask("/ai/clinical-observations", { patientId: selectedPatientId, locale: language, context: { actorRole: "doctor" } });
    setBundle((prev) => ({ ...prev, aiObservations: [{ id: `generated-${Date.now()}`, summary: result.output.observation_summary, recommendation: result.output.trend_note, confidence: Math.max(...(result.output.observations || []).map((item) => item.confidence || 0), 0) }, ...(prev?.aiObservations || [])] }));
    toast.success(result.cached ? t("common.cached") : t("common.generated"));
  };

  const generateReport = async (period) => {
    const result = await generateAiTask("/ai/report", { patientId: selectedPatientId, locale: language, period, context: { actorRole: "doctor" } });
    setBundle((prev) => ({ ...prev, reports: [{ id: `generated-report-${Date.now()}`, period, title: result.output.title, summary: result.output.executive_summary, createdAt: result.generatedAt, provider: result.provider }, ...(prev?.reports || [])] }));
    toast.success(result.cached ? t("common.cached") : t("common.generated"));
  };

  const saveDoctorNote = async () => {
    if (!note.trim()) return;
    const created = await createDoctorNote(selectedPatientId, { doctorId: bundle?.doctor?.id || "doctor-lena-001", note, carePlan, followUpRecommendation: followUp });
    setBundle((prev) => ({ ...prev, doctorNotes: [created, ...(prev.doctorNotes || [])] }));
    setNote("");
    setCarePlan("");
    setFollowUp("");
    toast.success(t("common.save"));
  };

  const doctorTopRight = (
    <div className="flex flex-wrap items-center gap-2">
      {patients.map((option) => (
        <button className={`rounded-full border px-4 py-2 text-xs transition-colors duration-200 ${selectedPatientId === option.id ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/62 hover:bg-white/[0.08] hover:text-white"}`} data-testid={`doctor-patient-selector-${option.id}`} key={option.id} onClick={() => setSelectedPatientId(option.id)} type="button">{option.name}</button>
      ))}
    </div>
  );

  const renderPatientList = () => (
    <GlassPanel className="space-y-4" dataTestid="doctor-patient-list-sidebar" variant="strong">
      <p className="font-display text-xl text-white">Patients</p>
      {patients.map((entry) => (
        <button className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors duration-200 ${selectedPatientId === entry.id ? "border-cyan-300/30 bg-cyan-300/12" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`} data-testid={`doctor-patient-list-item-${entry.id}`} key={entry.id} onClick={() => setSelectedPatientId(entry.id)} type="button">
          <img alt={entry.name} className="h-12 w-12 rounded-2xl object-cover" src={entry.avatar} />
          <div>
            <p className="text-sm text-white">{entry.name}</p>
            <p className="text-xs text-white/48">{entry.age} · {localizeText(entry.diagnosis)}</p>
          </div>
        </button>
      ))}
    </GlassPanel>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <GlassPanel className="space-y-4" dataTestid="doctor-selected-patient-card" variant="strong">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">{t("doctor.selectedPatient")}</p>
            <h2 className="font-display text-3xl text-white">{patient?.name}</h2>
            <p className="text-sm text-white/58">{localizeText(patient?.diagnosis)} · {localizeText(patient?.stage)}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <MetricTile dataTestid="doctor-metric-cognitive" detail={t("doctor.thirtyDayTrend")} label={t("caregiver.cognitiveStability")} value={`${patient?.cognitiveScore}/100`} />
              <MetricTile dataTestid="doctor-metric-confusion" detail={language === "de" ? "diese Woche" : "this week"} label={t("common.episodes")} value={`${bundle?.episodes?.length || 0}`} />
              <MetricTile dataTestid="doctor-metric-sleep" detail={t("common.sleepQuality")} label={language === "de" ? "Schlaf" : "Sleep"} value={`${patient?.sleepQuality}%`} />
              <MetricTile dataTestid="doctor-metric-adherence" detail={t("common.medication")} label={language === "de" ? "Adhärenz" : "Adherence"} value={`${patient?.medicationAdherence}%`} />
            </div>
          </GlassPanel>
          <div className="grid gap-3 md:grid-cols-3">
            <RiskCard dataTestid="doctor-risk-status" icon={BrainCircuit} label={t("brain.state")} sublabel={t("common.active")} tone="amber" value={localizeText(patient?.currentState)} />
            <RiskCard dataTestid="doctor-risk-orientation" icon={Activity} label={t("brain.orientation")} sublabel={language === "de" ? "Signal" : "Signal"} tone="cyan" value={`${patient?.domainScores?.orientation || 0}%`} />
            <RiskCard dataTestid="doctor-risk-confidence" icon={Sparkles} label={t("brain.aiConfidence")} sublabel={language === "de" ? "Modell" : "Model"} tone="violet" value={`${patient?.aiConfidence || 0}%`} />
          </div>
        </div>
        <BrainCorePanel
          dataTestid="doctor-clinical-brain-status-panel"
          labels={{ metricsTitle: t("brain.clinicalMetricsTitle"), rhythmLabel: t("brain.rhythm") }}
          metrics={brainMetrics}
          state={patient?.riskScores?.confusion > 30 ? t("brain.states.slightlyUnstable") : localizeText(patient?.currentState)}
          subtitle={t("brain.clinicalSubtitle")}
          title={t("doctor.clinicalBrainTitle")}
          variant="doctor"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <GlassPanel className="space-y-4" dataTestid="doctor-overview-observation-panel" variant="strong">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-2xl text-white">{t("common.aiStatus")} · {t("common.cognitive")}</p>
            <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="doctor-generate-observations-button" onClick={generateObservations} type="button">{t("doctor.generateObservations")}</Button>
          </div>
          <div className="rounded-2xl border border-cyan-300/18 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80">{t("doctor.clinicalBrainObservation")}</div>
          <EthicsConsentBanner compact dataTestid="doctor-overview-ethics-banner" />
          {(bundle?.aiObservations || []).slice(0, 3).map((entry, index) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id || index}>
              <p className="text-white">{localizeText(entry.summary) || entry.summary}</p>
              <p className="mt-2 text-sm text-white/58">{localizeText(entry.recommendation) || entry.recommendation}</p>
            </div>
          ))}
        </GlassPanel>
        <GlassPanel className="clinical-report-preview space-y-4" dataTestid="doctor-overview-report-panel" variant="strong">
          <p className="font-display text-2xl text-white">{t("doctor.reportPreview")}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {reportPreviewSections.slice(0, 6).map((sectionLabel) => (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/68" key={sectionLabel}>{sectionLabel}</div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="doctor-generate-weekly-report-button" onClick={() => generateReport("weekly")} type="button">{t("doctor.weeklyReport")}</Button>
            <Button className="bg-white/10 text-white hover:bg-white/14" data-testid="doctor-generate-monthly-report-button" onClick={() => generateReport("monthly")} type="button">{t("doctor.monthlyReport")}</Button>
          </div>
          <p className="text-sm leading-6 text-white/58">{t("doctor.reportDisclaimer")}</p>
          {(bundle?.reports || []).slice(0, 2).map((report, index) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={`${report.id || report.period}-${index}`}>
              <p className="font-display text-xl text-white">{localizeText(report.title) || report.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{localizeText(report.summary) || report.summary}</p>
            </div>
          ))}
        </GlassPanel>
      </div>
    </div>
  );

  const renderCognitive = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
      <GlassPanel className="p-5" dataTestid="doctor-cognitive-trend-chart" variant="strong">
        <p className="font-display text-2xl text-white">{t("doctor.thirtyDayTrend")}</p>
        <ResponsiveContainer height={320} width="100%">
          <LineChart data={cognitiveTrendData}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <Tooltip />
            <Line dataKey="stability" dot={false} stroke="#00D4FF" strokeWidth={3} type="monotone" />
            <Line dataKey="repetition" dot={false} stroke="#FFB020" strokeWidth={3} type="monotone" />
            <Line dataKey="orientation" dot={false} stroke="#8C78FF" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </GlassPanel>
      <BrainCorePanel
        dataTestid="doctor-cognitive-brain-core"
        labels={{ metricsTitle: t("brain.clinicalMetricsTitle"), rhythmLabel: t("brain.rhythm") }}
        metrics={brainMetrics}
        size="compact"
        state={patient?.riskScores?.confusion > 30 ? t("brain.states.slightlyUnstable") : localizeText(patient?.currentState)}
        subtitle={t("doctor.clinicalBrainObservation")}
        title={t("doctor.clinicalBrainTitle")}
        variant="doctor"
      />
    </div>
  );

  const renderSpeech = () => (
    <div className="space-y-4">
      <GlassPanel className="p-5" dataTestid="doctor-speech-analysis-chart" variant="strong">
        <p className="font-display text-2xl text-white">{t("doctor.speechMetrics")}</p>
        <ResponsiveContainer height={300} width="100%">
          <LineChart data={speechData}>
            <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
            <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} />
            <Tooltip />
            <Line dataKey="speechSpeed" dot={false} stroke="#00D4FF" strokeWidth={3} type="monotone" />
            <Line dataKey="nameRecall" dot={false} stroke="#3DDC97" strokeWidth={3} type="monotone" />
            <Line dataKey="pauses" dot={false} stroke="#FFB020" strokeWidth={3} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </GlassPanel>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {speechMetrics.map((metric) => (
          <MetricTile dataTestid={`doctor-speech-metric-${metric.label}`} detail={metric.detail} key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </div>
  );

  const renderBehavior = () => (
    <div className="space-y-4">{bundle?.episodes?.map((episode) => <GlassPanel className="space-y-3" dataTestid={`doctor-behavior-episode-${episode.id}`} key={episode.id} variant="strong"><div className="flex items-center justify-between gap-3"><p className="font-display text-2xl text-white">{localizeText(episode.type)}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{episode.severity}</Badge></div><p className="text-sm text-white/58">{localizeText(episode.trigger)} · {episode.duration}</p><div className="grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62">{localizeText(episode.patientPhrase)}</div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/62">{localizeText(episode.outcome)}</div></div></GlassPanel>)}</div>
  );

  const renderInterventions = () => (
    <GlassPanel className="p-5" dataTestid="doctor-intervention-effectiveness-chart" variant="strong">
      <p className="font-display text-2xl text-white">{t("common.interventions")}</p>
      <ResponsiveContainer height={320} width="100%">
        <ScatterChart>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
          <XAxis dataKey="success" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} type="number" />
          <YAxis dataKey="agitationReduction" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} type="number" />
          <Tooltip />
          <Scatter data={interventionData} fill="#00D4FF" />
        </ScatterChart>
      </ResponsiveContainer>
    </GlassPanel>
  );

  const renderCorrelation = () => (
    <GlassPanel className="space-y-4 p-5" dataTestid="doctor-medication-correlation-chart" variant="strong">
      <p className="font-display text-2xl text-white">{t("common.correlation")}</p>
      <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-50/80">{t("doctor.medicationCorrelationObservation")}</div>
      <ResponsiveContainer height={300} width="100%">
        <ScatterChart>
          <CartesianGrid stroke="rgba(255,255,255,0.07)" strokeDasharray="3 3" />
          <XAxis dataKey="confusion" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} type="number" />
          <YAxis dataKey="adherence" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }} type="number" />
          <Tooltip />
          <Scatter data={(bundle?.riskScores || []).map((entry) => ({ confusion: entry.confusion, adherence: 92 - entry.medication }))} fill="#3DDC97" />
        </ScatterChart>
      </ResponsiveContainer>
    </GlassPanel>
  );

  const renderNotes = () => (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassPanel className="space-y-4" dataTestid="doctor-notes-form-panel" variant="strong">
        <p className="font-display text-2xl text-white">{t("doctor.writeNote")}</p>
        <Textarea data-testid="doctor-note-input" onChange={(event) => setNote(event.target.value)} placeholder={t("doctor.observationDisclaimer")} value={note} />
        <Input data-testid="doctor-care-plan-input" onChange={(event) => setCarePlan(event.target.value)} placeholder={t("doctor.carePlan")} value={carePlan} />
        <Input data-testid="doctor-followup-input" onChange={(event) => setFollowUp(event.target.value)} placeholder={t("doctor.followUp")} value={followUp} />
        <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="doctor-save-note-button" onClick={saveDoctorNote} type="button">{t("common.save")}</Button>
      </GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="doctor-notes-history-panel" variant="strong">
        {(bundle?.doctorNotes || []).map((entry) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id}>
            <p className="text-sm text-white/58">{formatDateTime(entry.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            <p className="mt-2 text-sm text-white">{localizeText(entry.note)}</p>
            <p className="mt-2 text-sm text-white/58">{localizeText(entry.carePlan)}</p>
          </div>
        ))}
      </GlassPanel>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-4">
      <EthicsConsentBanner compact dataTestid="doctor-report-ethics-banner" />
      <GlassPanel className="clinical-report-preview space-y-4" dataTestid="doctor-report-preview-structure" variant="strong">
        <p className="font-display text-2xl text-white">{t("doctor.reportPreview")}</p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {reportPreviewSections.map((sectionLabel) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/68" key={sectionLabel}>{sectionLabel}</div>
          ))}
        </div>
        <p className="text-sm leading-6 text-white/58">{t("doctor.reportDisclaimer")}</p>
      </GlassPanel>
      {(bundle?.reports || []).map((report, index) => (
        <GlassPanel className="space-y-3" dataTestid={`doctor-report-${index}`} key={report.id || `${report.period}-${index}`} variant="strong">
          <div className="flex items-center justify-between gap-3"><div><p className="font-display text-2xl text-white">{localizeText(report.title) || report.title}</p><p className="text-sm text-white/58">{report.period} · {formatDateTime(report.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{report.provider || "ai"}</Badge></div>
          <p className="text-sm leading-7 text-white/62">{localizeText(report.summary) || report.summary}</p>
        </GlassPanel>
      ))}
    </div>
  );

  const sectionView = { overview: renderOverview(), cognitive: renderCognitive(), speech: renderSpeech(), behavior: renderBehavior(), interventions: renderInterventions(), correlation: renderCorrelation(), notes: renderNotes(), reports: renderReports() };

  return (
    <AppShell role="doctor" subtitle={t("roles.doctor.subtitle")} title={t("roles.doctor.title")} navItems={navItems} topRight={doctorTopRight}>
      {loading ? (
        <GlassPanel className="h-[540px] animate-pulse bg-white/[0.04]" dataTestid="doctor-loading-state" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[220px_1fr] 2xl:grid-cols-[260px_1fr]">
          {renderPatientList()}
          <div className="space-y-4">{sectionView[section] || renderOverview()}</div>
        </div>
      )}
    </AppShell>
  );
}
