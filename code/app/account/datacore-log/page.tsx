"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";

type SyncLog = {
  id: string;
  at: string;
  actor: "system" | "admin";
  scope: "users" | "roles" | "profiles" | "all";
  status: "OK" | "PARTIAL" | "FAILED";
  details?: string;
};

const DataCoreSyncLog: React.FC = () => {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false); // Thêm state để disable nút khi đang sync

  const [q, setQ] = useState("");
  const [scope, setScope] = useState<SyncLog["scope"] | "any">("any");
  const [status, setStatus] = useState<SyncLog["status"] | "any">("any");

  const [message, setMessage] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Xử lý dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showMessage = (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(text);
    timerRef.current = setTimeout(() => setMessage(""), 2500);
  };

  // -----------------------------
  // LOAD LOGS FROM BACKEND
  // -----------------------------
  const loadLogs = async () => {
    try {
      // Không set loading=true ở đây để tránh nháy giao diện khi reload ngầm
      const res = await fetch("/api/datacore/sync-log");
      if (!res.ok) throw new Error("Failed to fetch logs");
      
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error(error);
      showMessage("Error loading logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // -----------------------------
  // RUN SYNC NOW (backend)
  // -----------------------------
  const runSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    showMessage("Running DATACORE sync…");

    try {
      const res = await fetch("/api/datacore/sync-log/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: "all" }),
      });

      if (!res.ok) throw new Error("Sync failed");

      await loadLogs(); // Reload lại list sau khi sync xong
      showMessage("Sync completed successfully.");
    } catch (error) {
      console.error(error);
      showMessage("Sync failed. Please check console.");
    } finally {
      setIsSyncing(false);
    }
  };

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const textOK =
        !q ||
        l.id.toLowerCase().includes(q.toLowerCase()) ||
        l.at.toLowerCase().includes(q.toLowerCase()) ||
        (l.details ?? "").toLowerCase().includes(q.toLowerCase());

      const scopeOK = scope === "any" || l.scope === scope;
      const statusOK = status === "any" || l.status === status;

      return textOK && scopeOK && statusOK;
    });
  }, [logs, q, scope, status]);

  if (loading) {
    return (
      <div className="p-6 text-black/60 text-sm animate-pulse">
        Loading DATACORE sync logs…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">
          DATACORE Sync Log
        </h1>
        <p className="text-sm text-black/70 mt-1">
          Track synchronization runs with DATACORE (users, roles, profiles).
          Use this to explain FR-INT &amp; FR-NI-02.
        </p>
      </section>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded text-blue-800 text-sm animate-fadeIn transition-all">
          {message}
        </div>
      )}

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
            onChange={(e) => setScope(e.target.value as SyncLog["scope"] | "any")}
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
            onChange={(e) => setStatus(e.target.value as SyncLog["status"] | "any")}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="any">Any status</option>
            <option value="OK">OK</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Run Sync */}
          <button
            type="button"
            onClick={runSyncNow}
            disabled={isSyncing}
            className={`text-sm font-semibold rounded-lg px-3 py-2 transition ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            style={{
              background: "var(--color-light-heavy-blue)",
              color: "var(--color-white)",
            }}
          >
            {isSyncing ? "Syncing..." : "Run sync now"}
          </button>

          {/* Placeholder — system status */}
          <button
            type="button"
            className="text-sm font-semibold rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
            style={{
              borderColor: "var(--color-soft-white-blue)",
              color: "var(--color-medium-light-blue)",
              background: "var(--color-white)",
            }}
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
              <tr
                className="text-left border-b"
                style={{ borderColor: "var(--color-soft-white-blue)" }}
              >
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
                <tr
                  key={l.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                  style={{ borderColor: "var(--color-soft-white-blue)" }}
                >
                  <td className="py-2 pr-4 font-semibold text-dark-blue">
                    {l.id}
                  </td>
                  <td className="py-2 pr-4 whitespace-nowrap">{l.at}</td>
                  <td className="py-2 pr-4">{l.actor}</td>
                  <td className="py-2 pr-4">{l.scope}</td>

                  <td className="py-2 pr-4">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.75rem] font-semibold"
                      style={{
                        background: "var(--color-soft-white-blue)",
                        color:
                          l.status === "OK"
                            ? "var(--color-light-heavy-blue)" // Giả định màu xanh
                            : l.status === "PARTIAL"
                            ? "var(--color-light-blue)"       // Giả định màu vàng/cam
                            : "var(--color-medium-light-blue)", // Giả định màu đỏ/xám
                      }}
                    >
                      {l.status}
                    </span>
                  </td>

                  <td className="py-2 pr-4 text-black/70 max-w-xs truncate" title={l.details}>
                    {l.details ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-8 text-sm text-black/60 text-center italic">
              No logs match your filters.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DataCoreSyncLog;