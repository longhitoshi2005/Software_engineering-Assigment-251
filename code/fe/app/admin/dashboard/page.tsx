"use client";

import Link from "next/link";

export default function AdminDashboardPage() {
  const kpis = [
    { label: "SSO status", value: "Online", badge: "green" },
    { label: "Last DATACORE sync", value: "5 mins ago", badge: "blue" },
    { label: "Pending exports", value: "2", badge: "orange" },
    { label: "Audit events (24h)", value: "134", badge: "gray" },
  ];

  const recentExports = [
    { id: "E-090", name: "Departmental Report (CSV)", at: "2025-11-01 21:15", status: "Done" },
    { id: "E-091", name: "Participation Report (PDF)", at: "2025-11-02 08:05", status: "Queued" },
    { id: "E-092", name: "Audit Logs (CSV)", at: "2025-11-02 09:40", status: "Processing" },
  ];

  const integrations = [
    { name: "HCMUT_SSO", status: "OK", lastChecked: "2025-11-02 10:05" },
    { name: "DATACORE", status: "OK", lastChecked: "2025-11-02 10:03" },
    { name: "HCMUT_LIBRARY", status: "DEGRADED", lastChecked: "2025-11-02 09:58" },
  ];

  const getBadgeColor = (badge: string) => {
    const colors = {
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[badge as keyof typeof colors] || colors.gray;
  };

  const getStatusColor = (status: string) => {
    if (status === "OK") return "text-green-700 bg-green-50 border-green-200";
    if (status === "DEGRADED") return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getExportStatusColor = (status: string) => {
    if (status === "Done") return "text-green-700 bg-green-50";
    if (status === "Queued") return "text-orange-700 bg-orange-50";
    if (status === "Processing") return "text-blue-700 bg-blue-50";
    return "text-gray-700 bg-gray-50";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Admin Dashboard</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Monitor integrations, exports, and system health for the Tutor Support System.
        </p>
      </header>

      {/* KPI Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white border border-soft-white-blue rounded-lg p-4 flex flex-col"
          >
            <span className="text-xs font-medium text-black/60 uppercase tracking-wide">
              {kpi.label}
            </span>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-dark-blue">{kpi.value}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded border ${getBadgeColor(kpi.badge)}`}
              >
                {kpi.badge}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Recent Exports */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-blue">Recent Exports</h2>
          <Link
            href="/admin/exports"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {recentExports.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 bg-soft-white-blue rounded border border-soft-white-blue"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-blue">{exp.name}</p>
                <p className="text-xs text-black/60 mt-0.5">
                  {exp.id} · {exp.at}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-medium ${getExportStatusColor(
                  exp.status
                )}`}
              >
                {exp.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Integrations Health */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-blue">Integrations</h2>
          <Link
            href="/admin/integrations"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrations.map((int) => (
            <div
              key={int.name}
              className="p-4 bg-soft-white-blue rounded border border-soft-white-blue"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-dark-blue">{int.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded border font-medium ${getStatusColor(
                    int.status
                  )}`}
                >
                  {int.status}
                </span>
              </div>
              <p className="text-xs text-black/60">Last checked: {int.lastChecked}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
