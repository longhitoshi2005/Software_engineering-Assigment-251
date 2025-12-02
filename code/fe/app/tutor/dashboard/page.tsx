"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type TutorStat = {
  label: string;
  value: string | number;
  sub?: string;
};

type SessionMode = "ONLINE" | "OFFLINE" | "HYBRID";
type SessionStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

type SessionItem = {
  id: string;
  studentName: string;
  studentId?: string | null;
  courseCode: string;
  courseTitle: string;
  scheduledStart: string;
  scheduledEnd?: string | null;
  mode: SessionMode;
  status: SessionStatus;
};

type FeedbackItem = {
  id: string;
  studentName: string;
  courseCode: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type DashboardSnapshot = {
  stats: TutorStat[];
  upcomingSessions: SessionItem[];
  recentFeedback: FeedbackItem[];
};

const API_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
};

const API_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

const formatDateTime = (iso: string) => {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString(undefined, API_DATE_TIME_OPTIONS);
};

const formatDate = (iso: string) => {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString(undefined, API_DATE_OPTIONS);
};

const SESSION_STATUS_STYLE: Record<SessionStatus, { label: string; className: string }> = {
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  PENDING: {
    label: "Awaiting confirmation",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
};

export default function TutorDashboardPage() {
  const apiKey = process.env.NEXT_PUBLIC_TUTOR_API_KEY ?? "";
  const baseHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (apiKey) headers["x-api-key"] = apiKey;
    return headers;
  }, [apiKey]);

  const [stats, setStats] = useState<TutorStat[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <span key={i}>{i < count ? "★" : "☆"}</span>
    ));

  const loadDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      if (!silent) setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/tutor/dashboard", {
          headers: baseHeaders,
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Failed to load dashboard");
        }
        const snapshot: DashboardSnapshot = json.data;
        setStats(snapshot?.stats ?? []);
        setSessions(snapshot?.upcomingSessions ?? []);
        setFeedbacks(snapshot?.recentFeedback ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load dashboard";
        setError(message);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [apiKey, baseHeaders]
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const handleConfirmSession = useCallback(
    async (sessionId: string) => {
      setConfirmingId(sessionId);
      try {
        const res = await fetch("/api/tutor/sessions", {
          method: "POST",
          headers: {
            ...baseHeaders,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: sessionId, action: "confirm" }),
        });
        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || "Unable to confirm session");
        }

        const updated: SessionItem = json.data;
        setSessions((prev) =>
          prev.map((sess) => (sess.id === sessionId ? { ...sess, ...updated } : sess))
        );
        // refresh stats & feedback silently to reflect latest snapshot
        await loadDashboard({ silent: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to confirm session";
        setError(message);
      } finally {
        setConfirmingId(null);
      }
    },
    [apiKey, baseHeaders, loadDashboard]
  );

  const analytics = useMemo(() => {
    const safeFeedbacks = feedbacks ?? [];
    const total = safeFeedbacks.length || 1;
    const avg =
      safeFeedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0) / total;

    const dist = [1, 2, 3, 4, 5].map(
      (s) => safeFeedbacks.filter((f) => Number(f.rating) === s).length
    );
    const maxBar = Math.max(1, ...dist);
    const positive = safeFeedbacks.filter((f) => Number(f.rating) >= 4).length;
    const positiveRatio = Math.round((positive / (safeFeedbacks.length || 1)) * 100);

    const bySubject: Record<string, { sum: number; count: number; avg: number }> = {};
    safeFeedbacks.forEach((f) => {
      const key = f.courseCode || "Unknown";
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
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Tutor Dashboard
          </h1>
          <p className="text-sm text-black/70 mt-1 max-w-2xl">
            Overview of your tutoring sessions, pending requests, and student
            feedback.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-xs text-black/60">Refreshing…</span>
          )}
          <button
            type="button"
            onClick={() => {
              void loadDashboard();
            }}
            className="rounded-md border border-light-heavy-blue text-light-heavy-blue text-xs font-semibold px-3 py-1.5 hover:bg-soft-white-blue transition"
          >
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* STATS GRID */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.length === 0 && !loading ? (
          <div className="col-span-full text-center text-sm text-black/50 py-6 border border-dashed border-black/10 rounded-lg bg-white/60">
            No dashboard metrics available yet.
          </div>
        ) : (
          stats.map((s) => (
            <div
              key={s.label}
              className="bg-white border border-black/5 rounded-xl p-4 shadow-sm text-center"
            >
              <p className="text-lg font-bold text-dark-blue">{s.value}</p>
              <p className="text-sm text-black/70">{s.label}</p>
              {s.sub && <p className="text-[0.7rem] text-black/50">{s.sub}</p>}
            </div>
          ))
        )}
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
          {sessions.length === 0 && !loading ? (
            <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-lg bg-white/60 px-3 py-4 text-center">
              No upcoming or pending sessions at the moment.
            </div>
          ) : (
            sessions.map((sess) => {
              const statusStyle = SESSION_STATUS_STYLE[sess.status] ?? SESSION_STATUS_STYLE.PENDING;
              return (
                <div
                  key={sess.id}
                  className="border border-soft-white-blue rounded-lg bg-soft-white-blue/50 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-dark-blue">
                      {formatDateTime(sess.scheduledStart)}
                    </p>
                    <p className="text-sm text-black/70">
                      {sess.courseTitle} ({sess.courseCode}) · Student: {sess.studentName}
                    </p>
                    {sess.mode && (
                      <p className="text-[0.7rem] text-black/50 mt-1">
                        Mode: {sess.mode.toLowerCase()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-[3px] rounded-md text-[0.65rem] font-semibold ${statusStyle.className}`}
                    >
                      {statusStyle.label}
                    </span>
                    {sess.status === "PENDING" && (
                      <button
                        type="button"
                        onClick={() => {
                          void handleConfirmSession(sess.id);
                        }}
                        disabled={confirmingId === sess.id}
                        className={`rounded-md border border-light-heavy-blue text-xs font-semibold px-3 py-1 transition ${
                          confirmingId === sess.id
                            ? "bg-light-heavy-blue text-white opacity-70"
                            : "text-light-heavy-blue hover:bg-soft-white-blue"
                        }`}
                      >
                        {confirmingId === sess.id ? "Confirming…" : "Confirm"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
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
          {feedbacks.length === 0 && !loading ? (
            <div className="text-sm text-black/50 border border-dashed border-black/10 rounded-lg bg-white/60 px-3 py-4 text-center">
              No feedback has been submitted yet.
            </div>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="border border-soft-white-blue rounded-lg bg-soft-white-blue/40 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div>
                  <p className="font-semibold text-dark-blue">
                    {fb.studentName} · {fb.courseCode}
                  </p>
                  <p className="text-[0.75rem] text-black/60">
                    {formatDate(fb.createdAt)} · Rating: {renderStars(fb.rating)}
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
            ))
          )}
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
                  Distribution, average rating, and top subjects from recent feedback.
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
                  {[5, 4, 3, 2, 1].map((s) => {
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
