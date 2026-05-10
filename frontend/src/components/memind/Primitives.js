import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Globe, HeartHandshake, Home, Mic, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useI18n } from "../../lib/i18n";

const stateColorMap = {
  Stable: "#3ddc97",
  Stabil: "#3ddc97",
  "Slightly unstable": "#ffb020",
  "Leicht instabil": "#ffb020",
  "Under observation": "#00d4ff",
  Beobachtung: "#00d4ff",
  "High confusion": "#ff4d4d",
  Recovering: "#7bdcff",
};

const brainNodes = [
  { top: "18%", left: "35%", delay: "0s" },
  { top: "26%", left: "52%", delay: "0.4s" },
  { top: "36%", left: "63%", delay: "0.9s" },
  { top: "43%", left: "40%", delay: "1.2s" },
  { top: "51%", left: "56%", delay: "0.7s" },
  { top: "58%", left: "30%", delay: "1.4s" },
  { top: "66%", left: "48%", delay: "0.3s" },
  { top: "74%", left: "62%", delay: "1.1s" },
];

export const GlassPanel = ({ children, className = "", dataTestid, variant = "default" }) => (
  <motion.div
    className={`rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl ${variant === "strong" ? "bg-white/[0.09]" : ""} ${variant === "glow" ? "shadow-[var(--mm-shadow-glow)] border-cyan-300/22" : ""} ${variant === "warm" ? "memind-warm-surface shadow-[var(--mm-glow-warm)]" : ""} ${className}`}
    data-testid={dataTestid}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -2 }}
  >
    {children}
  </motion.div>
);

export const MetricTile = ({ label, value, detail, dataTestid, tone = "default" }) => (
  <GlassPanel className="space-y-2 p-4" dataTestid={dataTestid} variant={tone === "glow" ? "glow" : "default"}>
    <p className="text-[11px] uppercase tracking-[0.26em] text-white/42">{label}</p>
    <p className="font-display font-mono-display text-3xl text-white">{value}</p>
    <p className="text-sm text-white/56">{detail}</p>
  </GlassPanel>
);

export const RiskCard = ({ icon: Icon, label, value, sublabel, tone = "cyan", dataTestid }) => {
  const toneClasses = {
    cyan: "text-cyan-100 border-cyan-300/16",
    mint: "text-emerald-200 border-emerald-300/16",
    amber: "text-amber-200 border-amber-300/16",
    red: "text-rose-200 border-rose-300/18",
    violet: "text-violet-200 border-violet-300/18",
  };
  return (
    <div className={`memind-risk-tile rounded-2xl border bg-white/[0.04] p-4 ${toneClasses[tone] || toneClasses.cyan}`} data-testid={dataTestid}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-right">
          <p className="font-mono-display text-2xl text-white">{value}</p>
          <p className="text-xs text-white/45">{sublabel}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-white/62">{label}</p>
    </div>
  );
};

export const PatientWarmOrb = ({ label, helper, dataTestid }) => (
  <div className="patient-orb" data-testid={dataTestid}>
    <div className="patient-orb-core">
      <div className="space-y-3 px-6 text-center">
        <p className="font-display text-2xl leading-snug text-white">{label}</p>
        <p className="text-sm leading-6 text-white/62">{helper}</p>
      </div>
    </div>
  </div>
);

