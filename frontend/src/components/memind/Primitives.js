import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Globe, HeartHandshake, Home, Mic, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useI18n } from "../../lib/i18n";

export const GlassPanel = ({ children, className = "", dataTestid, role = "default" }) => (
  <motion.div
    className={`rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl ${role === "doctor" ? "bg-white/[0.04]" : ""} ${className}`}
    data-testid={dataTestid}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.995 }}
  >
    {children}
  </motion.div>
);

export const MetricTile = ({ label, value, detail, dataTestid }) => (
  <GlassPanel className="space-y-2 p-4" dataTestid={dataTestid}>
    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{label}</p>
    <p className="font-display text-3xl text-white">{value}</p>
    <p className="text-sm text-white/58">{detail}</p>
  </GlassPanel>
);

export const AiStatusRing = ({ label, score, subScores = [], status = "stable", dataTestid }) => (
  <GlassPanel className="overflow-hidden" dataTestid={dataTestid}>
    <div className="relative rounded-[28px] border border-cyan-300/14 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.16),rgba(0,212,255,0.02)_45%,transparent_70%)] p-6">
      <div className="memind-pulse-ring mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-cyan-300/30 bg-[radial-gradient(circle,rgba(0,212,255,0.12),rgba(0,212,255,0.02)_58%,transparent_72%)] shadow-[0_0_0_1px_rgba(0,212,255,0.12),0_0_60px_rgba(0,212,255,0.16)]">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/65">{label}</p>
          <p className="font-display font-mono-display mt-2 text-5xl text-white">{score}</p>
          <Badge className="mt-3 border border-white/10 bg-white/6 px-3 py-1 text-white/72">{status}</Badge>
        </div>
      </div>
      {subScores.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {subScores.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-white/42">{item.label}</p>
              <p className="mt-2 font-mono-display text-xl text-white">{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  </GlassPanel>
);

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-2 py-1" data-testid="language-switcher">
      <Globe className="h-4 w-4 text-cyan-200" />
      {["en", "de"].map((option) => (
        <button
          key={option}
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.22em] transition-colors duration-200 ${language === option ? "bg-cyan-300/18 text-cyan-100" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
          data-testid={`language-switcher-${option}`}
          onClick={() => setLanguage(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export const EthicsConsentBanner = ({ compact = false, dataTestid = "ethics-consent-banner" }) => {
  const { t } = useI18n();
  return (
    <GlassPanel className={compact ? "p-4" : "p-5"} dataTestid={dataTestid}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 text-cyan-200" />
        <div className="space-y-2">
          <p className="font-display text-lg text-white">{t("ethics.title")}</p>
          <ul className="space-y-1 text-sm leading-6 text-white/58">
            <li>{t("ethics.notDiagnosis")}</li>
            <li>{t("ethics.doctorReview")}</li>
            <li>{t("ethics.voiceConsent")}</li>
            <li>{t("ethics.humanCare")}</li>
            <li>{t("ethics.emergency")}</li>
          </ul>
        </div>
      </div>
    </GlassPanel>
  );
};

export const PatientBottomNav = ({ items }) => (
  <div className="sticky bottom-4 z-20 mt-6 rounded-[26px] border border-white/10 bg-[rgba(7,10,18,0.9)] p-2 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl">
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <Link
          className={`flex min-h-[64px] flex-col items-center justify-center rounded-[22px] border border-transparent px-2 py-3 text-xs transition-colors duration-200 ${item.active ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-50" : "text-white/62 hover:bg-white/8 hover:text-white"}`}
          data-testid={item.testId}
          key={item.to}
          to={item.to}
        >
          <item.icon className="mb-2 h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </div>
  </div>
);

export const ChatComposer = ({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  variant = "dashboard",
  inputTestId = "chat-composer-input",
  submitTestId = "chat-composer-submit-button",
}) => {
  const { t } = useI18n();
  return (
    <Card className={`border-white/10 bg-white/[0.05] p-4 ${variant === "patient" ? "rounded-[28px]" : "rounded-3xl"}`}>
      <div className="flex flex-col gap-3 md:flex-row">
        {variant === "patient" ? (
          <button
            className="memind-mic-glow flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-cyan-100 transition-colors duration-200 hover:bg-cyan-300/16"
            data-testid="patient-voice-mic-button"
            type="button"
          >
            <Mic className={`h-7 w-7 ${loading ? "animate-pulse" : ""}`} />
          </button>
        ) : (
          <div className="hidden md:flex md:h-12 md:w-12 md:items-center md:justify-center md:rounded-2xl md:border md:border-cyan-300/20 md:bg-cyan-300/10 md:text-cyan-100">
            <Bot className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 space-y-3">
          {variant === "patient" ? (
            <Input data-testid={inputTestId} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
          ) : (
            <Textarea className="min-h-[96px]" data-testid={inputTestId} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} value={value} />
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-white/55">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              {loading ? t("common.loading") : t("brand.tagline")}
            </div>
            <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200" data-testid={submitTestId} onClick={onSubmit} type="button">
              {t("patient.talk")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const EmptyStateCard = ({ title, body, actionLabel, onAction, dataTestid }) => (
  <GlassPanel className="p-6 text-center" dataTestid={dataTestid}>
    <HeartHandshake className="mx-auto h-10 w-10 text-cyan-200/80" />
    <h3 className="mt-4 font-display text-xl text-white">{title}</h3>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/58">{body}</p>
    {actionLabel ? (
      <Button className="mt-5 bg-white/10 text-white hover:bg-white/15" onClick={onAction} type="button">
        {actionLabel}
      </Button>
    ) : null}
  </GlassPanel>
);

export const PatientHomeQuickLinks = ({ links }) => (
  <div className="grid grid-cols-2 gap-3">
    {links.map((link) => (
      <Link key={link.testId || link.to} to={link.to}>
        <GlassPanel className="flex min-h-[112px] items-center gap-3 p-4 transition-colors duration-200 hover:border-cyan-300/25 hover:bg-white/[0.08]" dataTestid={link.testId}>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
            <link.icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg text-white">{link.label}</p>
            <p className="mt-1 text-sm text-white/55">{link.description}</p>
          </div>
        </GlassPanel>
      </Link>
    ))}
  </div>
);

export const iconMap = {
  Home,
  Bot,
  Mic,
  ShieldAlert,
};
