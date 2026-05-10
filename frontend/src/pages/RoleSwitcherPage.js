import { Link } from "react-router-dom";
import { ArrowRight, Bot, HeartHandshake, Settings2, Stethoscope, UserRound } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { GlassPanel, LanguageSwitcher } from "../components/memind/Primitives";
import { useI18n } from "../lib/i18n";

const roleCards = [
  { key: "patient", icon: UserRound, route: "/patient", testId: "role-switcher-patient-button" },
  { key: "caregiver", icon: HeartHandshake, route: "/caregiver", testId: "role-switcher-caregiver-button" },
  { key: "doctor", icon: Stethoscope, route: "/doctor", testId: "role-switcher-doctor-button" },
  { key: "admin", icon: Settings2, route: "/admin", testId: "role-switcher-admin-button" },
];

export default function RoleSwitcherPage({ aiStatus, patients, selectedPatientId, setSelectedPatientId }) {
  const { t, localizeText } = useI18n();
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) || patients[0];

  return (
    <div className="memind-shell memind-role-hero min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-[1380px] flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-[rgba(7,10,18,0.74)] px-5 py-4 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.28em] text-white/48">{t("brand.name")}</p>
            <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">{t("landing.headline")}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/62">{t("landing.subheadline")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`rounded-full border px-4 py-2 ${aiStatus?.fallbackMode ? "memind-badge-mock" : "memind-badge-live"}`} data-testid="landing-ai-status-chip">
              <Bot className="mr-2 h-4 w-4" />
              {aiStatus?.fallbackMode ? t("common.mock") : t("common.live")}
            </Badge>
            <LanguageSwitcher />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {roleCards.map((role) => {
              const Icon = role.icon;
              return (
                <GlassPanel className="flex h-full flex-col justify-between p-6" dataTestid={`${role.key}-role-card`} key={role.key}>
                  <div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-cyan-300/20 bg-cyan-300/10 text-cyan-50">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h2 className="mt-6 font-display text-2xl text-white">{t(`roles.${role.key}.title`)}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/62">{t(`roles.${role.key}.subtitle`)}</p>
                  </div>
                  <Button asChild className="mt-8 h-12 justify-between rounded-2xl bg-cyan-300 px-5 text-slate-950 hover:bg-cyan-200">
                    <Link data-testid={role.testId} to={role.route}>
                      {t("landing.enter")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </GlassPanel>
              );
            })}
          </div>

          <div className="grid gap-6">
            <GlassPanel className="overflow-hidden p-0" dataTestid="landing-trust-panel">
              <div className="grid gap-0 md:grid-cols-[1fr_0.95fr]">
                <div className="p-6 md:p-8">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">{t("landing.trustTitle")}</p>
                  <h2 className="mt-4 font-display text-3xl text-white">{t("brand.tagline")}</h2>
                  <p className="mt-4 text-sm leading-7 text-white/62">{t("landing.trustCopy")}</p>
                  <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/45">{t("caregiver.identity")}</p>
                    <div className="mt-3 space-y-3 text-sm text-white/68">
                      <p>{selectedPatient?.name}</p>
                      <p>{localizeText(selectedPatient?.diagnosis)}</p>
                      <p>{localizeText(selectedPatient?.stage)}</p>
                      <p>{localizeText(selectedPatient?.location)}</p>
                    </div>
                  </div>
                </div>
                <div className="min-h-[320px] bg-[url('https://images.unsplash.com/flagged/photo-1567318362383-fa193e67bbd5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDZ8MHwxfHNlYXJjaHwxfHxlbGRlcmx5JTIwY2FyZWdpdmVyJTIwZmFtaWx5JTIwcG9ydHJhaXQlMjB3YXJtfGVufDB8fHx8MTc3ODQ0NzA4MXww&ixlib=rb-4.1.0&q=85')] bg-cover bg-center" />
              </div>
            </GlassPanel>

            <GlassPanel className="p-6" dataTestid="landing-demo-patient-panel">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-white">Demo patient context</p>
                  <p className="mt-2 text-sm text-white/58">{t("landing.privacy")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {patients.map((patient) => (
                    <button
                      className={`rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${selectedPatientId === patient.id ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-100" : "border-white/10 bg-white/[0.04] text-white/68 hover:bg-white/[0.08] hover:text-white"}`}
                      data-testid={`landing-patient-selector-${patient.id}`}
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      type="button"
                    >
                      {patient.name}
                    </button>
                  ))}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
