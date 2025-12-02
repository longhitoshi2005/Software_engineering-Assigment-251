"use client";

import Link from "next/link";
import { useMemo, useState } from "react"; // ADDED
import { TUTOR_DASH_SESSIONS, TUTOR_DASH_FEEDBACKS } from "@/lib/mocks";

type TutorStat = {
  label: string;
  value: string | number;
  sub?: string;
};

type SessionItem = {
  id: string;
  datetime: string;
  student: string;
  subject: string;
  status: "CONFIRMED" | "PENDING";
};

type FeedbackItem = {
  id: string;
  student: string;
  subject: string;
  rating: number;
  comment: string;
  date: string;
};

export default function TutorDashboardPage() {
  // Mock data
  const stats: TutorStat[] = [
    { label: "Total Sessions", value: 28, sub: "This semester" },
    { label: "Pending Requests", value: 3 },
    { label: "Avg Feedback", value: "4.7 / 5", sub: "from 18 students" },
    { label: "Upcoming", value: 4, sub: "Next 7 days" },
  ];

  const sessions: SessionItem[] = TUTOR_DASH_SESSIONS as SessionItem[];
  const feedbacks: FeedbackItem[] = TUTOR_DASH_FEEDBACKS as FeedbackItem[];

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>{i < count ? "★" : "☆"}</span>
    ));

  // === ANALYTICS STATE & DERIVED METRICS ===
  const [showAnalytics, setShowAnalytics] = useState(false); // ADDED

  // ADDED: Tính toán analytics từ feedbacks (deterministic, không dùng Date.now để tránh hydration issue)
  const analytics = useMemo(() => {
    const total = feedbacks.length || 1;
    const avg =
      feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / total;

    const dist = [1, 2, 3, 4, 5].map(
      (s) => feedbacks.filter((f) => Number(f.rating) === s).length
    );
    const maxBar = Math.max(1, ...dist);
    const positive = feedbacks.filter((f) => Number(f.rating) >= 4).length;
    const positiveRatio = Math.round((positive / (feedbacks.length || 1)) * 100);

    // Top subjects theo điểm trung bình
    const bySubject: Record<
      string,
      { sum: number; count: number; avg: number }
    > = {};
    feedbacks.forEach((f) => {
      const key = f.subject || "Unknown";
      if (!bySubject[key]) bySubject[key] = { sum: 0, count: 0, avg: 0 };
      bySubject[key].sum += Number(f.rating) || 0;
      bySubject[key].count += 1;
    });
    Object.keys(bySubject).forEach((k) => {
      bySubject[k].avg = bySubject[k].sum / bySubject[k].count;
    });
    const topSubjects = Object.entries(bySubject)
      .sort((a, b) => b[1].avg - a[1].avg)
      .slice(0, 5);

    return { avg, dist, maxBar, positiveRatio, topSubjects };
  }, [feedbacks]);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-8">
      {/* HEADER */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Tutor Dashboard
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Overview of your tutoring sessions, pending requests, and student
          feedback.
        </p>
      </header>

      {/* STATS GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-black/5 rounded-xl p-4 shadow-sm text-center"
          >
            <p className="text-lg font-bold text-dark-blue">{s.value}</p>
            <p className="text-sm text-black/70">{s.label}</p>
            {s.sub && <p className="text-[0.7rem] text-black/50">{s.sub}</p>}
          </div>
        ))}
      </section>

      {/* UPCOMING / PENDING SESSIONS */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Upcoming & Pending Sessions
            </h2>
            <p className="text-sm text-black/60">
              Manage your upcoming sessions or confirm new requests.
            </p>
          </div>
          <Link
            href="/tutor/progress-log"
            className="rounded-md bg-light-heavy-blue text-white px-3 py-1.5 text-sm font-semibold hover:bg-light-blue transition"
          >
            View All Sessions
          </Link>
        </div>

        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="border border-soft-white-blue rounded-lg bg-soft-white-blue/50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-dark-blue">{sess.datetime}</p>
                <p className="text-sm text-black/70">
                  {sess.subject} · Student: {sess.student}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-[3px] rounded-md text-[0.65rem] font-semibold ${
                    sess.status === "CONFIRMED"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {sess.status === "CONFIRMED"
                    ? "Confirmed"
                    : "Awaiting confirmation"}
                </span>
                {sess.status === "PENDING" && (
                  <button
                    className="rounded-md border border-light-heavy-blue text-light-heavy-blue text-xs font-semibold px-3 py-1 hover:bg-soft-white-blue transition"
                    onClick={() =>
                      alert(`Confirm session ${sess.id} (mock action)`)
                    }
                  >
                    Confirm
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT FEEDBACK */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6 space-y-4 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Recent Feedback
            </h2>
            <p className="text-sm text-black/60">
              Latest feedback from your tutoring sessions.
            </p>
          </div>
          <button
            // CHANGED: mở analytics panel thay vì alert
            onClick={() => setShowAnalytics(true)}
            className="rounded-md bg-white border border-light-heavy-blue text-dark-blue text-sm font-semibold px-3 py-1.5 hover:bg-soft-white-blue/60 transition"
          >
            View Analytics
          </button>
        </div>

        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="border border-soft-white-blue rounded-lg bg-soft-white-blue/40 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-dark-blue">
                  {fb.student} · {fb.subject}
                </p>
                <p className="text-[0.75rem] text-black/60">
                  {fb.date} · Rating: {renderStars(fb.rating)}
                </p>
                <p className="text-sm text-black/80 mt-1 italic">
                  &ldquo;{fb.comment}&rdquo;
                </p>
              </div>
              <Link
                href={`/tutor/dashboard/${fb.id}`}
                className="rounded-md bg-light-heavy-blue text-white text-xs font-semibold px-3 py-1 hover:bg-light-blue transition"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* === ANALYTICS PANEL (SLIDE-UP MODAL) === */}
      {showAnalytics && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="w-full md:max-w-3xl bg-white rounded-t-2xl md:rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-dark-blue">
                  Feedback Analytics
                </h3>
                <p className="text-xs text-black/60">
                  Distribution, average rating, and top subjects (mock data)
                </p>
              </div>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-sm px-3 py-1.5 rounded-md border hover:bg-soft-white-blue transition"
              >
                Close
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-soft-white-blue/60 border border-soft-white-blue rounded-lg p-4">
                  <div className="text-xs font-semibold text-dark-blue">
                    Average Rating
                  </div>
                  <div className="text-2xl font-bold text-dark-blue mt-1">
                    {analytics.avg.toFixed(2)} / 5
                  </div>
                </div>
                <div className="bg-soft-white-blue/60 border border-soft-white-blue rounded-lg p-4">
                  <div className="text-xs font-semibold text-dark-blue">
                    Positive (≥ 4★)
                  </div>
                  <div className="text-2xl font-bold text-dark-blue mt-1">
                    {analytics.positiveRatio}%
                  </div>
                </div>
                <div className="bg-soft-white-blue/60 border border-soft-white-blue rounded-lg p-4">
                  <div className="text-xs font-semibold text-dark-blue">
                    Total Feedback
                  </div>
                  <div className="text-2xl font-bold text-dark-blue mt-1">
                    {feedbacks.length}
                  </div>
                </div>
              </div>

              {/* Distribution */}
              <div>
                <h4 className="text-sm font-semibold text-dark-blue mb-3">
                  Score Distribution
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((s, idx) => {
                    const count = analytics.dist[s - 1];
                    const ratio =
                      Math.round((count / analytics.maxBar) * 100) || 0;
                    return (
                      <div key={s} className="flex items-center gap-3">
                        <div className="w-8 text-right text-xs text-black/70">
                          {s}★
                        </div>
                        <div className="flex-1 bg-soft-white-blue rounded h-3 relative">
                          <div
                            className="absolute left-0 top-0 bottom-0 bg-light-heavy-blue rounded"
                            style={{ width: `${ratio}%` }}
                            aria-hidden
                          />
                        </div>
                        <div className="w-10 text-xs text-black/70 text-right">
                          {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top subjects */}
              <div>
                <h4 className="text-sm font-semibold text-dark-blue mb-3">
                  Top Subjects by Avg Rating
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analytics.topSubjects.map(([subj, s]) => (
                    <div
                      key={subj}
                      className="border border-soft-white-blue rounded-lg p-3 bg-soft-white-blue/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-dark-blue">
                          {subj}
                        </div>
                        <div className="text-sm font-bold text-dark-blue">
                          {s.avg.toFixed(2)} / 5
                        </div>
                      </div>
                      <div className="text-[0.7rem] text-black/60 mt-1">
                        {s.count} feedback(s)
                      </div>
                    </div>
                  ))}
                  {analytics.topSubjects.length === 0 && (
                    <div className="text-sm text-black/50">
                      No subject data.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-black/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAnalytics(false)}
                className="px-3 py-2 text-sm rounded-md border hover:bg-soft-white-blue transition"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
