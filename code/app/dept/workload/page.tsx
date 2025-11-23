"use client";

import { useMemo, useState } from "react";

type Row = { tutor: string; totalH: number; co1001: number; ma1001: number; ee2002: number; ph1001: number };

const DATA: Row[] = [
  { tutor: "tutor01", totalH: 62, co1001: 22, ma1001: 14, ee2002: 16, ph1001: 10 },
  { tutor: "tutor02", totalH: 38, co1001: 12, ma1001: 10, ee2002: 8, ph1001: 8 },
  { tutor: "tutor03", totalH: 70, co1001: 28, ma1001: 18, ee2002: 12, ph1001: 12 },
  { tutor: "tutor04", totalH: 44, co1001: 14, ma1001: 10, ee2002: 12, ph1001: 8 },
];

export default function Page() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"DESC" | "ASC">("DESC");

  const rows = useMemo(() => {
    const r = DATA.filter(d => d.tutor.toLowerCase().includes(q.toLowerCase()));
    return r.sort((a, b) => sort === "DESC" ? b.totalH - a.totalH : a.totalH - b.totalH);
  }, [q, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Tutor Workload</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Detect overload and distribute evenly.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Search tutor…"
            className="flex-1 rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm"
          />
          <select
            value={sort}
            onChange={(e)=>setSort(e.target.value as any)}
            className="rounded bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm"
          >
            <option value="DESC">Sort by Hours: High → Low</option>
            <option value="ASC">Sort by Hours: Low → High</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="py-2 px-3 text-left">Tutor</th>
                <th className="py-2 px-3 text-right">Total (h)</th>
                <th className="py-2 px-3 text-right">CO1001</th>
                <th className="py-2 px-3 text-right">MA1001</th>
                <th className="py-2 px-3 text-right">EE2002</th>
                <th className="py-2 px-3 text-right">PH1001</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.tutor} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                  <td className="py-3 px-3 font-medium text-dark-blue">{r.tutor}</td>
                  <td className="py-3 px-3 text-right">{r.totalH}</td>
                  <td className="py-3 px-3 text-right">{r.co1001}</td>
                  <td className="py-3 px-3 text-right">{r.ma1001}</td>
                  <td className="py-3 px-3 text-right">{r.ee2002}</td>
                  <td className="py-3 px-3 text-right">{r.ph1001}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
