// lib/mocks/db/dashboard.ts

export interface KPI {
  label: string;
  value: string;
  badge: "green" | "blue" | "orange" | "gray";
}

export interface RecentExport {
  id: string;
  name: string;
  at: string;
  status: "Done" | "Queued" | "Processing";
}

export interface IntegrationHealth {
  name: string;
  status: "OK" | "DEGRADED" | "OFFLINE";
  lastChecked: string;
}

// === STATIC MOCK DATA (NO format function) ===
export const DASHBOARD_KPIS: KPI[] = [
  { label: "SSO status", value: "Online", badge: "green" },
  { label: "Last DATACORE sync", value: "5 mins ago", badge: "blue" },
  { label: "Pending exports", value: "2", badge: "orange" },
  { label: "Audit events (24h)", value: "134", badge: "gray" },
];

export const DASHBOARD_RECENT_EXPORTS: RecentExport[] = [
  {
    id: "E-090",
    name: "Departmental Report (CSV)",
    at: "11/01/2025, 09:15 PM",
    status: "Done",
  },
  {
    id: "E-091",
    name: "Participation Report (PDF)",
    at: "11/02/2025, 08:05 AM",
    status: "Queued",
  },
  {
    id: "E-092",
    name: "Audit Logs (CSV)",
    at: "11/02/2025, 09:40 AM",
    status: "Processing",
  },
];

export const DASHBOARD_INTEGRATIONS: IntegrationHealth[] = [
  {
    name: "HCMUT_SSO",
    status: "OK",
    lastChecked: "11/02/2025, 10:05 AM",
  },
  {
    name: "DATACORE",
    status: "OK",
    lastChecked: "11/02/2025, 10:03 AM",
  },
  {
    name: "HCMUT_LIBRARY",
    status: "DEGRADED",
    lastChecked: "11/02/2025, 09:58 AM",
  },
];

export const getDashboardData = () => ({
  kpis: DASHBOARD_KPIS,
  recentExports: DASHBOARD_RECENT_EXPORTS,
  integrations: DASHBOARD_INTEGRATIONS,
});
