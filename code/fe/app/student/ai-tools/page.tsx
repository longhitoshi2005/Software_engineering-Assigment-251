"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TUTORS from "@/app/lib/tutors";

type TutorSuggestion = {
  id: string;
  name: string;
  rank: number;
  expertise: string;
  nextAvailability: string;
  style: string;
  workload: "OK" | "HIGH";
  reason: string[];
  confidence: "High" | "Medium" | "Low";
};

export default function AIToolsPage() {
  const [course, setCourse] = useState("CO1001 – Programming Fundamentals");
  const [timePref, setTimePref] = useState("Weekdays 18:00 – 21:00");
  const [stylePref, setStylePref] = useState("Step-by-step explanation + Q&A");
  const [notes, setNotes] = useState("");
  // Derive AI suggestions from the shared TUTORS mock so all pages use the same data.
  const suggestions = React.useMemo(() => {
    return TUTORS.map((t, i) => {
      const expertise = t.expertise ?? t.subject;
      const nextAvailability = (t.slots ?? t.fullAvailability ?? [])
        .slice(0, 2)
        .map((s) => (typeof s === 'string' ? s : (s as any).time ?? String(s)))
        .join(' · ');
      const workload: TutorSuggestion['workload'] = (t.sessionsCompleted ?? 0) > 200 ? 'HIGH' : 'OK';
      const confidence: TutorSuggestion['confidence'] = (t.averageRating ?? 0) >= 4.5 ? 'High' : (t.averageRating ?? 0) >= 4.0 ? 'Medium' : 'Low';
      const reason = [
        `Matches subject: ${t.subject}`,
        t.match ? `Match score: ${t.match}` : null,
        t.expertise ? `Expertise: ${t.expertise}` : null,
      ].filter(Boolean) as string[];

      return {
        id: String(t.id),
        name: t.name,
        rank: i + 1,
        expertise,
        nextAvailability: nextAvailability || 'TBD',
        style: t.preferences ?? 'Flexible teaching style',
        workload,
        confidence,
        reason,
      } as TutorSuggestion;
    });
  }, []);

  const router = useRouter();

  const handleRunAI = () => {
    // Placeholder for API call; keep mock results for demo
    console.log("Run AI match with:", { course, timePref, stylePref, notes });
  };

  const handleRequestSession = (tutor: TutorSuggestion) => {
    router.push(`/student/book-session?tutorId=${tutor.id}`);
  };

  const handleViewProfile = (tutor: TutorSuggestion) => {
    router.push(`/student/tutor/${tutor.id}`);
  };

  const handleBrowseAll = () => {
    router.push('/student/find-tutor');
  };


  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue py-6">
      <div className="max-w-6xl mx-auto px-4 md:px-6 mb-6">
        <h1 className="text-2xl font-semibold text-dark-blue mb-2">AI Tutor Match</h1>
        <p className="text-sm text-black/70 max-w-3xl">
          We analyze your subject, schedule, and learning style to recommend the best tutors for you. You can still browse and book manually.
        </p>
        <p className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-light-heavy-blue px-3 py-1 rounded-md text-[0.7rem] font-medium">
          AI Suggestion • Last updated: just now • This does not auto-book.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 grid gap-6 lg:grid-cols-[320px,1fr] items-start">
        <aside className="bg-white rounded-xl border border-black/5 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-semibold text-dark-blue">Tell us what you need</h2>
              <p className="text-[0.7rem] text-black/50">FR-ADV.01 Intelligent Matching</p>
            </div>
          </div>

          <label className="block mb-3">
            <span className="text-[0.7rem] font-semibold text-dark-blue flex justify-between gap-2">Course / Topic <span className="font-normal text-black/50">Required</span></span>
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="mt-1 w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white">
              <option>CO1001 – Programming Fundamentals</option>
              <option>DSA / Linked Lists / Pointers</option>
              <option>Calculus I – Midterm Review</option>
              <option>Digital Logic – Flip-flops & Timing</option>
            </select>
            <span className="text-[0.65rem] text-black/50 mt-1 block">Used to filter tutors with matching expertise.</span>
          </label>

          <label className="block mb-3">
            <span className="text-[0.7rem] font-semibold text-dark-blue">When can you study?</span>
            <select value={timePref} onChange={(e) => setTimePref(e.target.value)} className="mt-1 w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white">
              <option>Weekdays 18:00 – 21:00</option>
              <option>Weekends morning</option>
              <option>I am flexible</option>
            </select>
            <span className="text-[0.65rem] text-black/50 mt-1 block">We will only show tutors who are free in that range.</span>
          </label>

          <label className="block mb-3">
            <span className="text-[0.7rem] font-semibold text-dark-blue">Your preferred style <span className="font-normal text-black/50">(optional)</span></span>
            <select value={stylePref} onChange={(e) => setStylePref(e.target.value)} className="mt-1 w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white">
              <option>Step-by-step explanation + Q&A</option>
              <option>Practice under exam timing</option>
              <option>Project / lab debugging together</option>
              <option>No preference</option>
            </select>
            <span className="text-[0.65rem] text-black/50 mt-1 block">Helps rank tutors whose style matches you.</span>
          </label>

          <label className="block mb-4">
            <span className="text-[0.7rem] font-semibold text-dark-blue">What are you struggling with?</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1 w-full border border-black/10 rounded-md px-3 py-2 text-sm bg-white resize-y" placeholder="Example: I don't understand pointer-to-pointer and recursion stack frames. I freeze during lab check." />
            <span className="text-[0.65rem] text-black/50 mt-1 block">We will use this (privately) to improve the match explanation.</span>
          </label>

          <button onClick={handleRunAI} className="w-full bg-light-heavy-blue text-white rounded-md py-2.5 text-sm font-semibold hover:bg-light-blue transition">🔍 Generate AI Match</button>

          <p className="text-[0.65rem] text-black/40 mt-3 text-center">Prefer to choose manually? <span
            role="link"
            tabIndex={0}
            onClick={handleBrowseAll}
            onKeyDown={(e) => { if (e.key === 'Enter') handleBrowseAll(); }}
            className="text-light-heavy-blue underline cursor-pointer"
          >Browse all tutors →</span></p>
        </aside>

        <section className="bg-white rounded-xl border border-black/5 p-4 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-dark-blue">Suggested Tutors</h2>
              <span className="text-[0.6rem] px-2 py-1 rounded bg-blue-50 text-light-heavy-blue font-semibold border border-light-heavy-blue/30">Personalized ranking</span>
            </div>
            <p className="text-[0.65rem] text-black/40">Top {suggestions.length} matches based on availability, style, workload</p>
          </div>

          <div className="space-y-4">
            {suggestions.map((tutor) => (
              <article key={tutor.id} className="bg-soft-white-blue/40 border border-black/5 rounded-lg p-4 grid gap-4 md:grid-cols-[1fr,220px]">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-dark-blue">{tutor.name}</p>
                      <span className="text-[0.6rem] bg-light-heavy-blue text-white px-2 py-[3px] rounded-md">Match #{tutor.rank}</span>
                    </div>
                    <span className={`text-[0.6rem] px-2 py-[3px] rounded-md font-semibold ${tutor.workload === "OK" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>{tutor.workload === "OK" ? "Workload OK" : "High Load"}</span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="bg-white rounded-md border border-black/5 p-2">
                      <p className="text-[0.6rem] text-black/40 uppercase tracking-wide">Expertise</p>
                      <p className="text-[0.75rem] text-black">{tutor.expertise}</p>
                    </div>
                    <div className="bg-white rounded-md border border-black/5 p-2">
                      <p className="text-[0.6rem] text-black/40 uppercase tracking-wide">Next availability</p>
                      <p className="text-[0.75rem] text-black">{tutor.nextAvailability}</p>
                    </div>
                    <div className="bg-white rounded-md border border-black/5 p-2">
                      <p className="text-[0.6rem] text-black/40 uppercase tracking-wide">Style</p>
                      <p className="text-[0.75rem] text-black">{tutor.style}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-md border border-black/5 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-[0.7rem] font-semibold text-dark-blue">Why we think this is a good match</p>
                      <p className="text-[0.6rem] text-black/40">Confidence: {tutor.confidence}</p>
                    </div>
                    <ul className="pl-4 space-y-1">
                      {tutor.reason.map((r, idx) => (
                        <li key={idx} className="text-[0.7rem] text-black/80 list-disc">{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3">
                  <button onClick={() => handleRequestSession(tutor)} className="bg-light-heavy-blue text-white rounded-md py-2 text-sm font-semibold hover:bg-light-blue transition">Request Session</button>
                  <p className="text-[0.65rem] text-black/50">or <span
                      role="link"
                      tabIndex={0}
                      onClick={() => handleViewProfile(tutor)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleViewProfile(tutor); }}
                      className="text-light-heavy-blue underline cursor-pointer"
                    >View profile</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <p className="text-center text-[0.6rem] text-black/40 mt-8">FR-ADV.01 Intelligent Matching · Ranked suggestions with explanation · User can still choose manually</p>
    </div>
  );
}
