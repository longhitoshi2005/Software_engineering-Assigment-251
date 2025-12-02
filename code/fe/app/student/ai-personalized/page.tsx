"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type WeakSpot = {
  id: string;
  title: string;
  source: "feedback" | "tutor-log" | "auto";
  detail: string;
};

type PlanItem = {
  id: string;
  day: string;
  title: string;
  desc: string;
  type: "practice" | "review" | "session" | "library";
  link?: string;
};

export default function AIPersonalizedPage() {
  const router = useRouter();

  const [weakSpots] = useState<WeakSpot[]>([
    {
      id: "W1",
      title: "Pointer-to-pointer in recursion",
      source: "tutor-log",
      detail: "Tutor: “student still confuses reference level when returning from recursion.” (2025-10-27)",
    },
    {
      id: "W2",
      title: "Calculus I – applied derivative",
      source: "feedback",
      detail: "You rated 3/5 for “can solve application problems” in last feedback.",
    },
    {
      id: "W3",
      title: "Consistency / follow-up",
      source: "auto",
      detail: "You missed 1 scheduled session in Oct. System recommends smaller, frequent tasks.",
    },
  ]);

  const [plan] = useState<PlanItem[]>([
    {
      id: "P1",
      day: "Today",
      title: "Redo pointer recursion trace (15 mins)",
      desc: "Use the sample from tutor Khanh (CO1001 · Lab 03). Stop at the return frame and write memory state.",
      type: "practice",
    },
    {
      id: "P2",
      day: "Tomorrow",
      title: "Run AI Quiz for ‘derivative application’",
      desc: "Generate 3 exam-style questions and try to solve under 5 minutes each.",
      type: "review",
    },
    {
      id: "P3",
      day: "In 2 days",
      title: "Book 30-min session on recursion",
      desc: "System sees open slot from ‘Nguyen T. A.’ on Wed 19:00 – 19:30.",
      type: "session",
    },
    {
      id: "P4",
      day: "Weekend",
      title: "Read: EE2002 – Digital Systems Lab Manual (rev. 2024)",
      desc: "Suggested from library because you attached a related file last time.",
      type: "library",
    },
  ]);

  const badgeByType: Record<PlanItem["type"], string> = {
    practice: "bg-emerald-100 text-emerald-700",
    review: "bg-blue-100 text-blue-700",
    session: "bg-orange-100 text-orange-700",
    library: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue py-6">
      <div className="max-w-5xl mx-auto px-4 md:px-6 mb-6 flex flex-wrap justify-between gap-4 items-start">
        <div>
          <h1 className="text-2xl font-semibold text-dark-blue">Personalized Learning</h1>
          <p className="text-sm text-black/70 mt-1">AI looks at your sessions, feedback, and attached resources to suggest what to do next. You can run, skip, or replace any item.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 grid gap-6 lg:grid-cols-[280px,1fr] items-start">
        <aside className="bg-white rounded-xl border border-black/5 p-4 shadow-sm space-y-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-black/40 mb-1">Current learning context</p>
            <h2 className="text-sm font-semibold text-dark-blue">You’re currently taking</h2>
            <p className="text-xs text-black/70 mt-1">CO1001 – Programming Fundamentals<br/>MA1001 – Calculus I</p>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-black/40 mb-1">Last session</p>
            <div className="bg-soft-white-blue/50 border border-black/5 rounded-md p-2">
              <p className="text-[0.7rem] text-dark-blue font-semibold">2025-10-27 · Recursion & pointer debugging</p>
              <p className="text-[0.6rem] text-black/50">Tutor: Nguyen M. Q. Khanh · Status: Completed · Progress log attached</p>
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-black/40 mb-2">Weak spots the system detected</p>
            <ul className="space-y-2">
              {weakSpots.map((w) => (
                <li key={w.id} className="bg-soft-white-blue/40 border border-black/5 rounded-md p-2">
                  <p className="text-[0.7rem] font-semibold text-dark-blue">{w.title}</p>
                  <p className="text-[0.6rem] text-black/50">{w.detail}</p>
                  <p className="text-[0.55rem] text-black/30 mt-1">Source: {w.source === "tutor-log" ? "Tutor Progress Log" : w.source === "feedback" ? "Your Feedback" : "System inference"}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 border-t border-dashed border-black/10">
            <p className="text-[0.6rem] text-black/40">FR-ADV.02 Personalized Suggestions · uses student session history + tutor logs + feedback</p>
          </div>
        </aside>

        <section className="bg-white rounded-xl border border-black/5 p-4 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3 mb-4 items-center">
            <div>
              <h2 className="text-sm font-semibold text-dark-blue">Your 7-day AI study plan</h2>
              <p className="text-[0.65rem] text-black/40">Ordered by urgency & relevance to your weak spots</p>
            </div>
            <button className="text-[0.65rem] text-light-heavy-blue underline underline-offset-2">Regenerate / Replace item</button>
          </div>

          <div className="space-y-3">
            {plan.map((item) => (
              <article key={item.id} className="border border-black/5 rounded-lg bg-soft-white-blue/30 p-3 flex gap-3">
                <div className="mt-1"><p className="text-[0.6rem] text-black/30 uppercase tracking-wide">{item.day}</p></div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <h3 className="text-[0.8rem] font-semibold text-dark-blue">{item.title}</h3>
                    <span className={`text-[0.6rem] px-2 py-[3px] rounded-full ${badgeByType[item.type]}`}>{item.type}</span>
                  </div>
                  <p className="text-[0.7rem] text-black/70">{item.desc}</p>

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {item.type === "review" && (
                      <button onClick={() => router.push('/student/ai-quiz')} className="text-[0.6rem] bg-light-heavy-blue text-white px-3 py-1 rounded-md font-semibold hover:bg-light-blue transition">Generate Quiz →</button>
                    )}
                    {item.type === "session" && (
                      <button onClick={() => router.push('/student/book-session')} className="text-[0.6rem] bg-white border border-black/10 text-dark-blue px-3 py-1 rounded-md font-semibold hover:bg-soft-white-blue transition">Book Now →</button>
                    )}
                    {item.type === "library" && (
                      <button onClick={() => router.push('/student/library')} className="text-[0.6rem] bg-white border border-black/10 text-dark-blue px-3 py-1 rounded-md font-semibold hover:bg-soft-white-blue transition">Open Library →</button>
                    )}
                    <button className="text-[0.6rem] text-black/40 hover:text-black/70">Mark as done</button>
                    <button className="text-[0.6rem] text-black/40 hover:text-black/70">Replace</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="text-[0.6rem] text-black/30 mt-4">Note: Tutors and coordinators (with permission) can view your AI plan to prepare better sessions.</p>
        </section>
      </div>

      <p className="text-center text-[0.6rem] text-black/40 mt-8">HCMUT Tutor Support System · AI Personalized Learning · links to AI Quiz, Book Session, and Library</p>
    </div>
  );
}
