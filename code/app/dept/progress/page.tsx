"use client";

import { useEffect, useState } from "react";

type Row = {
  id: string;
  session: string;
  tutor: string;
  student: string;
  course: string;
  summary: string;
  at: string;
};

export default function Page() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dept/progress", {
          headers: {
            "x-user-role": "DEPT_CHAIR",
            "x-user-id": "dept01",
          },
        });

        if (!res.ok) {
          console.error("Progress API error:", await res.text());
          setRows([]);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setRows(data.records || []);
      } catch (err) {
        console.error("Progress fetch failed:", err);
        setRows([]);
      }
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Progress Logs</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Tutor-submitted summaries for department audit.
        </p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        {loading ? (
          <p className="text-sm text-black/60">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-white-blue">
                  <th className="text-left py-2 px-3">Log</th>
                  <th className="text-left py-2 px-3">Session</th>
                  <th className="text-left py-2 px-3">Course</th>
                  <th className="text-left py-2 px-3">Tutor</th>
                  <th className="text-left py-2 px-3">Student</th>
                  <th className="text-left py-2 px-3">Summary</th>
                  <th className="text-left py-2 px-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-soft-white-blue hover:bg-soft-white-blue/50"
                  >
                    <td className="py-3 px-3 font-medium text-dark-blue">{r.id}</td>
                    <td className="py-3 px-3">{r.session}</td>
                    <td className="py-3 px-3">{r.course}</td>
                    <td className="py-3 px-3">{r.tutor}</td>
                    <td className="py-3 px-3">{r.student}</td>
                    <td className="py-3 px-3">{r.summary}</td>
                    <td className="py-3 px-3">{r.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
