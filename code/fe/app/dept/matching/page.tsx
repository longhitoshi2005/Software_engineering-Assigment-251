"use client";

export default function Page() {
  const suggested = [
    { id: "M-101", student: "2352525", need: "CO1001 – Pointers", tutor: "tutor03", reason: "High CO1001 rating" },
    { id: "M-102", student: "2353001", need: "MA1001 – Integrals", tutor: "tutor02", reason: "Available Thu morning" },
  ];
  const risks = [
    { id: "R-11", note: "tutor03 near overload (70h)", action: "Consider assigning to tutor02" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Matching Oversight</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Review auto-suggestions and risks before confirmation.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue">Auto-suggested Matches</h2>
        <ul className="mt-3 space-y-2">
          {suggested.map(s => (
            <li key={s.id} className="p-3 border border-soft-white-blue rounded bg-soft-white-blue/50">
              <div className="text-sm">
                <span className="font-semibold text-dark-blue">{s.student}</span> → <span className="font-semibold">{s.tutor}</span>
                <span className="text-black/60"> · {s.need}</span>
              </div>
              <div className="text-[0.75rem] text-black/60">Reason: {s.reason}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue">Risk & Rebalance</h2>
        <ul className="mt-3 space-y-2">
          {risks.map(r => (
            <li key={r.id} className="p-3 border border-soft-white-blue rounded bg-amber-50">
              <div className="text-sm text-amber-800">{r.note}</div>
              <div className="text-[0.75rem] text-amber-700">Suggestion: {r.action}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
