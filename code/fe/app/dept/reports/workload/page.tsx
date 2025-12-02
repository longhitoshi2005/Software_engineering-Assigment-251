"use client";

export default function Page() {
  const dist = [
    { band: "≤ 30h", tutors: 8 },
    { band: "31–50h", tutors: 19 },
    { band: "51–70h", tutors: 11 },
    { band: "> 70h", tutors: 4 },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Workload Report</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Distribution of accumulated hours per tutor.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2 text-sm">
          {dist.map((d)=>(
            <li key={d.band} className="flex items-center justify-between p-3 border border-soft-white-blue rounded bg-soft-white-blue/40">
              <span className="font-medium text-dark-blue">{d.band}</span>
              <span>{d.tutors} tutor(s)</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
