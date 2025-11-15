"use client";

import Link from "next/link";

type T = { id: string; name: string; rating: string; loadH: number; courses: string[] };

const TUT: T[] = [
  { id: "tutor01", name: "Nguyen A", rating: "4.8", loadH: 62, courses: ["CO1001","PH1001"] },
  { id: "tutor02", name: "Tran B", rating: "4.5", loadH: 38, courses: ["MA1001"] },
  { id: "tutor03", name: "Le C", rating: "4.7", loadH: 70, courses: ["EE2002","CO1001"] },
];

export default function Page() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Tutors</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Roster and quick stats.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {TUT.map(t=>(
            <li key={t.id} className="p-3 border border-soft-white-blue rounded bg-soft-white-blue/50">
              <div className="text-sm font-semibold text-dark-blue">{t.name} <span className="text-black/60">· {t.id}</span></div>
              <div className="text-xs text-black/60">Rating {t.rating} · Load {t.loadH}h · {t.courses.join(", ")}</div>
              <div className="mt-2">
                <Link href={`/dept/tutors/${t.id}`} className="text-sm text-light-heavy-blue hover:underline">View profile</Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
