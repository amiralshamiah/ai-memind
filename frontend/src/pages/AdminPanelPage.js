import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Activity, Database, FileLock2, MonitorCog, ShieldCheck, Users } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/memind/AppShell";
import { EthicsConsentBanner, GlassPanel, MetricTile } from "../components/memind/Primitives";
import { fetchAdminOverview } from "../lib/api";
import { useI18n } from "../lib/i18n";

export default function AdminPanelPage() {
  const location = useLocation();
  const section = location.pathname.split("/")[2] || "overview";
  const { t, localizeText, formatDateTime } = useI18n();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { to: "/admin", label: t("common.overview"), icon: Activity, testId: "admin-nav-overview" },
    { to: "/admin/users", label: t("common.users"), icon: Users, testId: "admin-nav-users" },
    { to: "/admin/audit", label: t("common.audit"), icon: FileLock2, testId: "admin-nav-audit" },
    { to: "/admin/ai", label: t("common.aiStatus"), icon: MonitorCog, testId: "admin-nav-ai" },
    { to: "/admin/consents", label: t("common.consents"), icon: ShieldCheck, testId: "admin-nav-consents" },
    { to: "/admin/health", label: t("common.systemHealth"), icon: Database, testId: "admin-nav-health" },
  ];

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        setOverview(await fetchAdminOverview());
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="memind-ai-grid">
        <MetricTile dataTestid="admin-metric-patients" detail={t("admin.summary")} label="Patients" value={overview?.summary?.totalPatients || 0} />
        <MetricTile dataTestid="admin-metric-doctors" detail={t("common.active")} label="Doctors" value={overview?.summary?.activeDoctors || 0} />
        <MetricTile dataTestid="admin-metric-caregivers" detail={t("common.active")} label="Caregivers" value={overview?.summary?.activeCaregivers || 0} />
        <MetricTile dataTestid="admin-metric-alerts" detail={t("common.active")} label="Alerts" value={overview?.summary?.activeAlerts || 0} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <GlassPanel className="space-y-4" dataTestid="admin-overview-ai-status-panel">
          <p className="font-display text-2xl text-white">{t("common.aiStatus")}</p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/62">
            <p>{overview?.aiStatus?.configuredProvider} / {overview?.aiStatus?.configuredModel}</p>
            <p>{overview?.aiStatus?.fallbackMode ? t("common.mock") : t("common.live")}</p>
            <p>{t("common.lastUpdated")}: {overview?.aiStatus?.lastGeneratedAt ? formatDateTime(overview.aiStatus.lastGeneratedAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[t("admin.subscriptions"), t("admin.dataExport"), t("admin.gdprDeletion")].map((label) => (
              <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm text-white/58" key={label}>
                <p className="text-white">{label}</p>
                <p className="mt-2">{t("common.comingSoon")}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
        <GlassPanel className="space-y-4" dataTestid="admin-overview-system-panel">
          <p className="font-display text-2xl text-white">{t("common.systemHealth")}</p>
          {(overview?.systemHealth || []).map((entry) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-white">{entry.service}</p>
                <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{entry.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-white/58">{entry.value}</p>
            </div>
          ))}
        </GlassPanel>
      </div>
      <EthicsConsentBanner compact dataTestid="admin-overview-ethics-banner" />
    </div>
  );

  const renderUsers = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="space-y-4" dataTestid="admin-users-table">
        <p className="font-display text-2xl text-white">Patients</p>
        {(overview?.patients || []).map((patient) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={patient.id}>
            <p className="text-white">{patient.name}</p>
            <p className="mt-2 text-sm text-white/58">{localizeText(patient.diagnosis)} · {localizeText(patient.stage)}</p>
          </div>
        ))}
      </GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="admin-caregivers-table">
        <p className="font-display text-2xl text-white">Doctors & caregivers</p>
        {[...(overview?.doctors || []), ...(overview?.caregivers || [])].map((person) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={person.id}>
            <p className="text-white">{person.name}</p>
            <p className="mt-2 text-sm text-white/58">{localizeText(person.specialty || person.relationship)}</p>
          </div>
        ))}
      </GlassPanel>
    </div>
  );

  const renderAudit = () => (
    <GlassPanel className="space-y-4" dataTestid="admin-audit-log-table">
      {(overview?.auditLogs || []).map((entry) => (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id || `${entry.action}-${entry.timestamp}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-white">{entry.action}</p>
            <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{entry.actorRole}</Badge>
          </div>
          <p className="mt-2 text-sm text-white/58">{entry.target} · {formatDateTime(entry.timestamp, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      ))}
    </GlassPanel>
  );

  const renderAi = () => (
    <GlassPanel className="space-y-4" dataTestid="admin-ai-status-card">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/62">
        <p>{overview?.aiStatus?.configuredProvider} / {overview?.aiStatus?.configuredModel}</p>
        <p>{t("common.confidence")}: provider abstraction active</p>
        <p>{overview?.aiStatus?.fallbackMode ? t("common.mock") : t("common.live")}</p>
        <p>{t("admin.dataExport")}: {t("common.comingSoon")}</p>
        <p>{t("admin.gdprDeletion")}: {t("common.comingSoon")}</p>
      </div>
    </GlassPanel>
  );

  const renderConsents = () => (
    <div className="space-y-4">
      {(overview?.consents || []).map((consent) => (
        <GlassPanel className="flex items-center justify-between gap-4" dataTestid={`admin-consent-${consent.id}`} key={consent.id}>
          <div>
            <p className="text-white">{localizeText(consent.category)}</p>
            <p className="mt-2 text-sm text-white/58">{localizeText(consent.grantedTo)}</p>
          </div>
          <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{consent.status}</Badge>
        </GlassPanel>
      ))}
    </div>
  );

  const renderHealth = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="space-y-4" dataTestid="admin-system-health-list">
        {(overview?.systemHealth || []).map((entry) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id}>
            <p className="text-white">{entry.service}</p>
            <p className="mt-2 text-sm text-white/58">{entry.value}</p>
          </div>
        ))}
      </GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="admin-devices-list">
        {(overview?.devices || []).map((device) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={device.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-white">{device.name}</p>
              <Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{device.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-white/58">{formatDateTime(device.lastSeen, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        ))}
      </GlassPanel>
    </div>
  );

  const sectionView = {
    overview: renderOverview(),
    users: renderUsers(),
    audit: renderAudit(),
    ai: renderAi(),
    consents: renderConsents(),
    health: renderHealth(),
  };

  return (
    <AppShell role="admin" subtitle={t("roles.admin.subtitle")} title={t("roles.admin.title")} navItems={navItems}>
      {loading ? <GlassPanel className="h-[460px] animate-pulse bg-white/[0.04]" dataTestid="admin-loading-state" /> : sectionView[section] || renderOverview()}
    </AppShell>
  );
}
