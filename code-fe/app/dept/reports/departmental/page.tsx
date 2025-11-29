"use client";

export default function Page() {
  const lines = [
    "Enrollment coverage by course (tutor hrs vs demand).",
    "Outcome KPIs: avg rating, completion %, at-risk flags.",
    "Recommendations: hire plan, rebalancing hints.",
  ];
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Departmental Report</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Executive summary for department council.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-2 text-sm">
        {lines.map((t,i)=>(
          <p key={i}>• {t}</p>
        ))}
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <button className="px-4 py-2 bg-light-heavy-blue text-white rounded text-sm font-medium hover:bg-[#00539a]">
          Export as PDF (mock)
        </button>
      </section>
    </div>
  );
}
