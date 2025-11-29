"use client";

import { useMemo, useState, useEffect } from "react"; // CHANGED: thêm useEffect

// --- Types ---
type Feedback = {
  id: string;
  session: string;
  course: string;
  student: string;
  score: 1 | 2 | 3 | 4 | 5;
  text: string;
  // dùng ISO để lọc theo thời gian cho chuẩn
  at: string; // ISO date string, e.g. "2025-11-10T09:00:00Z"
};

// --- Mock data (mở rộng) ---
const FEEDBACKS: Feedback[] = [
  { id: "F-501", session: "S-1994", course: "CO1001", student: "23531xx", score: 5, text: "Very clear explanation!", at: "2025-11-12T10:20:00Z" },
  { id: "F-502", session: "S-1990", course: "CO1001", student: "23529xx", score: 4, text: "Helpful examples.", at: "2025-10-31T07:30:00Z" },
  { id: "F-503", session: "S-2001", course: "MA1001", student: "23488xx", score: 3, text: "Ok but a bit fast.", at: "2025-11-11T14:00:00Z" },
  { id: "F-504", session: "S-2002", course: "EE2002", student: "23510xx", score: 5, text: "Great pacing & visuals.", at: "2025-11-09T09:15:00Z" },
  { id: "F-505", session: "S-2009", course: "CO1001", student: "23555xx", score: 2, text: "Hard to follow pointers.", at: "2025-11-08T16:45:00Z" },
  { id: "F-506", session: "S-2012", course: "PH1001", student: "23561xx", score: 4, text: "Good recap at the end.", at: "2025-11-05T08:10:00Z" },
  { id: "F-507", session: "S-2015", course: "MA1001", student: "23577xx", score: 5, text: "Clear strategies for practice.", at: "2025-11-03T13:30:00Z" },
  { id: "F-508", session: "S-2019", course: "EE2002", student: "23582xx", score: 1, text: "Audio issues on Zoom.", at: "2025-10-29T18:00:00Z" },
  { id: "F-509", session: "S-2022", course: "CO1001", student: "23502xx", score: 4, text: "Nice debugging demo.", at: "2025-11-02T10:00:00Z" },
  { id: "F-510", session: "S-2027", course: "PH1001", student: "23590xx", score: 3, text: "Need slower derivations.", at: "2025-10-28T07:50:00Z" },
  { id: "F-511", session: "S-2030", course: "CO1001", student: "23511xx", score: 5, text: "Loved step-by-step approach.", at: "2025-11-12T03:40:00Z" },
  { id: "F-512", session: "S-2033", course: "MA1001", student: "23523xx", score: 4, text: "Examples matched homework.", at: "2025-11-07T11:25:00Z" },
];

// --- Helpers thời gian (deterministic) ---
// NEW: format ngày UTC, không phụ thuộc locale/timezone ⇒ tránh mismatch SSR/CSR
const formatDateUTC = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(d.getUTCDate());
  const mm = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  const hh = pad(d.getUTCHours());
  const mi = pad(d.getUTCMinutes());
  return `${dd} ${mm} ${yyyy} ${hh}:${mi} UTC`;
};

// NEW: inRange vẫn như cũ nhưng nhận mốc from bằng ms
const inRange = (iso: string, from?: number) =>
  (from ? new Date(iso).getTime() >= from : true);

