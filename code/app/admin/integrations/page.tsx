"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "Online" | "Degraded" | "Offline";

interface Integration {
  name: string;
  status: Status;
  lastSync: string;
}

type ModalKind = "SSO" | "SSO-status" | null;

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState<ModalKind>(null);

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // =========================================
  // LOAD DATA FROM BACKEND
  // =========================================
  const loadIntegrations = async () => {
    const res = await fetch("/api/admin/integrations");
    const data = await res.json();
    setIntegrations(data);
    setLoading(false);
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  // =========================================
  // API CALL – Force Sync Now
  // =========================================
  const forceSync = async (service: string) => {
    showMessage(`${service} sync started...`);

    await fetch("/api/admin/integrations/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: service }),
    });

    await loadIntegrations();
    showMessage(`${service} sync completed successfully.`);
  };

  // =========================================
  // API CALL – Retry Connection
  // =========================================
  const retryConnection = async (service: string) => {
    showMessage(`Retrying connection to ${service}...`);

    await fetch("/api/admin/integrations/retry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: service }),
    });

    await loadIntegrations();
    showMessage(`${service} connection restored.`);
  };

  const lastErrors = [
    {
      at: "2025-11-02 09:58",
      service: "HCMUT_LIBRARY",
      message: "403 – access restricted for course resources",
    },
  ];

  const getStatusColor = (status: Status) => {
    if (status === "Online")
      return "text-green-700 bg-green-50 border-green-200";
    if (status === "Degraded")
      return "text-orange-700 bg-orange-50 border-orange-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-black/60">Loading integrations…</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">
          Integrations
        </h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Monitor and test connections to HCMUT_SSO, DATACORE, and
          HCMUT_LIBRARY.
        </p>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm animate-fadeIn">
          {message}
        </div>
      )}

      {/* Integration Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrations.map((int) => (
          <div
            key={int.name}
            className="bg-white border border-soft-white-blue rounded-lg p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-dark-blue">
                {int.name}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded border font-medium ${getStatusColor(
                  int.status
                )}`}
              >
                {int.status}
              </span>
            </div>

            <p className="text-xs text-black/60 mb-4">
              Last sync: {int.lastSync}
            </p>

            <div className="space-y-2">
              {/* HCMUT_SSO */}
              {int.name === "HCMUT_SSO" && (
                <>
                  <button
                    onClick={() => setShowModal("SSO")}
                    className="w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition"
                  >
                    Test login flow
                  </button>

                  <button
                    onClick={() => setShowModal("SSO-status")}
                    className="w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition"
                  >
                    View status
                  </button>
                </>
              )}

              {/* DATACORE */}
              {int.name === "DATACORE" && (
                <>
                  <button
                    onClick={() => forceSync("DATACORE")}
                    className="w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition"
                  >
                    Force sync now
                  </button>

                  <Link
                    href="/account/datacore-log"
                    className="block w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition text-center"
                  >
                    View sync log
                  </Link>
                </>
              )}

              {/* HCMUT_LIBRARY */}
              {int.name === "HCMUT_LIBRARY" && (
                <>
                  <button
                    onClick={() => retryConnection("HCMUT_LIBRARY")}
                    className="w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition"
                  >
                    Retry connection
                  </button>

                  <Link
                    href="/system/library-sync"
                    className="block w-full text-xs px-3 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-dark-blue hover:bg-blue-50 transition text-center"
                  >
                    Open library sync
                  </Link>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* Last Errors */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue mb-3">
          Last Integration Errors
        </h2>

        {lastErrors.length === 0 ? (
          <p className="text-sm text-black/60">No recent errors.</p>
        ) : (
          <div className="space-y-2">
            {lastErrors.map((err, idx) => (
              <div
                key={idx}
                className="p-3 bg-red-50 border border-red-200 rounded text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{err.service}</p>
                    <p className="text-red-700 mt-1">{err.message}</p>
                  </div>
                  <span className="text-xs text-red-600">{err.at}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fadeIn px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-black/10 overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    showModal === "SSO-status"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                <h3 className="text-base md:text-lg font-semibold text-dark-blue">
                  {showModal === "SSO"
                    ? "SSO Test Result"
                    : "HCMUT_SSO · System Status"}
                </h3>
              </div>

              <button
                onClick={() => setShowModal(null)}
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-soft-white-blue transition"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-5">
              {showModal === "SSO" ? (
                // SSO Test Flow
                <div className="space-y-2 text-sm">
                  <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded">
                    ✓ SSO login flow test completed successfully (mock).
                  </p>
                  <ul className="list-disc pl-5 text-black/70">
                    <li>Auth endpoint reachable</li>
                    <li>Token exchange simulated OK</li>
                    <li>Callback URL whitelisted</li>
                  </ul>
                </div>
              ) : (
                // SSO Status Panel (same as your old UI)
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg p-3 border border-soft-white-blue">
                      <div className="text-xs font-semibold text-dark-blue">
                        Overall
                      </div>
                      <div className="mt-1 text-sm font-bold text-amber-700">
                        Degraded
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        Auth OK · Token OK · Rate limit spikes
                      </div>
                    </div>

                    <div className="rounded-lg p-3 border border-soft-white-blue">
                      <div className="text-xs font-semibold text-dark-blue">
                        Last checked
                      </div>
                      <div className="mt-1 text-sm font-bold text-dark-blue">
                        2025-11-02 09:55
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        Static display (mock)
                      </div>
                    </div>

                    <div className="rounded-lg p-3 border border-soft-white-blue">
                      <div className="text-xs font-semibold text-dark-blue">
                        Uptime (7d)
                      </div>
                      <div className="mt-1 text-sm font-bold text-dark-blue">
                        99.98%
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        Rolling window
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg p-3 border border-soft-white-blue">
                      <div className="text-xs font-semibold text-dark-blue mb-1">
                        Latency
                      </div>
                      <div className="text-sm text-black/80">
                        P50: 120ms · P95: 280ms
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        Slight evening spike
                      </div>
                    </div>

                    <div className="rounded-lg p-3 border border-soft-white-blue">
                      <div className="text-xs font-semibold text-dark-blue mb-1">
                        Error rate
                      </div>
                      <div className="text-sm text-black/80">
                        401: normal · 429: elevated 08:00–09:30
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        RateLimiter cooldown active
                      </div>
                    </div>
                  </div>

                  {/* Endpoints */}
                  <div>
                    <div className="text-sm font-semibold text-dark-blue mb-2">
                      Endpoints
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-soft-white-blue">
                        <thead>
                          <tr className="text-left border-b border-soft-white-blue">
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-soft-white-blue">
                            <td className="py-2 px-3">/authorize</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                                OK
                              </span>
                            </td>
                            <td className="py-2 px-3 text-black/70">Healthy</td>
                          </tr>

                          <tr className="border-b border-soft-white-blue">
                            <td className="py-2 px-3">/token</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                                OK
                              </span>
                            </td>
                            <td className="py-2 px-3 text-black/70">Stable</td>
                          </tr>

                          <tr>
                            <td className="py-2 px-3">/userinfo</td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                                Degraded
                              </span>
                            </td>
                            <td className="py-2 px-3 text-black/70">
                              Occasional 429
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Recent Incidents */}
                  <div>
                    <div className="text-sm font-semibold text-dark-blue mb-2">
                      Recent Incidents
                    </div>
                    <ul className="text-sm text-black/70 list-disc pl-5 space-y-1">
                      <li>
                        2025-11-02 09:20 — burst of 429 on /userinfo (resolved)
                      </li>
                      <li>
                        2025-11-01 22:05 — brief timeout on /authorize
                        (auto-recovered)
                      </li>
                    </ul>
                  </div>

                  {/* Legend */}
                  <div className="text-[0.7rem] text-black/60">
                    <span className="font-semibold">Legend:</span>{" "}
                    <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      OK
                    </span>{" "}
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      Degraded
                    </span>{" "}
                    <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      Offline
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
