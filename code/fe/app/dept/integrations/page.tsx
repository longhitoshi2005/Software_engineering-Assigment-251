"use client";

import { useState } from "react";

type I = { name: string; status: "Online"|"Degraded"|"Offline"; lastSync: string };

export default function Page() {
  const [rows, setRows] = useState<I[]>([
    { name: "HCMUT_SSO", status: "Online", lastSync: "2025-10-22 09:58" },
    { name: "DATACORE", status: "Online", lastSync: "2025-10-22 09:56" },
    { name: "HCMUT_LIBRARY", status: "Degraded", lastSync: "2025-10-22 09:50" },
  ]);

  const badge = (s: I["status"]) =>
    s==="Online" ? "text-green-700 bg-green-50 border-green-200"
    : s==="Degraded" ? "text-orange-700 bg-orange-50 border-orange-200"
    : "text-red-700 bg-red-50 border-red-200";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Integrations</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Monitor SSO, DATACORE, Library connections.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rows.map(r=>(
          <div key={r.name} className="bg-white border border-soft-white-blue rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-base font-semibold text-dark-blue">{r.name}</div>
              <span className={`text-xs px-2 py-1 rounded border font-medium ${badge(r.status)}`}>{r.status}</span>
            </div>
            <div className="text-xs text-black/60">Last sync: {r.lastSync}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
