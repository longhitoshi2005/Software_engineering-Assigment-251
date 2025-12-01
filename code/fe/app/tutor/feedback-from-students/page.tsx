"use client";

import { BASE_API_URL } from "@/config/env";
import { useMemo, useState, useEffect } from "react";

// --- Types ---
type Feedback = {
  id: string;
  session: {
    id: string;
    student_id: string;
    student_name: string;
    course_code: string;
    course_name: string;
    start_time: string;
    end_time: string;
    mode: string;
    location: string;
  };
  rating: number | null;
  comment: string | null;
  status: "PENDING" | "SUBMITTED" | "SKIPPED";
  feedback_deadline: string;
  created_at: string;
};

// --- Component ---
export default function TutorFeedbackFromStudentsPage() {
  // Data state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState(""); // search session/student/comment
  const [course, setCourse] = useState<string>("ALL");
  const [minScore, setMinScore] = useState<1 | 2 | 3 | 4 | 5 | 0>(0);
  const [timeWindow, setTimeWindow] = useState<"ALL" | "7D" | "30D" | "THIS_TERM">("ALL");
  const [sort, setSort] = useState<"NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST">("NEWEST");

  // Pagination
  const [pageSize] = useState(8);
  const [page, setPage] = useState(1);

  // "đóng băng" thời điểm hiện tại sau khi client mount để tránh lệch SSR/CSR
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
  }, []);

  // Load feedbacks from backend
  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${BASE_API_URL}/feedback/received`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load feedbacks");
        }

        const data: Feedback[] = await response.json();
        setFeedbacks(data);
      } catch (err) {
        console.error("Error loading feedbacks:", err);
        setError("Failed to load feedbacks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadFeedbacks();
  }, []);

  // Get unique courses from feedbacks
  const uniqueCourses = useMemo(() => {
    // Only get courses from SUBMITTED feedbacks with ratings (same as filtered data)
    const submittedFeedbacks = feedbacks.filter(
      (fb) => fb.status === "SUBMITTED" && fb.rating !== null
    );
    const courses = new Set(submittedFeedbacks.map((fb) => fb.session.course_code));
    return Array.from(courses).sort();
  }, [feedbacks]);

  // Helpers thời gian (deterministic)
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

  const inRange = (iso: string, from?: number) =>
    (from ? new Date(iso).getTime() >= from : true);

  // tính fromTs dựa trên now (sau mount). Trước khi now có, không filter theo thời gian.
  const fromTs = useMemo(() => {
    if (now === null) return undefined; // tránh hydration mismatch
    const daysAgo = (days: number) => now - days * 24 * 60 * 60 * 1000;
    if (timeWindow === "7D") return daysAgo(7);
    if (timeWindow === "30D") return daysAgo(30);
    if (timeWindow === "THIS_TERM") return daysAgo(120); // mock: 1 học kỳ ~120 ngày
    return undefined;
  }, [timeWindow, now]);

  // Apply filters + sort (only process SUBMITTED feedbacks with ratings)
  const filtered = useMemo(() => {
    let rows = feedbacks.filter((fb) => {
      // Only show SUBMITTED feedbacks with ratings
      if (fb.status !== "SUBMITTED" || fb.rating === null) return false;
      
      if (course !== "ALL" && fb.session.course_code !== course) return false;
      if (minScore !== 0 && fb.rating < minScore) return false;
      if (!inRange(fb.created_at, fromTs)) return false;

      if (q.trim()) {
        const needle = q.toLowerCase();
        const hay = `${fb.id} ${fb.session.id} ${fb.session.course_code} ${fb.session.student_id} ${fb.session.student_name} ${fb.comment || ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });

    rows = rows.sort((a, b) => {
      if (sort === "NEWEST") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "OLDEST") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "HIGHEST") return (b.rating || 0) - (a.rating || 0);
      return (a.rating || 0) - (b.rating || 0); // LOWEST
    });

    return rows;
  }, [feedbacks, course, minScore, fromTs, q, sort]);

  // Pagination slice
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  // KPIs
  const avgScore = filtered.length > 0
    ? filtered.reduce((acc, r) => acc + (r.rating || 0), 0) / filtered.length
    : 0;

  // last7 dùng 'now' cố định sau mount; trước đó hiển thị '—' tránh mismatch
  const last7 = useMemo(() => {
    if (now === null) return null;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return filtered.filter((r) => inRange(r.created_at, sevenDaysAgo)).length;
  }, [filtered, now]);

  const lowScore = filtered.filter((r) => (r.rating || 0) <= 2).length;

  // Score distribution (1..5)
  const dist = [1, 2, 3, 4, 5].map((s) => filtered.filter((r) => r.rating === s).length);
  const distMax = Math.max(1, ...dist);

  // Reset page nếu filter đổi
  const onAnyFilterChange = <T,>(setter: (x: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback from Students</h1>
        </header>
        <div className="bg-white border border-soft-white-blue rounded-lg p-8 text-center">
          <div className="text-black/50">Loading feedbacks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback from Students</h1>
        </header>
        <div className="bg-white border border-soft-white-blue rounded-lg p-8 text-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px_4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback from Students</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Filter by course, score, time; sort and analyze feedback from your students.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-[160px_160px_160px_1fr_160px] gap-3">
          <select
            value={course}
            onChange={(e) => onAnyFilterChange(setCourse)(e.target.value)}
            className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
          >
            <option value="ALL">All courses</option>
            {uniqueCourses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={minScore}
            onChange={(e) => onAnyFilterChange(setMinScore)(Number(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5)}
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
            onChange={(e) => onAnyFilterChange(setTimeWindow)(e.target.value as "ALL" | "7D" | "30D" | "THIS_TERM")}
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
              onChange={(e) => onAnyFilterChange(setSort)(e.target.value as "NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST")}
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
                <td colSpan={5} className="py-6 text-center text-black/50">
                  No feedback matches your filters.
                </td>
              </tr>
            ) : (
              current.map((r) => (
                <tr key={r.id} className="border-b border-soft-white-blue last:border-0">
                  <td className="py-3 pr-4">{r.session.course_code}</td>
                  <td className="py-3 pr-4">{r.session.student_id}</td>
                  <td className="py-3 pr-4">{r.rating}</td>
                  <td className="py-3 pr-4">{r.comment || "(No comment)"}</td>
                  <td className="py-3 pr-4">
                    {formatDateUTC(r.created_at)}
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
                {r.session.course_code}
              </span>
              <span className="font-medium">{r.session.student_id}</span>
              <span className="text-black/50"> · score {r.rating} · </span>
              <span className="text-black/80">{r.comment || "(No comment)"}</span>
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
