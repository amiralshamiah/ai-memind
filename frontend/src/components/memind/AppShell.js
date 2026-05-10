import { Link, NavLink } from "react-router-dom";
import { ActivitySquare, ChevronLeft, ShieldCheck } from "lucide-react";

import { Button } from "../ui/button";
import { LanguageSwitcher } from "./Primitives";
import { useI18n } from "../../lib/i18n";

export const AppShell = ({ role, title, subtitle, navItems = [], topRight, children }) => {
  const { t } = useI18n();

  if (role === "patient") {
    return (
      <div className="memind-shell px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link className="font-display text-sm text-white/72" data-testid="patient-back-role-switcher-link" to="/">
            <ChevronLeft className="mr-1 inline h-4 w-4" />
            {t("common.backHome")}
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mx-auto mt-4 max-w-5xl space-y-4">{children}</div>
      </div>
    );
  }

  return (
    <div className="memind-shell min-h-screen">
      <div className="mx-auto flex min-h-screen w-full gap-4 px-4 py-4 lg:px-6 2xl:px-8">
        <aside className="hidden w-[258px] shrink-0 lg:flex lg:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(11,16,32,0.82)] p-4 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/18 bg-cyan-300/10 text-cyan-100 shadow-[0_0_28px_rgba(0,212,255,0.14)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-display text-[11px] uppercase tracking-[0.28em] text-white/40">Memind</p>
                <h1 className="font-display text-[2rem] leading-tight text-white">{title}</h1>
              </div>
            </div>
            <nav className="space-y-2" data-testid={`${role}-sidebar-navigation`}>
              {navItems.map((item) => (
                <NavLink className="memind-sidebar-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/80" data-testid={item.testId} key={item.to} to={item.to}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-cyan-100">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">{item.label}</div>
                  {item.badge ? <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/55">{item.badge}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <ActivitySquare className="h-4 w-4 text-cyan-200" />
                {t("ethics.title")}
              </div>
              <p className="mt-3 text-xs leading-6 text-white/55">{t("ethics.notDiagnosis")} {t("ethics.doctorReview")}</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <header className="memind-topbar-blur sticky top-4 z-20 rounded-[28px] border border-white/10 px-5 py-4 shadow-[var(--mm-shadow-elev)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="min-w-0">
                <p className="font-display text-2xl text-white md:text-[2rem]">{title}</p>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-white/58">{subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSwitcher />
                <Button asChild className="bg-white/10 text-white hover:bg-white/14">
                  <Link data-testid={`${role}-back-role-switcher-link`} to="/">{t("common.backHome")}</Link>
                </Button>
                {topRight}
              </div>
            </div>
          </header>
          <main className="memind-route-transition min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
};
