"use client";

import Link from "next/link";
import SuggestionCard from "@/components/coord/SuggestionCard";

export default function CoordDashboardPage() {
  // ==== MOCK DATA (có thể nối BE sau) ====
  const mock_termInfo = {
    term: "2025-1",
    dept: "Computer Science & Engineering",
    today: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date()),
  };

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

      {/* ONLY KEEP MATCHING + CONFLICTS */}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Matching suggestions */}
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

        {/* Conflicts */}
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

    </div>
  );
}
