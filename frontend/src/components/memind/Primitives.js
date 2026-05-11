import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bot, Globe, HeartHandshake, Home, Mic, ShieldAlert, Sparkles } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useI18n } from "../../lib/i18n";

const brainStateConfigs = {
  stable: { key: "stable", color: "#1ee7ff", secondary: "#7c6bff", rgb: "30, 231, 255" },
  observation: { key: "observation", color: "#8c78ff", secondary: "#ffd166", rgb: "140, 120, 255" },
  warning: { key: "warning", color: "#ff8a3d", secondary: "#ff4d6d", rgb: "255, 138, 61" },
  recovering: { key: "recovering", color: "#3ddc97", secondary: "#60a5fa", rgb: "61, 220, 151" },
  calm: { key: "calm", color: "#7bdcff", secondary: "#b49cff", rgb: "123, 220, 255" },
};

const getBrainStateConfig = (state = "") => {
  const normalized = String(state).toLowerCase();
  if (normalized.includes("high") || normalized.includes("erhöht") || normalized.includes("confusion") || normalized.includes("verwirrung")) {
    return brainStateConfigs.warning;
  }
  if (normalized.includes("recover") || normalized.includes("erholt")) return brainStateConfigs.recovering;
  if (normalized.includes("observation") || normalized.includes("beobachtung") || normalized.includes("reduced") || normalized.includes("reduziert")) {
    return brainStateConfigs.observation;
  }
  if (normalized.includes("unstable") || normalized.includes("instabil")) return brainStateConfigs.observation;
  if (normalized.includes("calm") || normalized.includes("ruhig") || normalized.includes("responsive") || normalized.includes("reagiert")) return brainStateConfigs.calm;
  return brainStateConfigs.stable;
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

const brainParticles = [
  { top: "18%", left: "22%", delay: "0.1s" },
  { top: "26%", left: "78%", delay: "0.8s" },
  { top: "42%", left: "16%", delay: "1.4s" },
  { top: "55%", left: "84%", delay: "0.4s" },
  { top: "72%", left: "30%", delay: "1.9s" },
  { top: "76%", left: "68%", delay: "1.1s" },
];

export const GlassPanel = ({ children, className = "", dataTestid, variant = "default", style }) => (
  <motion.div
    className={`rounded-[28px] border border-white/10 bg-white/[0.06] p-5 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl ${variant === "strong" ? "bg-white/[0.09]" : ""} ${variant === "glow" ? "shadow-[var(--mm-shadow-glow)] border-cyan-300/22" : ""} ${variant === "warm" ? "memind-warm-surface shadow-[var(--mm-glow-warm)]" : ""} ${className}`}
    data-testid={dataTestid}
    style={style}
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

export const PatientWarmOrb = ({ label, helper, dataTestid, to, onClick, className = "" }) => {
  const content = (
    <>
      <div className="patient-orb-core" aria-hidden="true">
        <span className="patient-orb-wave patient-orb-wave-a" />
        <span className="patient-orb-wave patient-orb-wave-b" />
        <span className="patient-orb-wave patient-orb-wave-c" />
        <div className="space-y-3 px-6 text-center">
          <p className="font-display text-2xl leading-snug text-white">{label}</p>
          {helper ? <p className="text-sm leading-6 text-white/70">{helper}</p> : null}
        </div>
      </div>
      <span className="patient-orb-ring patient-orb-ring-a" aria-hidden="true" />
      <span className="patient-orb-ring patient-orb-ring-b" aria-hidden="true" />
    </>
  );

  if (to) {
    return (
      <Link className={`patient-orb patient-orb-button ${className}`} data-testid={dataTestid} to={to}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button className={`patient-orb patient-orb-button ${className}`} data-testid={dataTestid} onClick={onClick} type="button">
        {content}
      </button>
    );
  }

  return (
    <div className={`patient-orb ${className}`} data-testid={dataTestid}>
      {content}
    </div>
  );
};

export const BrainCore = ({ state, mode = "family", size = "large", dataTestid }) => {
  const stateConfig = getBrainStateConfig(state);
  return (
    <div
      className={`brain-core-visual brain-core-visual-${size} brain-core-mode-${mode} brain-core-state-${stateConfig.key}`}
      data-testid={dataTestid}
      style={{
        "--brain-state-color": stateConfig.color,
        "--brain-state-secondary": stateConfig.secondary,
        "--brain-state-rgb": stateConfig.rgb,
      }}
    >
      <div className="brain-core-scanner" aria-hidden="true" />
      <div className="brain-core-lens" aria-hidden="true" />
      <svg className="brain-core-svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 720 420" aria-hidden="true">
        <path
          className="brain-core-brain-fill"
          d="M228 236C186 225 148 194 145 146C142 94 184 58 241 67C269 28 324 17 374 32C422 18 470 32 497 65C560 63 606 112 603 169C600 219 559 259 512 266C497 300 461 330 412 334C376 363 324 362 286 334C247 330 223 291 228 236Z"
        />
        <path className="brain-core-brain-stroke" d="M228 236C186 225 148 194 145 146C142 94 184 58 241 67C269 28 324 17 374 32C422 18 470 32 497 65C560 63 606 112 603 169C600 219 559 259 512 266C497 300 461 330 412 334C376 363 324 362 286 334C247 330 223 291 228 236Z" />
        <path className="brain-core-fold" d="M302 82C267 106 253 143 257 177C261 204 252 230 235 253" />
        <path className="brain-core-fold brain-core-fold-violet" d="M376 38C389 80 391 119 386 155C382 190 392 229 421 272" />
        <path className="brain-core-fold" d="M232 158C280 151 318 134 359 108C406 79 449 69 494 84" />
        <path className="brain-core-fold brain-core-fold-violet" d="M228 236C279 223 313 205 356 181C405 154 457 145 509 158" />
        <path className="brain-core-fold" d="M278 294C312 265 350 252 391 237C441 219 482 220 522 237" />
        <path className="brain-core-route brain-core-route-a" d="M302 124L338 158L384 128L422 178L474 120" />
        <path className="brain-core-route brain-core-route-b" d="M260 202L318 220L365 182L424 238L482 210" />
        <path className="brain-core-route brain-core-route-c" d="M307 281L347 257L388 276L433 252" />
        <path className="brain-core-signal brain-core-signal-a" d="M126 171C195 166 237 153 302 124" />
        <path className="brain-core-signal brain-core-signal-b" d="M474 120C538 96 590 89 676 100" />
        <path className="brain-core-signal brain-core-signal-c" d="M482 210C548 220 603 245 676 288" />
        {[
          [302, 124],
          [338, 158],
          [384, 128],
          [422, 178],
          [474, 120],
          [318, 220],
          [365, 182],
          [424, 238],
          [482, 210],
          [347, 257],
          [388, 276],
          [433, 252],
        ].map(([cx, cy], index) => (
          <circle className="brain-core-svg-node" cx={cx} cy={cy} key={`${cx}-${cy}`} r={index > 8 ? 6 : 8} />
        ))}
      </svg>
      {brainNodes.map((node, index) => (
        <span className="brain-core-node" key={`node-${index}`} style={{ top: node.top, left: node.left, animationDelay: node.delay }} />
      ))}
      {brainParticles.map((particle, index) => (
        <span className="brain-core-particle" key={`particle-${index}`} style={{ top: particle.top, left: particle.left, animationDelay: particle.delay }} />
      ))}
    </div>
  );
};

export const BrainCorePanel = ({ title, subtitle, state, metrics = [], variant = "caregiver", size = "large", labels = {}, dataTestid }) => {
  const stateConfig = getBrainStateConfig(state);
  const mode = variant === "doctor" ? "clinical" : variant;
  return (
    <GlassPanel
      className={`brain-core-shell brain-core-grid overflow-hidden p-5 brain-core-panel-${variant}`}
      dataTestid={dataTestid}
      variant="glow"
      style={{
        "--brain-state-color": stateConfig.color,
        "--brain-state-secondary": stateConfig.secondary,
        "--brain-state-rgb": stateConfig.rgb,
      }}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-sm uppercase tracking-[0.26em] text-cyan-100/56">{title}</p>
              {subtitle ? <p className="mt-2 text-sm text-white/58">{subtitle}</p> : null}
            </div>
            <Badge className="rounded-full border px-3 py-1 text-white" style={{ background: `rgba(${stateConfig.rgb}, 0.12)`, borderColor: `rgba(${stateConfig.rgb}, 0.36)`, color: stateConfig.color }}>{state}</Badge>
          </div>
          <BrainCore dataTestid={`${dataTestid || "brain-core-panel"}-visual`} mode={mode} size={size} state={state} />
        </div>
        <div className="space-y-3 rounded-[24px] border border-white/10 bg-[rgba(8,12,24,0.65)] p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/42">{labels.metricsTitle || title}</p>
          <div className="space-y-3">
            {metrics.map((item) => (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2" key={item.label}>
                <span className="text-sm text-white/58">{item.label}</span>
                <span className="font-mono-display text-base text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/38">{labels.rhythmLabel}</p>
            <div className="brain-core-sparkline mt-3 rounded-2xl" />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
};

export const MemoryGraphNetwork = ({ centerLabel, nodes = [], dataTestid }) => (
  <div className="memind-memory-network" data-testid={dataTestid}>
    <div className="memind-memory-network-lines" aria-hidden="true" />
    <div className="memind-memory-node memind-memory-node-center">
      <span>{centerLabel}</span>
    </div>
    {nodes.map((node, index) => (
      <div className={`memind-memory-node memind-memory-node-${index + 1}`} key={`${node.label}-${index}`}>
        <span>{node.label}</span>
        {node.detail ? <small>{node.detail}</small> : null}
      </div>
    ))}
  </div>
);

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

export const PatientBottomNav = ({ items, sticky = true }) => (
  <div className={`${sticky ? "sticky bottom-4 z-20" : ""} mt-6 rounded-[26px] border border-white/10 bg-[rgba(7,10,18,0.92)] p-2 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl`}>
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
