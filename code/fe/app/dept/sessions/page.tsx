"use client";

import { useState } from "react";

type S = { id: string; course: string; tutor: string; student: string; slot: string; status: "CONFIRMED"|"PENDING"|"CANCELLED" };

const SESS: S[] = [
  { id: "S-2101", course: "CO1001", tutor: "tutor01", student: "2352525", slot: "2025-10-22 09:00", status: "CONFIRMED" },
  { id: "S-2102", course: "MA1001", tutor: "tutor02", student: "2353001", slot: "2025-10-22 13:00", status: "PENDING" },
  { id: "S-2103", course: "EE2002", tutor: "tutor03", student: "2354002", slot: "2025-10-23 10:30", status: "CONFIRMED" },
];

export default function Page() {
  const [q, setQ] = useState("");

  const rows = SESS.filter(r =>
    `${r.id} ${r.course} ${r.tutor} ${r.student}`.toLowerCase().includes(q.toLowerCase())
  );

  const badge = (s: S["status"]) =>
    s==="CONFIRMED" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s==="PENDING" ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-red-50 text-red-700 border-red-200";

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Sessions</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Browse and manage tutoring sessions.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Search by id / course / tutor / student"
          className="rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm w-full"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="text-left py-2 px-3">Session</th>
                <th className="text-left py-2 px-3">Course</th>
                <th className="text-left py-2 px-3">Tutor</th>
                <th className="text-left py-2 px-3">Student</th>
                <th className="text-left py-2 px-3">Slot</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                  <td className="py-3 px-3 font-medium text-dark-blue">{r.id}</td>
                  <td className="py-3 px-3">{r.course}</td>
                  <td className="py-3 px-3">{r.tutor}</td>
                  <td className="py-3 px-3">{r.student}</td>
                  <td className="py-3 px-3">{r.slot}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded text-xs border ${badge(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
