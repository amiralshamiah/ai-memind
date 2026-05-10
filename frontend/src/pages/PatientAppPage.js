import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, HeartHandshake, Home, Image as ImageIcon, PhoneCall, ShieldPlus, Sparkles, UserRound } from "lucide-react";
import { toast } from "../components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/memind/AppShell";
import {
  ChatComposer,
  GlassPanel,
  PatientBottomNav,
  PatientHomeQuickLinks,
} from "../components/memind/Primitives";
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
            content: `${data?.patient?.name ? t("patient.greeting").replace("{{name}}", data.patient.name) : t("patient.greeting").replace("{{name}}", "Ahmad")} ${t("patient.familyVisit")}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadBundle();
  }, [selectedPatientId]);

  const patient = bundle?.patient;
  const summary = bundle?.reports?.find((report) => report.period === "daily") || bundle?.reports?.[0];
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
    <div className="space-y-4">
      <GlassPanel className="space-y-5 p-6" dataTestid="patient-home-orientation-card">
        <div className="space-y-3">
          <Badge className="rounded-full border border-cyan-300/24 bg-cyan-300/10 px-3 py-1 text-cyan-50">{t("patient.safeState")}</Badge>
          <h1 className="font-display text-3xl leading-tight text-white">{t("patient.greeting").replace("{{name}}", patient?.name || "Ahmad")}</h1>
          <p className="text-lg text-white/72">{formatDateTime(new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })} — {localizeText(patient?.location)}</p>
          <p className="text-base text-white/62">{t("patient.everythingOkay")}</p>
        </div>
        <Button asChild className="h-16 rounded-[24px] bg-cyan-300 text-lg text-slate-950 hover:bg-cyan-200">
          <Link data-testid="patient-talk-primary-button" to="/patient/talk">{t("patient.talk")}</Link>
        </Button>
      </GlassPanel>

      <PatientHomeQuickLinks links={quickLinks} />

      <GlassPanel className="space-y-4 p-5" dataTestid="patient-reminder-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-xl text-white">{t("patient.medicationPrompt")}</p>
            <p className="mt-2 text-sm leading-6 text-white/58">{t("patient.medicationLocation")}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/40">{reminder?.name} · {localizeText(reminder?.schedule)}</p>
          </div>
          <PhoneCall className="h-8 w-8 text-cyan-200" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12 rounded-2xl bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid="patient-reminder-done-button" onClick={() => toast.success(t("common.done"))} type="button">{t("common.done")}</Button>
          <Button className="h-12 rounded-2xl bg-white/10 text-white hover:bg-white/14" data-testid="patient-reminder-later-button" onClick={() => toast.info(t("common.remindLater"))} type="button">{t("common.remindLater")}</Button>
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4 p-5" dataTestid="patient-summary-card">
        <p className="font-display text-xl text-white">{t("patient.summaryTitle")}</p>
        <div className="space-y-2 text-base leading-7 text-white/68">
          <p>{summary?.summary ? localizeText(summary.summary) : t("patient.safeState")}</p>
          {bundle?.events?.slice(0, 4).map((event) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3" key={event.id}>
              <span className="font-mono-display text-xs uppercase tracking-[0.22em] text-white/42">{formatDateTime(event.timestamp, { hour: "2-digit", minute: "2-digit" })}</span>
              <p className="mt-1 text-white/72">{localizeText(event.title)}</p>
            </div>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-4 p-5" dataTestid="patient-family-card">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl text-white">{t("patient.myFamily")}</p>
          <HeartHandshake className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="space-y-3">
          {bundle?.people?.slice(0, 3).map((person) => (
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3" key={person.id}>
              <div>
                <p className="text-base text-white">{person.name}</p>
                <p className="text-sm text-white/58">{localizeText(person.relationship)}</p>
              </div>
              <Button className="rounded-full bg-white/10 text-white hover:bg-white/14" data-testid={`patient-family-call-${person.id}`} onClick={() => toast.success(t("patient.callFamily"))} type="button">{t("patient.callFamily")}</Button>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );

  const renderTalk = () => (
    <GlassPanel className="space-y-5 p-5" dataTestid="patient-talk-screen">
      <div>
        <p className="font-display text-2xl text-white">{t("patient.voiceCompanion")}</p>
        <p className="mt-2 text-sm leading-6 text-white/58">{t("patient.supportPrompt")}</p>
      </div>
      <div className="space-y-3">
        {conversation.map((message, index) => (
          <div className={`rounded-[24px] px-4 py-3 ${message.role === "assistant" ? "bg-cyan-300/10 text-cyan-50" : "bg-white/8 text-white"}`} key={`${message.role}-${index}`}>
            <p className="text-sm leading-7">{message.content}</p>
          </div>
        ))}
        {thinking ? <div className="rounded-[24px] bg-white/8 px-4 py-3 text-sm text-white/58">{t("common.loading")}</div> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {[t("patient.exampleQuestion"), t("patient.questionHome")].map((example) => (
          <Button className="rounded-full bg-white/10 text-white hover:bg-white/14" data-testid={`patient-example-${example}`} key={example} onClick={() => submitConversation(example)} type="button">
            {example}
          </Button>
        ))}
      </div>
      <ChatComposer
        inputTestId="patient-chat-input"
        loading={thinking}
        onChange={setComposerValue}
        onSubmit={() => submitConversation()}
        placeholder={t("patient.exampleQuestion")}
        submitTestId="patient-chat-submit-button"
        value={composerValue}
        variant="patient"
      />
    </GlassPanel>
  );

  const renderMemories = () => (
    <div className="space-y-4">
      {bundle?.memories?.map((memory) => (
        <GlassPanel className="overflow-hidden p-0" dataTestid={`patient-memory-${memory.id}`} key={memory.id}>
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
    <GlassPanel className="space-y-5 p-6" dataTestid="patient-emergency-screen">
      <p className="font-display text-3xl text-white">{t("patient.emergency")}</p>
      <p className="text-sm leading-7 text-white/58">{t("ethics.emergency")}</p>
      <div className="grid gap-3">
        <Button className="h-14 rounded-[24px] bg-red-500/90 text-white hover:bg-red-500" data-testid="patient-emergency-primary-button" onClick={() => setConfirmOpen(true)} type="button">{t("patient.callFamily")}</Button>
        <Button className="h-14 rounded-[24px] bg-white/10 text-white hover:bg-white/14" data-testid="patient-emergency-location-button" onClick={() => toast.success(t("common.shareLocation"))} type="button">{t("common.shareLocation")}</Button>
      </div>
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
