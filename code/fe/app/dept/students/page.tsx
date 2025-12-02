"use client";

import Link from "next/link";

type St = { id: string; name: string; major: string; sessions: number; risk?: string };

const ST: St[] = [
  { id: "2352525", name: "Khanh", major: "CSE", sessions: 6 },
  { id: "2353001", name: "Minh", major: "CSE", sessions: 4, risk: "Low attendance last 2 weeks" },
];

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Students</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">At-a-glance usage and risk flags.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {ST.map(s=>(
            <li key={s.id} className="p-3 border border-soft-white-blue rounded bg-soft-white-blue/50">
              <div className="text-sm font-semibold text-dark-blue">{s.name} <span className="text-black/60">· {s.id}</span></div>
              <div className="text-xs text-black/60">Major: {s.major} · Sessions: {s.sessions}</div>
              {s.risk && <div className="text-xs text-amber-700 mt-1">⚠ {s.risk}</div>}
              <div className="mt-2">
                <Link href={`/dept/students/${s.id}`} className="text-sm text-light-heavy-blue hover:underline">Open profile</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
