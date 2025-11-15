"use client";

import Link from "next/link";
import { TUTOR_DASH_SESSIONS, TUTOR_DASH_FEEDBACKS } from "@/src/lib/mocks";

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
            onClick={() => alert("Open feedback analytics (mock)")}
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
              <button
                onClick={() => alert(`View full feedback ${fb.id} (mock)`)}
                className="rounded-md bg-light-heavy-blue text-white text-xs font-semibold px-3 py-1 hover:bg-light-blue transition"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
