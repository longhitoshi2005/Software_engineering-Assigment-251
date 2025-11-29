"use client";

import Link from "next/link";
import SuggestionCard from "@/components/coord/SuggestionCard";

export default function CoordDashboardPage() {
  // ==== MOCK DATA (có thể nối BE sau) ====
  const mock_termInfo = {
    term: "2025-1",
    dept: "Computer Science & Engineering",
    // Use an explicit, deterministic date format to avoid SSR/client
    // mismatches caused by differing server/browser locale settings.
    today: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date()),
  };

  const mock_todos = [
    { id: "req-2043", title: "Approve 12 new student requests", to: "/coord/student-requests" },
    { id: "fbk-778", title: "Review 5 negative feedback flags", to: "/coord/feedback-issues" },
    { id: "con-332", title: "Resolve 3 schedule conflicts", to: "/coord/conflicts" },
  ];

  const mock_matchingSuggestions = [
    {
      id: 101,
      studentId: "23530xx",
      student: "Nguyen V. T.",
      course: "CO1001 – Programming Fundamentals",
      suggestedTutorId: "tut-1",
      suggestedTutor: "Pham Q. T.",
      score: 0.82,
      reason: "Overlapping availability (Mon/Wed) + prior course experience",
    },
    {
      id: 102,
      studentId: "23527xx",
      student: "Le A. K.",
      course: "CO2002 – Data Structures",
      suggestedTutorId: "tut-2",
      suggestedTutor: "Tran H. N.",
      score: 0.77,
      reason: "High rating in CO2002 + same department",
    },
  ];

  const mock_conflicts = [
    { id: "C-12", tutor: "Truong Q. T.", when: "Fri 16:30", reason: "Double-booking (Lab D1 / Online)" },
    { id: "C-13", tutor: "Pham Q. T.", when: "Thu 09:00", reason: "Room unavailable (C2-301)" },
  ];

  const mock_weekSessions = [
    { id: "S-2001", time: "Mon 09:00", tutor: "Pham Q. T.", student: "23531xx", course: "MA1001", room: "C2-301" },
    { id: "S-2002", time: "Wed 14:00", tutor: "Nguyen T. A.", student: "23535xx", course: "CO1001", room: "B4-205" },
    { id: "S-2003", time: "Fri 16:30", tutor: "Truong Q. T.", student: "23529xx", course: "EE2002", room: "Lab D1" },
  ];

  


  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Coordinator Dashboard
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Term <span className="font-medium">{mock_termInfo.term}</span> · {mock_termInfo.dept} · Today: {mock_termInfo.today}
        </p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Term snapshot</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { k: "Active Tutors", v: 46 },
              { k: "Open Requests", v: 23 },
              { k: "Sessions / week", v: 128 },
            ].map((it) => (
              <div key={it.k} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-xs text-black/60">{it.k}</div>
                <div className="text-lg font-semibold text-dark-blue mt-1">{it.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-soft-white-blue rounded-lg p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-dark-blue">Your to-do</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {mock_todos.map((t) => (
              <Link
                key={t.id}
                href={t.to}
                className="text-sm rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
                style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
              >
                {t.title}
              </Link>
            ))}
            <Link
              href="/coord/student-requests"
              className="text-sm font-semibold rounded-lg px-3 py-2 bg-[#003865] text-white"
            >
              Review requests
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-dark-blue">Matching suggestions</h2>
            <Link
              href="/coord/matching-suggestions"
              className="text-sm rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
              style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
            >
              View all
            </Link>
          </div>
          <div className="mt-3 flex flex-col divide-y" style={{ borderColor: "var(--color-soft-white-blue)" }}>
            {mock_matchingSuggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        </div>

        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Schedule conflicts</h2>
          <ul className="mt-3 space-y-2">
            {mock_conflicts.map((c) => (
              <li key={c.id} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-sm font-semibold text-dark-blue">{c.tutor}</div>
                <div className="text-xs text-black/70">{c.when} — {c.reason}</div>
              </li>
            ))}
          </ul>
          <div className="mt-3">
            <Link
              href="/coord/conflicts"
              className="text-sm font-semibold rounded-lg px-3 py-2 bg-[#24449A] text-white"
            >
              Resolve now
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-dark-blue">This week</h2>
            <Link
              href="/coord/schedule-overview"
              className="text-sm rounded-lg px-3 py-2 border hover:bg-soft-white-blue/70 transition"
              style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
            >
              Open calendar
            </Link>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {mock_weekSessions.map((s) => (
              <div key={s.id} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-xs text-black/60">{s.time}</div>
                <div className="text-sm font-semibold text-dark-blue mt-1">{s.course}</div>
                <div className="text-xs text-black/70 mt-1">
                  {s.tutor} · {s.student}
                </div>
                <div className="text-xs text-black/50">{s.room}</div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}

