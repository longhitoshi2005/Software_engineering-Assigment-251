"use client";

import { useState } from "react";
import ClientRoleGuard from "@/src/components/ClientRoleGuard";
import { hasRole, Role } from '@/src/lib/role';

interface AuditLog {
  time: string;
  actor: string;
  event: string;
  target: string;
  details: string;
}

export default function AdminAuditLogsPage() {
  const allLogs: AuditLog[] = [
    {
      time: "2025-11-02 10:10",
      actor: "admin@hcmut.edu.vn",
      event: "EXPORT",
      target: "Departmental CSV",
      details: "Job E-091 created",
    },
    {
      time: "2025-11-02 10:05",
      actor: "system",
      event: "SYNC",
      target: "DATACORE",
      details: "34 profiles updated",
    },
    {
      time: "2025-11-02 09:55",
      actor: "coord01",
      event: "ROLE_CHANGE",
      target: "student 2352525",
      details: "Role -> TUTOR (temporary)",
    },
    {
      time: "2025-11-02 09:40",
      actor: "admin@hcmut.edu.vn",
      event: "EXPORT",
      target: "Audit Logs CSV",
      details: "Job E-092 created",
    },
    {
      time: "2025-11-02 09:30",
      actor: "2352525@hcmut.edu.vn",
      event: "LOGIN",
      target: "Student Portal",
      details: "SSO authentication successful",
    },
    {
      time: "2025-11-02 09:15",
      actor: "system",
      event: "SYNC",
      target: "HCMUT_LIBRARY",
      details: "12 resources indexed",
    },
    {
      time: "2025-11-02 08:50",
      actor: "coord01",
      event: "ROLE_CHANGE",
      target: "student 2353001",
      details: "Role -> COORDINATOR (temporary)",
    },
    {
      time: "2025-11-02 08:30",
      actor: "admin@hcmut.edu.vn",
      event: "LOGIN",
      target: "Admin Portal",
      details: "SSO authentication successful",
    },
  ];

  const [logs] = useState<AuditLog[]>(allLogs);
  const [filterActor, setFilterActor] = useState("");
  const [filterEvent, setFilterEvent] = useState("ALL");

  const filteredLogs = logs.filter((log) => {
    const matchesActor =
      !filterActor ||
      log.actor.toLowerCase().includes(filterActor.toLowerCase()) ||
      log.target.toLowerCase().includes(filterActor.toLowerCase());
    const matchesEvent = filterEvent === "ALL" || log.event === filterEvent;
    return matchesActor && matchesEvent;
  });

  const getEventColor = (event: string) => {
    if (event === "LOGIN") return "text-blue-700 bg-blue-50";
    if (event === "ROLE_CHANGE") return "text-purple-700 bg-purple-50";
    if (event === "EXPORT") return "text-green-700 bg-green-50";
    if (event === "SYNC") return "text-orange-700 bg-orange-50";
    return "text-gray-700 bg-gray-50";
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.PROGRAM_ADMIN]} title="Audit logs (Admin only)">
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Audit Logs</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          View recent authentication events, role changes, exports, and data sync activities.
        </p>
      </header>

      {/* Filter Bar */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-blue mb-1">
              Actor (user or system)
            </label>
            <input
              type="text"
              placeholder="Search by actor or target..."
              value={filterActor}
              onChange={(e) => setFilterActor(e.target.value)}
              className="w-full px-3 py-2 border border-soft-white-blue rounded bg-soft-white-blue focus:outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-blue mb-1">Event Type</label>
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full px-3 py-2 border border-soft-white-blue rounded bg-soft-white-blue focus:outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="ALL">All Events</option>
              <option value="LOGIN">LOGIN</option>
              <option value="ROLE_CHANGE">ROLE_CHANGE</option>
              <option value="EXPORT">EXPORT</option>
              <option value="SYNC">SYNC</option>
            </select>
          </div>
        </div>
      </section>

      {/* Audit Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <h2 className="text-base font-semibold text-dark-blue mb-3">
          Audit Events ({filteredLogs.length})
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Time</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Actor</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Event</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Target</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-black/60">
                  No audit logs match your filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr
                  key={idx}
                  className="border-b border-soft-white-blue hover:bg-soft-white-blue"
                >
                  <td className="py-3 px-3 text-black/60 whitespace-nowrap">{log.time}</td>
                  <td className="py-3 px-3 font-medium text-dark-blue">{log.actor}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(
                        log.event
                      )}`}
                    >
                      {log.event}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-black/70">{log.target}</td>
                  <td className="py-3 px-3 text-black/60">{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
    </ClientRoleGuard>
  );
}