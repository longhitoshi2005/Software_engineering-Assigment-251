"use client";

import { useEffect, useState } from "react";

type SessionStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

interface SessionRecord {
  id: string;
  course: string;
  tutor: string;
  student: string;
  slot: string;
  status: SessionStatus;
}

export default function Page() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== FETCH DATA FROM BACKEND =====
  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const url = `/api/dept/sessions?q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          headers: {
            "x-user-role": "DEPT_CHAIR",       // QUAN TRỌNG
            "x-user-id": "chair@hcmut.edu.vn", // mock
          },
        });

        if (!res.ok) {
          console.error("Sessions API error:", await res.text());
          setRows([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRows(data.sessions || []);
      } catch (err) {
        console.error("Sessions load error:", err);
      }

      setLoading(false);
    }

    load();
  }, [q]);

  // Badge colors
  const badge = (s: SessionStatus) =>
    s === "CONFIRMED"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : s === "PENDING"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* HEADER */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Sessions</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Browse and manage tutoring sessions.
        </p>
      </header>

      {/* SEARCH + TABLE */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by id / course / tutor / student"
          className="rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm w-full"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="text-left py-2 px-3">Session</th>
                <th className="text-left py-2 px-3">Course</th>
                <th className="text-left py-2 px-3">Tutor</th>
                <th className="text-left py-2 px-3">Student</th>
                <th className="text-left py-2 px-3">Slot</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-black/60">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-black/60">
                    No sessions found.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-soft-white-blue hover:bg-soft-white-blue/50"
                  >
                    <td className="py-3 px-3 font-medium text-dark-blue">{r.id}</td>
                    <td className="py-3 px-3">{r.course}</td>
                    <td className="py-3 px-3">{r.tutor}</td>
                    <td className="py-3 px-3">{r.student}</td>
                    <td className="py-3 px-3">{r.slot}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs border ${badge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
