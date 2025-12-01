"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasRole, Role } from "@/lib/role";

type BadgeColor = "green" | "blue" | "orange" | "gray";

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [recentExports, setRecentExports] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);

  // Load dashboard data
  const loadDashboard = async () => {
    const res = await fetch("/api/admin/dashboard");
    const data = await res.json();

    setKpis(data.kpis);
    setRecentExports(data.recentExports);
    setIntegrations(data.integrations);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Only green badge is allowed to show (for "Online")
  const badgeDotClass = (badge: BadgeColor) => {
    if (badge !== "green") return "hidden"; // hide ALL other dots
    return "inline-block w-3 h-3 rounded-full bg-green-500 border border-green-600";
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

      {/* HEADER */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Admin Dashboard</h1>
        <p className="text-sm text-black/70 mt-1">
          Monitor integrations, exports, and system health for the Tutor Support System.
        </p>
      </header>

      {/* KPI GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white border border-soft-white-blue rounded-lg p-4">

            <span className="text-xs font-medium text-black/60 uppercase tracking-wide">
              {kpi.label}
            </span>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl font-bold text-dark-blue">{kpi.value}</span>

              {/* Only show DOT if badge === green */}
              <span className={badgeDotClass(kpi.badge as BadgeColor)}></span>
            </div>
          </div>
        ))}
      </section>

      {/* RECENT EXPORTS */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-blue">Recent Exports</h2>

          {hasRole(Role.PROGRAM_ADMIN) ? (
            <Link href="/admin/exports" className="text-sm text-blue-600 hover:text-blue-800">
              View all →
            </Link>
          ) : (
            <p className="text-sm text-black/60">
              Recent exports list is available to Program Admins.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {recentExports.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3 bg-soft-white-blue rounded border border-soft-white-blue"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-blue">{exp.name}</p>
                <p className="text-xs text-black/60">
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

      {/* INTEGRATIONS */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-blue">Integrations</h2>

          {hasRole(Role.PROGRAM_ADMIN) ? (
            <Link href="/admin/integrations" className="text-sm text-blue-600 hover:text-blue-800">
              Manage →
            </Link>
          ) : (
            <p className="text-sm text-black/60">
              Integration management is available only to Program Admins.
            </p>
          )}
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

              <p className="text-xs text-black/60">
                Last checked: {int.lastChecked}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
