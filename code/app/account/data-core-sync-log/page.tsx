"use client";

import React, { useMemo, useState } from "react";

type SyncLog = {
  id: string;
  at: string;               // ISO or display
  actor: "system" | "admin";
  scope: "users" | "roles" | "profiles" | "all";
  status: "OK" | "PARTIAL" | "FAILED";
  details?: string;
};

const logs: SyncLog[] = [
  { id: "L-210", at: "2025-11-02 08:05", actor: "system", scope: "roles", status: "OK", details: "84 roles updated" },
  { id: "L-209", at: "2025-11-01 21:15", actor: "admin",  scope: "users", status: "PARTIAL", details: "timeout at page 7/10" },
  { id: "L-208", at: "2025-11-01 07:00", actor: "system", scope: "all",   status: "OK", details: "full sync" },
  { id: "L-207", at: "2025-10-31 21:00", actor: "system", scope: "roles", status: "FAILED", details: "SSO token expired" },
];

const DataCoreSyncLog: React.FC = () => {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<SyncLog["scope"] | "any">("any");
  const [status, setStatus] = useState<SyncLog["status"] | "any">("any");

  const filtered = useMemo(() => {
    return logs.filter(l => {
      const textOK =
        !q ||
        l.id.toLowerCase().includes(q.toLowerCase()) ||
        l.at.toLowerCase().includes(q.toLowerCase()) ||
        (l.details ?? "").toLowerCase().includes(q.toLowerCase());

      const scopeOK = scope === "any" || l.scope === scope;
      const statusOK = status === "any" || l.status === status;

      return textOK && scopeOK && statusOK;
    });
  }, [q, scope, status]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">DATACORE Sync Log</h1>
        <p className="text-sm text-black/70 mt-1">
          Track synchronization runs with DATACORE (users, roles, profiles). Use this to explain FR-INT &amp; FR-NI-02.
        </p>
      </section>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search log id, time, details…"
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          />
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as any)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="any">Any scope</option>
            <option value="roles">Roles</option>
            <option value="users">Users</option>
            <option value="profiles">Profiles</option>
            <option value="all">All</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="any">Any status</option>
            <option value="OK">OK</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="text-sm font-semibold rounded-lg px-3 py-2"
            style={{ background: "var(--color-light-heavy-blue)", color: "var(--color-white)" }}
          >
            Run sync now
          </button>
          <button
            className="text-sm font-semibold rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
            style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
          >
            View system status
          </button>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--color-soft-white-blue)" }}>
                <th className="py-2 pr-4 text-dark-blue">Log ID</th>
                <th className="py-2 pr-4 text-dark-blue">When</th>
                <th className="py-2 pr-4 text-dark-blue">Actor</th>
                <th className="py-2 pr-4 text-dark-blue">Scope</th>
                <th className="py-2 pr-4 text-dark-blue">Status</th>
                <th className="py-2 pr-4 text-dark-blue">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-b last:border-0" style={{ borderColor: "var(--color-soft-white-blue)" }}>
                  <td className="py-2 pr-4 font-semibold text-dark-blue">{l.id}</td>
                  <td className="py-2 pr-4">{l.at}</td>
                  <td className="py-2 pr-4">{l.actor}</td>
                  <td className="py-2 pr-4">{l.scope}</td>
                  <td className="py-2 pr-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                      style={{
                        background: "var(--color-soft-white-blue)",
                        color:
                          l.status === "OK"
                            ? "var(--color-light-heavy-blue)"
                            : l.status === "PARTIAL"
                            ? "var(--color-light-blue)"
                            : "var(--color-medium-light-blue)",
                      }}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-black/70">{l.details ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default DataCoreSyncLog;