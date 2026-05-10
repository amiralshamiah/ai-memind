import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, HeartHandshake, Home, Image as ImageIcon, PhoneCall, ShieldPlus, Sparkles, UserRound, Volume2 } from "lucide-react";

import { toast } from "../components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/memind/AppShell";
import { ChatComposer, GlassPanel, PatientBottomNav, PatientHomeQuickLinks, PatientWarmOrb } from "../components/memind/Primitives";
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

  const quickLinks = useMemo(
    () => [
      { to: "/patient", label: t("patient.today"), description: t("patient.summaryTitle"), icon: Home, testId: "patient-quicklink-today" },
      { to: "/patient/memories", label: t("common.memories"), description: t("patient.showPhoto"), icon: ImageIcon, testId: "patient-quicklink-memories" },
      { to: "/patient", label: t("patient.myFamily"), description: t("patient.callFamily"), icon: UserRound, testId: "patient-quicklink-family" },
      { to: "/patient/help", label: t("patient.emergency"), description: t("patient.helpContacting"), icon: ShieldPlus, testId: "patient-quicklink-help" },
    ],
    [t]
  );

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
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <GlassPanel className="space-y-5 p-6" dataTestid="patient-home-hero-card" variant="warm">
        <div className="space-y-3">
          <Badge className="rounded-full border border-amber-300/24 bg-amber-400/10 px-3 py-1 text-amber-50">{t("patient.safeState")}</Badge>
          <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">{t("patient.greeting").replace("{{name}}", patient?.name || "Ahmad")}</h1>
          <p className="text-lg text-white/70">{formatDateTime(new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })} — {localizeText(patient?.location)}</p>
          <p className="text-base leading-7 text-white/62">{t("patient.everythingOkay")}</p>
        </div>
        <PatientWarmOrb dataTestid="patient-ai-orb" helper={t("patient.safeState")} label={t("patient.talk")} />
        <Button asChild className="h-14 rounded-[24px] bg-amber-400 text-lg text-slate-950 hover:bg-amber-300">
          <Link data-testid="patient-talk-primary-button" to="/patient/talk">{t("patient.talk")}</Link>
        </Button>
      </GlassPanel>

      <div className="space-y-4">
        <GlassPanel className="space-y-4" dataTestid="patient-confusion-support-card" variant="strong">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-xl text-white">{t("patient.supportPrompt")}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{t("patient.everythingOkay")}</p>
            </div>
            <Sparkles className="h-6 w-6 text-amber-200" />
          </div>
          <Button className="w-full rounded-2xl bg-white/10 text-white hover:bg-white/14" data-testid="patient-play-voice-button" onClick={() => toast.success(t("patient.playVoice"))} type="button">{t("patient.playVoice")}</Button>
        </GlassPanel>

        <GlassPanel className="space-y-4" dataTestid="patient-familiar-voice-card">
          <div className="flex items-center gap-4">
            <img alt={caregiver?.name} className="h-16 w-16 rounded-2xl object-cover" src={caregiver?.photo} />
            <div>
              <p className="font-display text-xl text-white">{caregiver?.name || "Sarah Mansour"}</p>
              <p className="text-sm leading-6 text-white/58">{t("patient.callFamily")}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white/62">{localizeText(caregiver?.aiNote)}</div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/62">
            <Volume2 className="h-5 w-5 text-cyan-200" />
            <span>{t("patient.playVoice")}</span>
            <span className="ml-auto font-mono-display text-xs">00:09</span>
          </div>
        </GlassPanel>
      </div>

      <div className="xl:col-span-2 space-y-4">
        <PatientHomeQuickLinks links={quickLinks} />
        <div className="grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
          <GlassPanel className="space-y-4" dataTestid="patient-summary-card" variant="warm">
            <p className="font-display text-xl text-white">{t("patient.summaryTitle")}</p>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{localizeText(summary?.summary) || t("patient.safeState")}</div>
              {(bundle?.events || []).slice(0, 4).map((event) => (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3" key={event.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white">{localizeText(event.title)}</p>
                    <span className="font-mono-display text-xs text-white/42">{formatDateTime(event.timestamp, { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4" dataTestid="patient-reminder-card">
            <div>
              <p className="font-display text-xl text-white">{t("patient.medicationPrompt")}</p>
              <p className="mt-2 text-sm leading-6 text-white/58">{t("patient.medicationLocation")}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-lg text-white">{reminder?.name}</p>
              <p className="mt-1 text-sm text-white/58">{localizeText(reminder?.schedule)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button className="rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300" data-testid="patient-reminder-done-button" onClick={() => toast.success(t("common.done"))} type="button">{t("common.done")}</Button>
              <Button className="rounded-2xl bg-white/10 text-white hover:bg-white/14" data-testid="patient-reminder-later-button" onClick={() => toast.info(t("common.remindLater"))} type="button">{t("common.remindLater")}</Button>
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4" dataTestid="patient-emergency-cta-card" variant="strong">
            <p className="font-display text-xl text-white">{t("patient.emergency")}</p>
            <p className="text-sm leading-6 text-white/58">{t("ethics.emergency")}</p>
            <Button className="w-full rounded-2xl bg-red-500 text-white hover:bg-red-400" data-testid="patient-emergency-primary-button" onClick={() => setConfirmOpen(true)} type="button">{t("patient.callFamily")}</Button>
          </GlassPanel>
        </div>
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
          <PatientBottomNav items={navItems} />
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
