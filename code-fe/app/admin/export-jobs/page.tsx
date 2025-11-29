"use client";

export default function AdminExportJobsPage() {
  const jobs = [
    { id: "E-090", name: "Departmental Report (CSV)", at: "2025-11-01 21:15", status: "Done" },
    { id: "E-091", name: "Participation Report (PDF)", at: "2025-11-02 08:05", status: "Queued" },
    { id: "E-092", name: "Audit Logs (CSV)", at: "2025-11-02 09:40", status: "Processing" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Export Jobs</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Recent exports and their statuses.</p>
      </header>

      {/* Jobs List */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <ul className="space-y-2">
          {jobs.map(j => (
            <li key={j.id} className="bg-soft-white-blue rounded-lg p-3">
              <div className="text-sm font-semibold text-dark-blue">{j.name}</div>
              <div className="text-xs text-black/60 mt-1">{j.at} · {j.status}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}