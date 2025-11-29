"use client";

export default function Page() {
  const kpis = [
    { label: "Tutors Active", value: 42, sub: "This term" },
    { label: "Sessions (30d)", value: 318, sub: "Completed" },
    { label: "Avg Rating", value: "4.6 / 5", sub: "2,184 feedbacks" },
    { label: "Open Issues", value: 7, sub: "Need review" },
  ];

  const notices = [
    { id: "N-01", text: "Midterm period starts next week. Expect +25% demand.", when: "2025-10-25" },
    { id: "N-02", text: "3 tutors near max workload. Consider rebalance.", when: "2025-10-22" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6 py-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Department Dashboard</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Overview of tutoring operations: capacity, quality, risks.
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-black/5 rounded-lg p-4 text-center">
            <div className="text-xl md:text-2xl font-bold text-dark-blue">{k.value}</div>
            <div className="text-sm text-black/70">{k.label}</div>
            {k.sub && <div className="text-[0.7rem] text-black/50">{k.sub}</div>}
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Workload Snapshot</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>CO1001 – 38% of total hours</li>
            <li>MA1001 – 24% of total hours</li>
            <li>EE2002 – 21% of total hours</li>
            <li>PH1001 – 17% of total hours</li>
          </ul>
        </div>
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Notices</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {notices.map(n => (
              <li key={n.id} className="p-3 rounded bg-soft-white-blue/60 border border-soft-white-blue">
                <div className="font-medium text-dark-blue">{n.text}</div>
                <div className="text-[0.75rem] text-black/50">{n.when}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
