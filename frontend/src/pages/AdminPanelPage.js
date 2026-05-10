import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Activity, Database, FileLock2, MonitorCog, ShieldCheck, Sparkles, Users } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { AppShell } from "../components/memind/AppShell";
import { AiStatusRing, EthicsConsentBanner, GlassPanel, MetricTile, RiskCard } from "../components/memind/Primitives";
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

  const consentRate = useMemo(() => {
    const consents = overview?.consents || [];
    if (!consents.length) return 0;
    return Math.round((consents.filter((item) => item.status === "granted").length / consents.length) * 100);
  }, [overview]);

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <MetricTile dataTestid="admin-metric-patients" detail={t("common.active")} label="Patients" value={overview?.summary?.totalPatients || 0} />
        <MetricTile dataTestid="admin-metric-doctors" detail={t("common.active")} label="Doctors" value={overview?.summary?.activeDoctors || 0} />
        <MetricTile dataTestid="admin-metric-caregivers" detail={t("common.active")} label="Caregivers" value={overview?.summary?.activeCaregivers || 0} />
        <MetricTile dataTestid="admin-metric-pending-consents" detail={t("common.consents")} label="Open Consents" value={overview?.summary?.pendingConsentApprovals || 0} />
        <MetricTile dataTestid="admin-metric-alerts" detail={t("common.active")} label="Alerts" value={overview?.summary?.activeAlerts || 0} />
        <MetricTile dataTestid="admin-metric-system" detail={t("common.systemHealth")} label="System" value={overview?.summary?.aiSystemStatus || "healthy"} tone="glow" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <GlassPanel className="space-y-4" dataTestid="admin-system-health-panel" variant="strong">
            <p className="font-display text-2xl text-white">{t("common.systemHealth")}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {(overview?.systemHealth || []).map((entry) => (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id}>
                  <div className="flex items-center justify-between gap-3"><p className="text-white">{entry.service}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{entry.status}</Badge></div>
                  <p className="mt-2 text-sm text-white/58">{entry.value}</p>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4" dataTestid="admin-ai-model-status-panel" variant="strong">
            <p className="font-display text-2xl text-white">{t("common.aiStatus")}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/62">
                <p>{overview?.aiStatus?.configuredProvider} / {overview?.aiStatus?.configuredModel}</p>
                <p>{overview?.aiStatus?.fallbackMode ? t("common.mock") : t("common.live")}</p>
                <p>{t("common.lastUpdated")}: {overview?.aiStatus?.lastGeneratedAt ? formatDateTime(overview.aiStatus.lastGeneratedAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</p>
              </div>
              <div className="grid gap-3">
                <RiskCard dataTestid="admin-ai-runtime-card" icon={Sparkles} label="AI Runtime" sublabel="Health" tone="mint" value="Online" />
                <RiskCard dataTestid="admin-storage-card" icon={Database} label="Storage" sublabel="Mongo" tone="cyan" value={overview?.summary?.storageStatus || "stable"} />
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="space-y-4">
          <AiStatusRing dataTestid="admin-consent-overview-ring" label="Consent Overview" score={`${consentRate}%`} status="Granted" subScores={[{ label: "Audio", value: "92%" }, { label: "Video", value: "78%" }, { label: "Location", value: "88%" }, { label: "Reports", value: "81%" }]} />
          <GlassPanel className="space-y-4" dataTestid="admin-quick-actions-panel" variant="strong">
            <p className="font-display text-2xl text-white">Privacy & GDPR</p>
            {[t("admin.dataExport"), t("admin.gdprDeletion"), t("admin.subscriptions")].map((label) => (
              <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm text-white/58" key={label}>
                <p className="text-white">{label}</p>
                <p className="mt-2">{t("common.comingSoon")}</p>
              </div>
            ))}
          </GlassPanel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <GlassPanel className="space-y-4" dataTestid="admin-audit-log-table" variant="strong">
          <p className="font-display text-2xl text-white">{t("common.audit")}</p>
          {(overview?.auditLogs || []).slice(0, 6).map((entry) => (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id || `${entry.action}-${entry.timestamp}`}>
              <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-white">{entry.action}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{entry.actorRole}</Badge></div>
              <p className="mt-2 text-sm text-white/58">{entry.target} · {formatDateTime(entry.timestamp, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          ))}
        </GlassPanel>
        <EthicsConsentBanner compact dataTestid="admin-overview-ethics-banner" />
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="space-y-4" dataTestid="admin-users-table" variant="strong">
        <p className="font-display text-2xl text-white">Patients</p>
        {(overview?.patients || []).map((patient) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={patient.id}><p className="text-white">{patient.name}</p><p className="mt-2 text-sm text-white/58">{localizeText(patient.diagnosis)} · {localizeText(patient.stage)}</p></div>
        ))}
      </GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="admin-caregivers-table" variant="strong">
        <p className="font-display text-2xl text-white">Doctors & caregivers</p>
        {[...(overview?.doctors || []), ...(overview?.caregivers || [])].map((person) => (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={person.id}><p className="text-white">{person.name}</p><p className="mt-2 text-sm text-white/58">{localizeText(person.specialty || person.relationship)}</p></div>
        ))}
      </GlassPanel>
    </div>
  );

  const renderAudit = () => (
    <GlassPanel className="space-y-4" dataTestid="admin-audit-log-table-detailed" variant="strong">
      {(overview?.auditLogs || []).map((entry) => (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id || `${entry.action}-${entry.timestamp}`}><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-white">{entry.action}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{entry.actorRole}</Badge></div><p className="mt-2 text-sm text-white/58">{entry.target} · {formatDateTime(entry.timestamp, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>
      ))}
    </GlassPanel>
  );

  const renderAi = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="space-y-4" dataTestid="admin-ai-status-card" variant="strong"><p className="font-display text-2xl text-white">{t("common.aiStatus")}</p><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/62"><p>{overview?.aiStatus?.configuredProvider} / {overview?.aiStatus?.configuredModel}</p><p>{t("common.confidence")}: provider abstraction active</p><p>{overview?.aiStatus?.fallbackMode ? t("common.mock") : t("common.live")}</p></div></GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="admin-devices-list" variant="strong">{(overview?.devices || []).map((device) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={device.id}><div className="flex items-center justify-between gap-3"><p className="text-white">{device.name}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{device.status}</Badge></div><p className="mt-2 text-sm text-white/58">{formatDateTime(device.lastSeen, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p></div>)}</GlassPanel>
    </div>
  );

  const renderConsents = () => (
    <div className="space-y-4">{(overview?.consents || []).map((consent) => <GlassPanel className="flex items-center justify-between gap-4" dataTestid={`admin-consent-${consent.id}`} key={consent.id} variant="strong"><div><p className="text-white">{localizeText(consent.category)}</p><p className="mt-2 text-sm text-white/58">{localizeText(consent.grantedTo)}</p></div><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{consent.status}</Badge></GlassPanel>)}</div>
  );

  const renderHealth = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
      <GlassPanel className="space-y-4" dataTestid="admin-system-health-list" variant="strong">{(overview?.systemHealth || []).map((entry) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={entry.id}><p className="text-white">{entry.service}</p><p className="mt-2 text-sm text-white/58">{entry.value}</p></div>)}</GlassPanel>
      <GlassPanel className="space-y-4" dataTestid="admin-alerts-list" variant="strong">{(overview?.alerts || []).map((alert) => <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4" key={alert.id}><div className="flex items-center justify-between gap-3"><p className="text-white">{localizeText(alert.title)}</p><Badge className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-white/72">{alert.level}</Badge></div></div>)}</GlassPanel>
    </div>
  );

  const sectionView = { overview: renderOverview(), users: renderUsers(), audit: renderAudit(), ai: renderAi(), consents: renderConsents(), health: renderHealth() };

  return <AppShell role="admin" subtitle={t("roles.admin.subtitle")} title={t("roles.admin.title")} navItems={navItems}>{loading ? <GlassPanel className="h-[540px] animate-pulse bg-white/[0.04]" dataTestid="admin-loading-state" /> : sectionView[section] || renderOverview()}</AppShell>;
}
