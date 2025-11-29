"use client";

import { useMemo, useEffect, useState } from "react";

type Fb = {
  id: string;
  course: string;
  tutor: string;
  score: number;
  text: string;
  at: string;
};

export default function Page() {
  const [course, setCourse] = useState<"ALL" | "CO1001" | "MA1001" | "EE2002" | "PH1001">("ALL");
  const [minScore, setMinScore] = useState(0);

  const [rows, setRows] = useState<Fb[]>([]);
  const [avgScore, setAvgScore] = useState("0.00");
  const [loading, setLoading] = useState(true);

  // ===== FETCH FEEDBACK DATA FROM BACKEND =====
  useEffect(() => {
    async function loadFeedback() {
      setLoading(true);
      try {
        const url = `/api/dept/feedback?course=${course}&minScore=${minScore}`;
        const res = await fetch(url, {
          headers: {
            "x-user-role": "DEPT_CHAIR",      // <<< ROLE QUAN TRỌNG
            "x-user-id": "chair@hcmut.edu.vn" // mock user
          }
        });

        if (!res.ok) {
          console.error("Failed to fetch feedback", await res.text());
          setRows([]);
          setAvgScore("0.00");
          return;
        }

        const data = await res.json();
        setRows(data.feedback || []);
        setAvgScore(String(data.avg || "0.00"));
      } catch (e) {
        console.error("Feedback load error:", e);
      }
      setLoading(false);
    }

    loadFeedback();
  }, [course, minScore]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback Analytics</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Filter by course and minimum score.</p>
      </header>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">Average Score</div>
          <div className="text-2xl font-bold text-dark-blue mt-1">
            {loading ? "—" : avgScore}
          </div>
          <div className="text-xs text-black/60">Across {rows.length} feedback(s)</div>
        </div>

        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">High Ratings (≥4)</div>
          <div className="text-2xl font-bold text-dark-blue mt-1">
            {loading ? "—" : rows.filter(r => r.score >= 4).length}
          </div>
          <div className="text-xs text-black/60">Quality indicator</div>
        </div>

        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">Coverage</div>
          <div className="text-2xl font-bold text-dark-blue mt-1">4</div>
          <div className="text-xs text-black/60">Courses in dataset</div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value as any)}
            className="rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm"
          >
            <option value="ALL">All courses</option>
            <option>CO1001</option>
            <option>MA1001</option>
            <option>EE2002</option>
            <option>PH1001</option>
          </select>

          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm"
          >
            <option value={0}>Score ≥ Any</option>
            <option value={3}>Score ≥ 3</option>
            <option value={4}>Score ≥ 4</option>
            <option value={5}>Score = 5</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="text-left py-2 px-3">ID</th>
                <th className="text-left py-2 px-3">Course</th>
                <th className="text-left py-2 px-3">Tutor</th>
                <th className="text-left py-2 px-3">Score</th>
                <th className="text-left py-2 px-3">Comment</th>
                <th className="text-left py-2 px-3">When</th>
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
                    No results.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                    <td className="py-3 px-3 font-medium text-dark-blue">{r.id}</td>
                    <td className="py-3 px-3">{r.course}</td>
                    <td className="py-3 px-3">{r.tutor}</td>
                    <td className="py-3 px-3">{r.score}</td>
                    <td className="py-3 px-3">{r.text}</td>
                    <td className="py-3 px-3">{r.at}</td>
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