export const BrainCorePanel = ({ title, state, metrics = [], variant = "caregiver", dataTestid }) => {
  const stateColor = stateColorMap[state] || "#00d4ff";
  return (
    <GlassPanel className="brain-core-shell brain-core-grid overflow-hidden p-5" dataTestid={dataTestid} variant="glow">
      <div className="grid gap-5 xl:grid-cols-[1fr_220px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.26em] text-cyan-100/56">{title}</p>
              <p className="mt-2 text-sm text-white/58">Central intelligence status with electric neural pulses.</p>
            </div>
            <Badge className="rounded-full border px-3 py-1 text-white" style={{ background: `${stateColor}14`, borderColor: `${stateColor}40`, color: stateColor }}>{state}</Badge>
          </div>
          <div className="brain-core-visual flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" viewBox="0 0 640 360">
              <path d="M214 205C180 198 148 173 145 134C142 92 176 61 223 68C245 37 289 26 330 38C369 27 410 38 432 64C484 62 522 102 520 149C518 191 484 224 446 230C434 258 404 283 364 286C334 310 292 310 260 286C229 283 210 252 214 205Z" fill="rgba(20,28,54,0.48)" stroke="rgba(118,152,255,0.42)" strokeWidth="2.2" />
              <path d="M285 86C255 106 244 138 248 166C251 188 246 211 232 230" stroke="rgba(0,212,255,0.38)" strokeLinecap="round" strokeWidth="2.2" />
              <path d="M336 44C348 78 350 110 346 140C343 167 350 202 372 238" stroke="rgba(140,120,255,0.42)" strokeLinecap="round" strokeWidth="2.2" />
              <path d="M222 150C262 144 292 130 327 108C365 84 398 72 434 83" stroke="rgba(0,212,255,0.46)" strokeLinecap="round" strokeWidth="2" />
              <path d="M216 205C258 196 284 182 320 162C360 141 404 131 442 141" stroke="rgba(128,144,255,0.46)" strokeLinecap="round" strokeWidth="2" />
              <path d="M252 250C280 225 312 214 346 202C388 187 421 187 454 201" stroke="rgba(196,112,255,0.34)" strokeLinecap="round" strokeWidth="2" />
              <path d="M286 118L316 148L356 120L388 162L430 112" stroke="rgba(140,120,255,0.5)" strokeLinecap="round" strokeWidth="2.4" />
              <path d="M250 183L300 198L340 164L392 210L436 186" stroke="rgba(0,212,255,0.54)" strokeLinecap="round" strokeWidth="2.4" />
              <path d="M288 240L320 220L352 236L390 214" stroke="rgba(0,212,255,0.34)" strokeLinecap="round" strokeWidth="2" />
              <circle cx="286" cy="118" r="8" fill="rgba(196,112,255,0.9)" />
              <circle cx="316" cy="148" r="8" fill="rgba(124,152,255,0.95)" />
              <circle cx="356" cy="120" r="8" fill="rgba(0,212,255,0.95)" />
              <circle cx="388" cy="162" r="8" fill="rgba(196,112,255,0.95)" />
              <circle cx="430" cy="112" r="8" fill="rgba(124,152,255,0.95)" />
              <circle cx="300" cy="198" r="8" fill="rgba(124,152,255,0.95)" />
              <circle cx="340" cy="164" r="8" fill="rgba(196,112,255,0.95)" />
              <circle cx="392" cy="210" r="8" fill="rgba(0,212,255,0.95)" />
              <circle cx="436" cy="186" r="8" fill="rgba(124,152,255,0.9)" />
              <circle cx="320" cy="220" r="7" fill="rgba(124,152,255,0.92)" />
              <circle cx="352" cy="236" r="7" fill="rgba(196,112,255,0.92)" />
              <circle cx="390" cy="214" r="7" fill="rgba(0,212,255,0.92)" />
            </svg>
            {brainNodes.map((node, index) => (
              <span className="brain-core-node" key={`node-${index}`} style={{ top: node.top, left: node.left, animationDelay: node.delay }} />
            ))}
          </div>
        </div>
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-[rgba(8,12,24,0.65)] p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">{variant === "doctor" ? "Clinical Brain Status" : "Memind Brain Core"}</p>
          <div className="space-y-3">
            {metrics.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2" key={item.label}>
                <span className="text-sm text-white/58">{item.label}</span>
                <span className="font-mono-display text-base text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">Neural activity</p>
            <div className="brain-core-sparkline mt-3 rounded-2xl" />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export const AiStatusRing = ({ label, score, subScores = [], status = "stable", dataTestid }) => (
  <GlassPanel className="overflow-hidden p-5" dataTestid={dataTestid} variant="strong">
    <div className="relative rounded-[28px] border border-cyan-300/14 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.12),rgba(0,212,255,0.02)_45%,transparent_70%)] p-5">
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-cyan-300/28 bg-[radial-gradient(circle,rgba(0,212,255,0.12),rgba(0,212,255,0.02)_58%,transparent_72%)] shadow-[0_0_0_1px_rgba(0,212,255,0.12),0_0_60px_rgba(0,212,255,0.16)]">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-100/65">{label}</p>
          <p className="font-display font-mono-display mt-3 text-5xl text-white">{score}</p>
          <Badge className="mt-3 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{status}</Badge>
        </div>
      </div>
      {subScores.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {subScores.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">{item.label}</p>
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
    <GlassPanel className={compact ? "p-4" : "p-5"} dataTestid={dataTestid} variant="strong">
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
  <div className="sticky bottom-4 z-20 mt-6 rounded-[26px] border border-white/10 bg-[rgba(7,10,18,0.92)] p-2 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl">
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <Link
          className={`flex min-h-[64px] flex-col items-center justify-center rounded-[22px] border border-transparent px-2 py-3 text-xs transition-colors duration-200 ${item.active ? "border-amber-300/35 bg-amber-400/18 text-amber-50" : "text-white/62 hover:bg-white/8 hover:text-white"}`}
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

export const ChatComposer = ({ value, onChange, onSubmit, loading, placeholder, variant = "dashboard", inputTestId = "chat-composer-input", submitTestId = "chat-composer-submit-button" }) => {
  const { t } = useI18n();
  return (
    <Card className={`border-white/10 bg-white/[0.05] p-4 ${variant === "patient" ? "rounded-[28px]" : "rounded-3xl"}`}>
      <div className="flex flex-col gap-3 md:flex-row">
        {variant === "patient" ? (
          <button className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/26 bg-amber-400/14 text-amber-50 shadow-[var(--mm-glow-warm)] transition-colors duration-200 hover:bg-amber-400/20" data-testid="patient-voice-mic-button" type="button">
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
            <Button className={`${variant === "patient" ? "bg-amber-400 text-slate-950 hover:bg-amber-300" : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"}`} data-testid={submitTestId} onClick={onSubmit} type="button">
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
        <GlassPanel className="flex min-h-[112px] items-center gap-3 p-4 transition-colors duration-200 hover:border-amber-300/25 hover:bg-white/[0.08]" dataTestid={link.testId} variant="warm">
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/12 p-3 text-amber-50">
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

export const cockpitPanelVariants = { GlassPanel, RiskCard, BrainCorePanel };
