"use client";

import Link from "next/link";
import { todaySessions, weekSessions } from "@/lib/sessionsToday";

export default function TutorSessionsTodayPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Your Sessions (Today / Week)</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Quick view for upcoming sessions.</p>
      </header>

      {/* Sessions Grid */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Today</h2>
          <ul className="mt-3 space-y-2">
            {todaySessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/tutor/sessions-today/${s.id}`}
                  className="block bg-soft-white-blue rounded-lg p-3 transition hover:bg-light-blue/20"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-dark-blue">
                        {s.time} — {s.course}
                      </div>
                      <div className="text-xs text-black/60">
                        Student {s.student}
                        {s.courseTitle ? ` · ${s.courseTitle}` : ""}
                      </div>
                      <div className="text-xs text-black/40 mt-1">Room {s.room}</div>
                    </div>
                    <span className="text-[0.65rem] uppercase tracking-wide text-light-heavy-blue font-semibold">
                      Join
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">This week</h2>
          <ul className="mt-3 space-y-2">
            {weekSessions.map((s) => (
              <li key={s.id} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-sm font-semibold text-dark-blue">
                  {s.day} {s.time} — {s.course}
                </div>
                {s.courseTitle && (
                  <div className="text-xs text-black/60 mt-1">{s.courseTitle}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}