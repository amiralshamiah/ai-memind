import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, CalendarDays, CheckCircle2, Home, Image as ImageIcon, MapPin, PhoneCall, ShieldPlus, Sparkles, Volume2 } from "lucide-react";

import { toast } from "../components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/memind/AppShell";
import { ChatComposer, GlassPanel, PatientBottomNav, PatientWarmOrb } from "../components/memind/Primitives";
import { fetchDashboardBundle, generateAiTask } from "../lib/api";
import { useI18n } from "../lib/i18n";

export default function PatientAppPage({ selectedPatientId }) {
  const location = useLocation();
  const section = location.pathname.split("/")[2] || "home";
  const { t, localizeText, formatDateTime, language } = useI18n();
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composerValue, setComposerValue] = useState("");
  const [conversation, setConversation] = useState([]);
  const [thinking, setThinking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const loadBundle = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardBundle(selectedPatientId);
        setBundle(data);
        setConversation([
          {
            role: "assistant",
            content: `${t("patient.greeting").replace("{{name}}", data.patient.name)} ${t("patient.familyVisit")}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [selectedPatientId, t]);

  const patient = bundle?.patient;
  const summary = bundle?.reports?.find((report) => report.period === "daily") || bundle?.reports?.[0];
  const caregiver = bundle?.caregiver;
  const reminder = bundle?.medications?.[0];

  const navItems = [
    { to: "/patient", label: t("common.overview"), icon: Home, active: section === "home", testId: "patient-bottom-nav-home" },
    { to: "/patient/talk", label: t("patient.talk"), icon: Sparkles, active: section === "talk", testId: "patient-bottom-nav-talk" },
    { to: "/patient/memories", label: t("common.memories"), icon: ImageIcon, active: section === "memories", testId: "patient-bottom-nav-memories" },
    { to: "/patient/help", label: t("patient.emergency"), icon: AlertTriangle, active: section === "help", testId: "patient-bottom-nav-help" },
  ];

  const submitConversation = async (input = composerValue) => {
    if (!input?.trim()) return;
    const route = /home|where|mother/i.test(input) ? "/ai/confusion-support" : "/ai/memory-recall";
    setThinking(true);
    setConversation((prev) => [...prev, { role: "user", content: input }]);
    setComposerValue("");
    try {
      const result = await generateAiTask(route, {
        patientId: selectedPatientId,
        locale: language,
        context: { question: input, actorRole: "patient" },
      });
      const output = result.output;
      setConversation((prev) => [...prev, { role: "assistant", content: output.response || output.summary || output.reassurance_message }]);
    } catch {
      toast.error("Memind could not answer right now.");
    } finally {
      setThinking(false);
    }
  };

  const confirmEmergency = () => {
    setConfirmOpen(false);
    toast.success(t("patient.helpContacting"));
  };

  const renderHome = () => (
    <div className="space-y-5">
      <GlassPanel className="patient-calm-hero overflow-hidden p-0" dataTestid="patient-home-hero-card" variant="warm">
        <div className="patient-home-stage space-y-7 p-6 sm:p-9 lg:p-12">
          <Badge className="w-fit rounded-full border border-emerald-300/26 bg-emerald-400/14 px-4 py-2 text-base text-emerald-50">{t("patient.safeState")}</Badge>
          <div className="space-y-4">
            <h1 className="font-display text-5xl leading-[1.05] text-white sm:text-6xl">{t("patient.greeting").replace("{{name}}", patient?.name || "Ahmad")}</h1>
            <div className="flex flex-wrap gap-4 text-lg text-white/86">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-5 w-5 text-amber-100" />{formatDateTime(new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })}</span>
              <span className="inline-flex items-center gap-2"><MapPin className="h-5 w-5 text-amber-100" />{localizeText(patient?.location) || t("patient.homeLocation")}</span>
            </div>
          </div>

          <div className="grid max-w-3xl items-center gap-4 sm:grid-cols-[minmax(260px,1fr)_220px]">
            <PatientWarmOrb className="max-w-[460px]" dataTestid="patient-ai-orb" helper={t("patient.calmFirstScreenMessage")} label={t("patient.talk")} to="/patient/talk" />
            <div className="grid gap-3">
              <Button className="h-16 rounded-[24px] border border-white/10 bg-white/10 text-lg text-white shadow-[0_0_24px_rgba(0,212,255,0.08)] hover:bg-white/15" data-testid="patient-call-family-button" onClick={() => toast.success(t("patient.familyCanBeCalled"))} type="button">
                <PhoneCall className="mr-2 h-5 w-5" />
                {t("patient.callFamily")}
              </Button>
              <Button asChild className="h-16 rounded-[24px] border border-white/10 bg-white/10 text-lg text-white shadow-[0_0_24px_rgba(0,212,255,0.08)] hover:bg-white/15">
                <Link data-testid="patient-view-memories-button" to="/patient/memories">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  {t("patient.viewMemories")}
                </Link>
              </Button>
            </div>
          </div>

          <p className="max-w-2xl text-2xl leading-9 text-white">{t("patient.everythingOkay")} {t("patient.supportLineHome")} {t("patient.youAreSafe")}</p>
        </div>
      </GlassPanel>

      <div className="patient-home-lower grid gap-4 xl:grid-cols-[0.95fr_1.05fr_0.9fr]">
        <GlassPanel className="space-y-4" dataTestid="patient-confusion-support-card" variant="strong">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <p className="font-display text-2xl text-white">{t("patient.supportPrompt")}</p>
              {[t("patient.everythingOkay"), t("patient.supportLineHome"), t("patient.supportLineSafe"), t("patient.supportLineVoice")].map((line) => (
                <div className="flex items-center gap-3 text-lg text-white/78" key={line}>
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <Sparkles className="h-7 w-7 text-amber-200" />
          </div>
          <Button className="h-12 w-full rounded-2xl bg-white/10 text-white hover:bg-white/14" data-testid="patient-play-voice-button" onClick={() => toast.success(t("patient.playVoice"))} type="button">{t("patient.playVoice")}</Button>
        </GlassPanel>

        <GlassPanel className="space-y-4" dataTestid="patient-familiar-voice-card">
          <div className="flex items-center gap-4">
            <img alt={caregiver?.name} className="h-[72px] w-[72px] rounded-2xl object-cover" src={caregiver?.photo} />
            <div>
              <p className="font-display text-2xl text-white">{caregiver?.name || "Sarah Mansour"}</p>
              <p className="text-base leading-7 text-white/64">{t("patient.familiarVoiceAvailable")}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-base leading-7 text-white/70">{t("patient.familiarVoiceExplanation")}</div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
            <Volume2 className="h-5 w-5 text-cyan-200" />
            <span>{t("patient.playVoice")}</span>
            <span className="ml-auto font-mono-display text-xs">00:09</span>
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-4" dataTestid="patient-emergency-cta-card" variant="strong">
          <div>
            <p className="font-display text-2xl text-white">{t("patient.emergency")}</p>
            <p className="mt-2 text-base leading-7 text-white/62">{t("patient.familyCanBeCalled")}</p>
          </div>
          <div className="grid gap-3">
            <Button className="h-12 rounded-2xl bg-white/10 text-white hover:bg-white/14" data-testid="patient-emergency-primary-button" onClick={() => setConfirmOpen(true)} type="button">{t("patient.callSarah")}</Button>
            <Button className="h-12 rounded-2xl bg-red-500/88 text-white hover:bg-red-400" data-testid="patient-get-help-button" onClick={() => setConfirmOpen(true)} type="button">{t("patient.getHelp")}</Button>
          </div>
        </GlassPanel>

        <GlassPanel className="space-y-4 xl:col-span-2" dataTestid="patient-summary-card" variant="warm">
          <p className="font-display text-2xl text-white">{t("patient.summaryTitle")}</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-base leading-7 text-white/68">{localizeText(summary?.summary) || t("patient.safeState")}</div>
        </GlassPanel>

        <GlassPanel className="space-y-4" dataTestid="patient-reminder-card">
          <div>
            <p className="font-display text-2xl text-white">{t("patient.medicationPrompt")}</p>
            <p className="mt-2 text-base leading-7 text-white/62">{t("patient.medicationLocation")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="font-display text-xl text-white">{reminder?.name}</p>
            <p className="mt-1 text-sm text-white/58">{localizeText(reminder?.schedule)}</p>
          </div>
        </GlassPanel>
      </div>
    </div>
  );

  const renderTalk = () => (
    <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <GlassPanel className="space-y-4 p-6" dataTestid="patient-talk-orb-panel" variant="warm">
        <p className="font-display text-2xl text-white">{t("patient.voiceCompanion")}</p>
        <PatientWarmOrb dataTestid="patient-talk-ai-orb" helper={thinking ? t("common.loading") : t("patient.everythingOkay")} label={thinking ? t("common.loading") : t("patient.talk")} />
      </GlassPanel>
      <GlassPanel className="space-y-5 p-5" dataTestid="patient-talk-screen">
        <div className="space-y-3">
          {conversation.map((message, index) => (
            <div className={`rounded-[24px] px-4 py-3 ${message.role === "assistant" ? "bg-amber-400/10 text-amber-50" : "bg-white/8 text-white"}`} key={`${message.role}-${index}`}>
              <p className="text-sm leading-7">{message.content}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {[t("patient.exampleQuestion"), t("patient.questionHome")].map((example) => (
            <Button className="rounded-full bg-white/10 text-white hover:bg-white/14" data-testid={`patient-example-${example}`} key={example} onClick={() => submitConversation(example)} type="button">
              {example}
            </Button>
          ))}
        </div>
        <ChatComposer inputTestId="patient-chat-input" loading={thinking} onChange={setComposerValue} onSubmit={() => submitConversation()} placeholder={t("patient.exampleQuestion")} submitTestId="patient-chat-submit-button" value={composerValue} variant="patient" />
      </GlassPanel>
    </div>
  );

  const renderMemories = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bundle?.memories?.map((memory) => (
        <GlassPanel className="overflow-hidden p-0" dataTestid={`patient-memory-${memory.id}`} key={memory.id} variant="warm">
          <img alt={memory.title?.en || memory.title} className="h-52 w-full object-cover" src={memory.mediaUrl} />
          <div className="space-y-3 p-5">
            <p className="font-display text-2xl text-white">{localizeText(memory.title)}</p>
            <p className="text-sm leading-6 text-white/58">{localizeText(memory.aiSummary)}</p>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{localizeText(memory.memorySourceLabel)}</Badge>
          </div>
        </GlassPanel>
      ))}
    </div>
  );

  const renderHelp = () => (
    <GlassPanel className="space-y-5 p-6" dataTestid="patient-emergency-screen" variant="strong">
      <p className="font-display text-3xl text-white">{t("patient.emergency")}</p>
      <p className="text-sm leading-7 text-white/58">{t("ethics.emergency")}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Button className="h-14 rounded-[24px] bg-red-500 text-white hover:bg-red-400" data-testid="patient-emergency-call-family-button" onClick={() => setConfirmOpen(true)} type="button">{t("patient.callFamily")}</Button>
        <Button className="h-14 rounded-[24px] bg-white/10 text-white hover:bg-white/14" data-testid="patient-emergency-location-button" onClick={() => toast.success(t("common.shareLocation"))} type="button">{t("common.shareLocation")}</Button>
      </div>
      <GlassPanel className="p-4" dataTestid="patient-emergency-status-card" variant="warm">
        <p className="font-display text-xl text-white">{t("patient.helpContacting")}</p>
        <p className="mt-2 text-sm leading-6 text-white/58">{t("patient.everythingOkay")}</p>
      </GlassPanel>
    </GlassPanel>
  );

  return (
    <AppShell role="patient" title={t("roles.patient.title")}>
      {loading ? <GlassPanel className="h-72 animate-pulse bg-white/[0.04]" dataTestid="patient-loading-state" /> : null}
      {!loading && patient ? (
        <>
          {section === "talk" ? renderTalk() : null}
          {section === "memories" ? renderMemories() : null}
          {section === "help" ? renderHelp() : null}
          {(section === "home" || !["talk", "memories", "help"].includes(section)) ? renderHome() : null}
          <PatientBottomNav items={navItems} sticky={section !== "home"} />
          <Dialog onOpenChange={setConfirmOpen} open={confirmOpen}>
            <DialogContent className="border-white/10 bg-[#0b1020] text-white">
              <DialogHeader>
                <DialogTitle>{t("patient.emergency")}</DialogTitle>
              </DialogHeader>
              <p className="text-sm leading-6 text-white/58">{t("ethics.emergency")}</p>
              <div className="mt-4 flex gap-3">
                <Button className="bg-red-500 text-white hover:bg-red-400" data-testid="patient-emergency-confirm-button" onClick={confirmEmergency} type="button">{t("patient.callFamily")}</Button>
                <Button className="bg-white/10 text-white hover:bg-white/14" onClick={() => setConfirmOpen(false)} type="button">{t("common.cancel")}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </AppShell>
  );
}
