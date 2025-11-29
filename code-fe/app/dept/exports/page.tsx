"use client";

import { useState } from "react";

type Job = { id: string; name: string; at: string; status: "Done"|"Queued"|"Processing"|"Failed" };

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([
    { id: "E-201", name: "Departmental (PDF)", at: "2025-10-21 21:15", status: "Done" },
    { id: "E-202", name: "Participation (CSV)", at: "2025-10-22 08:05", status: "Queued" },
  ]);

  const add = (name: string) => {
    const j: Job = { id: `E-${jobs.length+203}`, name, at: "2025-10-22 10:10", status: "Queued" };
    setJobs([j, ...jobs]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Export Center</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Generate and download department reports.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button onClick={()=>add("Departmental (PDF)")} className="px-3 py-2 text-sm rounded border hover:bg-soft-white-blue" style={{borderColor:"var(--color-soft-white-blue)"}}>
            New: Departmental
          </button>
          <button onClick={()=>add("Participation (CSV)")} className="px-3 py-2 text-sm rounded border hover:bg-soft-white-blue" style={{borderColor:"var(--color-soft-white-blue)"}}>
            New: Participation
          </button>
          <button onClick={()=>add("Workload (CSV)")} className="px-3 py-2 text-sm rounded border hover:bg-soft-white-blue" style={{borderColor:"var(--color-soft-white-blue)"}}>
            New: Workload
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="text-left py-2 px-3">Job</th>
                <th className="text-left py-2 px-3">Name</th>
                <th className="text-left py-2 px-3">Requested</th>
                <th className="text-left py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j=>(
                <tr key={j.id} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                  <td className="py-3 px-3 font-medium text-dark-blue">{j.id}</td>
                  <td className="py-3 px-3">{j.name}</td>
                  <td className="py-3 px-3">{j.at}</td>
                  <td className="py-3 px-3">{j.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}