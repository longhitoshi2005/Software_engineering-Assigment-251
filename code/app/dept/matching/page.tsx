"use client";

import { useEffect, useState } from "react";

type Suggested = {
  id: string;
  student: string;
  need: string;
  tutor: string;
  reason: string;
};

type Risk = {
  id: string;
  note: string;
  action: string;
};

export default function Page() {
  const [suggested, setSuggested] = useState<Suggested[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/dept/matching", {
      headers: {
        "x-user-role": "DEPT_CHAIR", // mock role
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text();
          setErr("API Error: " + t);
          setLoading(false);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setSuggested(data.suggested || []);
        setRisks(data.risks || []);
        setLoading(false);
      })
      .catch((e) => {
        setErr(String(e));
        setLoading(false);
      });
  }, []);

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-black/60">Loading suggestions...</p>
      </div>
    );
  }

  // ===== ERROR =====
  if (err) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-red-600">Error loading data</h1>
        <p className="text-black/70 mt-2 whitespace-pre-wrap">{err}</p>
      </div>
    );
  }

  // ===== MAIN UI =====
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">
          Matching Oversight
        </h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Review auto-suggestions and risks before confirmation.
        </p>
      </header>

      {/* ==== AUTO-SUGGESTED MATCHES ==== */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue">
          Auto-suggested Matches
        </h2>

        <ul className="mt-3 space-y-2">
          {suggested.map((s) => (
            <li
              key={s.id}
              className="p-3 border border-soft-white-blue rounded bg-soft-white-blue/50"
            >
              <div className="text-sm">
                <span className="font-semibold text-dark-blue">{s.student}</span>{" "}
                → <span className="font-semibold">{s.tutor}</span>
                <span className="text-black/60"> · {s.need}</span>
              </div>
              <div className="text-[0.75rem] text-black/60">Reason: {s.reason}</div>
            </li>
          ))}
        </ul>

        {suggested.length === 0 && (
          <p className="text-black/60 text-sm mt-2">No suggestions available.</p>
        )}
      </section>

      {/* ==== RISK & REBALANCE ==== */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue">
          Risk & Rebalance
        </h2>

        <ul className="mt-3 space-y-2">
          {risks.map((r) => (
            <li
              key={r.id}
              className="p-3 border border-soft-white-blue rounded bg-amber-50"
            >
              <div className="text-sm text-amber-800">{r.note}</div>
              <div className="text-[0.75rem] text-amber-700">
                Suggestion: {r.action}
              </div>
            </li>
          ))}
        </ul>

        {risks.length === 0 && (
          <p className="text-black/60 text-sm mt-2">No risks detected.</p>
        )}
      </section>
    </div>
  );
}
