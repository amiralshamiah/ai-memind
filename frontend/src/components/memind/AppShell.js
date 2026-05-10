import { Link, NavLink } from "react-router-dom";
import { ActivitySquare, ChevronLeft, ShieldCheck } from "lucide-react";

import { Button } from "../ui/button";
import { LanguageSwitcher } from "./Primitives";
import { useI18n } from "../../lib/i18n";

export const AppShell = ({
  role,
  title,
  subtitle,
  navItems = [],
  topRight,
  children,
}) => {
  const { t } = useI18n();

  if (role === "patient") {
    return (
      <div className="memind-shell px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link className="font-display text-sm text-white/72" to="/" data-testid="patient-back-role-switcher-link">
            <ChevronLeft className="mr-1 inline h-4 w-4" />
            {t("common.backHome")}
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mx-auto mt-4 max-w-md space-y-4">{children}</div>
      </div>
    );
  }

  return (
    <div className="memind-shell min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px] gap-6 px-4 py-4 lg:px-6">
        <aside className="hidden w-[280px] shrink-0 lg:flex lg:flex-col">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[var(--mm-shadow-elev)] backdrop-blur-xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="font-display text-xs uppercase tracking-[0.28em] text-white/45">Memind</p>
                <h1 className="mt-2 font-display text-2xl text-white">{title}</h1>
              </div>
              <ShieldCheck className="h-10 w-10 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-2 text-cyan-200" />
            </div>
            <nav className="space-y-2" data-testid={`${role}-sidebar-navigation`}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className="memind-sidebar-link flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-white/80"
                  data-testid={item.testId}
                  to={item.to}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4 text-cyan-200" />
                    {item.label}
                  </span>
                  {item.badge ? <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/55">{item.badge}</span> : null}
                </NavLink>
              ))}
            </nav>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-display text-2xl text-white">{title}</p>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/58">{subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <LanguageSwitcher />
                <Button asChild className="bg-white/10 text-white hover:bg-white/14">
                  <Link to="/" data-testid={`${role}-back-role-switcher-link`}>{t("common.backHome")}</Link>
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