// --- Component ---
export default function TutorFeedbackFromStudentsPage() {
  // Filters
  const [q, setQ] = useState(""); // search session/student/comment
  const [course, setCourse] = useState<"ALL" | "CO1001" | "MA1001" | "EE2002" | "PH1001">("ALL");
  const [minScore, setMinScore] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [timeWindow, setTimeWindow] = useState<"ALL" | "7D" | "30D" | "THIS_TERM">("ALL");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST">("NEWEST");

  // Pagination
  const [pageSize] = useState(8);
  const [page, setPage] = useState(1);

  // NEW: "đóng băng" thời điểm hiện tại sau khi client mount để tránh lệch SSR/CSR
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  // NEW: tính fromTs dựa trên now (sau mount). Trước khi now có, không filter theo thời gian.
  const fromTs = useMemo(() => {
    if (now === null) return undefined; // tránh hydration mismatch
    const daysAgo = (days: number) => now - days * 24 * 60 * 60 * 1000;
    if (timeWindow === "7D") return daysAgo(7);
    if (timeWindow === "30D") return daysAgo(30);
    if (timeWindow === "THIS_TERM") return daysAgo(120); // mock: 1 học kỳ ~120 ngày
    return undefined;
  }, [timeWindow, now]);

  // Apply filters + sort
  const filtered = useMemo(() => {
    let rows = FEEDBACKS.filter((fb) => {
      if (course !== "ALL" && fb.course !== course) return false;
      if (minScore !== 0 && fb.score < minScore) return false;
      if (!inRange(fb.at, fromTs)) return false;

      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay =
          `${fb.id} ${fb.session} ${fb.course} ${fb.student} ${fb.text}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    rows = rows.sort((a, b) => {
      if (sort === "NEWEST") return new Date(b.at).getTime() - new Date(a.at).getTime();
      if (sort === "OLDEST") return new Date(a.at).getTime() - new Date(b.at).getTime();
      if (sort === "HIGHEST") return b.score - a.score;
      return a.score - b.score; // LOWEST
    });

    return rows;
  }, [course, minScore, fromTs, q, sort]);

  // Pagination slice
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  // KPIs
  const avgScore =
    filtered.reduce((acc, r) => acc + r.score, 0) / (filtered.length || 1);

  // CHANGED: last7 dùng 'now' cố định sau mount; trước đó hiển thị '—' tránh mismatch
  const last7 = useMemo(() => {
    if (now === null) return null;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return filtered.filter((r) => inRange(r.at, sevenDaysAgo)).length;
  }, [filtered, now]);

  const lowScore = filtered.filter((r) => r.score <= 2).length;

  // Score distribution (1..5)
  const dist = [1, 2, 3, 4, 5].map((s) => filtered.filter((r) => r.score === s).length);
  const distMax = Math.max(1, ...dist);

  // Reset page nếu filter đổi
  const onAnyFilterChange = <T,>(setter: (x: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px_4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback from Students</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Filter by course, score, time; sort; and export. Data below is mock for demo.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-[160px_160px_160px_1fr_160px] gap-3">
          <select
            value={course}
            onChange={(e) => onAnyFilterChange(setCourse)(e.target.value as any)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="ALL">All courses</option>
            <option value="CO1001">CO1001</option>
            <option value="MA1001">MA1001</option>
            <option value="EE2002">EE2002</option>
            <option value="PH1001">PH1001</option>
          </select>

          <select
            value={minScore}
            onChange={(e) => onAnyFilterChange(setMinScore)(Number(e.target.value) as any)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value={0}>Score ≥ Any</option>
            <option value={5}>Score ≥ 5</option>
            <option value={4}>Score ≥ 4</option>
            <option value={3}>Score ≥ 3</option>
            <option value={2}>Score ≥ 2</option>
            <option value={1}>Score ≥ 1</option>
          </select>

          <select
            value={timeWindow}
            onChange={(e) => onAnyFilterChange(setTimeWindow)(e.target.value as any)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="ALL">All time</option>
            <option value="7D">Last 7 days</option>
            <option value="30D">Last 30 days</option>
            <option value="THIS_TERM">This term</option>
          </select>

          <input
            value={q}
            onChange={(e) => onAnyFilterChange(setQ)(e.target.value)}
            placeholder="Search session / student / text..."
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          />

          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => onAnyFilterChange(setSort)(e.target.value as any)}
              className="flex-1 rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="NEWEST">Sort: Newest</option>
              <option value="OLDEST">Sort: Oldest</option>
              <option value="HIGHEST">Sort: Highest score</option>
              <option value="LOWEST">Sort: Lowest score</option>
            </select>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">Average Score</div>
          <div className="mt-2 text-2xl font-bold text-dark-blue">{avgScore.toFixed(2)}</div>
          <div className="text-xs text-black/60 mt-1">Across {filtered.length} feedback(s)</div>
        </div>
        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">New in last 7 days</div>
          <div
            className="mt-2 text-2xl font-bold text-dark-blue"
            suppressHydrationWarning // NEW: tránh warning trước khi now có
          >
            {last7 ?? "—"}
          </div>
          <div className="text-xs text-black/60 mt-1">Based on time filter above</div>
        </div>
        <div className="bg-white border border-soft-white-blue rounded-lg p-4">
          <div className="text-xs font-semibold text-dark-blue">Low scores (≤ 2)</div>
          <div className="mt-2 text-2xl font-bold text-dark-blue">{lowScore}</div>
          <div className="text-xs text-black/60 mt-1">Consider follow-up with students</div>
        </div>
      </section>

      {/* Score distribution (text bars) */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-4">
        <h2 className="text-sm font-semibold text-dark-blue mb-3">Score Distribution</h2>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((s) => {
            const count = dist[s - 1];
            const ratio = Math.round((count / distMax) * 100) || 0;
            return (
              <div key={s} className="flex items-center gap-3">
                <div className="w-8 text-right text-xs text-black/70">{s}</div>
                <div className="flex-1 bg-soft-white-blue rounded h-3 relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-light-heavy-blue rounded"
                    style={{ width: `${ratio}%` }}
                    aria-hidden
                  />
                </div>
                <div className="w-10 text-xs text-black/70 text-right">{count}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feedback Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-dark-blue">Feedback List</h2>
          <div className="text-xs text-black/60">
            Showing {current.length} of {filtered.length}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-soft-white-blue">
              <th className="py-2 pr-4 font-semibold text-dark-blue">Session</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Course</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Student</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Score</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Comment</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">When</th>
            </tr>
          </thead>
          <tbody>
            {current.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-black/50">
                  No feedback matches your filters.
                </td>
              </tr>
            ) : (
              current.map((r) => (
                <tr key={r.id} className="border-b border-soft-white-blue last:border-0">
                  <td className="py-3 pr-4">{r.session}</td>
                  <td className="py-3 pr-4">{r.course}</td>
                  <td className="py-3 pr-4">{r.student}</td>
                  <td className="py-3 pr-4">{r.score}</td>
                  <td className="py-3 pr-4">{r.text}</td>
                  <td className="py-3 pr-4">
                    {formatDateUTC(r.at) /* CHANGED: bỏ toLocaleString để deterministic */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="text-black/50">
              Page {pageSafe} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border border-soft-white-blue hover:bg-soft-white-blue/70"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pageSafe === 1}
              >
                Prev
              </button>
              <button
                className="px-3 py-1 rounded border border-soft-white-blue hover:bg-soft-white-blue/70"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageSafe === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Recent comments (quick view) */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-4">
        <h2 className="text-sm font-semibold text-dark-blue mb-3">Recent Comments</h2>
        <ul className="space-y-2">
          {filtered.slice(0, 5).map((r) => (
            <li key={`recent-${r.id}`} className="text-sm">
              <span className="px-2 py-0.5 rounded bg-soft-white-blue text-dark-blue mr-2">
                {r.course}
              </span>
              <span className="font-medium">{r.student}</span>
              <span className="text-black/50"> · {r.session} · score {r.score} · </span>
              <span className="text-black/80">{r.text}</span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-black/50">No recent comments.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
