"use client";

import { useEffect, useState } from "react";

export default function ParticipationReportPage() {
  const [years, setYears] = useState<number[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [year, setYear] = useState("2023");
  const [program, setProgram] = useState("CSE");
  const [minSessions, setMinSessions] = useState(2);

  const [loading, setLoading] = useState(true);

  async function loadReport() {
    const res = await fetch("/api/sa/participation-report");
    const json = await res.json();

    setYears(json.filters.years);
    setPrograms(json.filters.programs);
    setClasses(json.data);

    setLoading(false);
  }

  useEffect(() => {
    loadReport();
  }, []);

  async function exportReport() {
    await fetch("/api/sa/participation-report/export", {
      method: "POST",
      body: JSON.stringify({ year, program, minSessions }),
    });

    alert("Report exported!");
  }

  if (loading)
    return (
      <div className="p-10 text-gray-600 text-center">Loading participation report…</div>
    );

  return (
    <div className="bg-[#e4e8f3] min-h-screen p-6 md:p-10 space-y-10">

      <header>
        <h1 className="text-3xl font-bold text-[#0b1e49]">Participation report</h1>
        <p className="text-sm text-gray-600 mt-1">
          Filter by cohort/program, set thresholds.
        </p>
      </header>

      <section className="bg-white p-6 rounded-xl border border-gray-300 shadow space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div>
            <label className="text-sm text-gray-600">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full mt-1 p-3 border rounded-md bg-[#d9dfee] text-[#0b1e49]"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Program</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full mt-1 p-3 border rounded-md bg-[#d9dfee] text-[#0b1e49]"
            >
              {programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Min sessions per student</label>
            <input
              type="number"
              value={minSessions}
              onChange={(e) => setMinSessions(Number(e.target.value))}
              className="w-full mt-1 p-3 border rounded-md bg-[#d9dfee] text-[#0b1e49]"
              placeholder="2"
            />
          </div>

        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="p-3">Class</th>
                <th className="p-3"># Students</th>
                <th className="p-3">Participated</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((cls) => (
                <tr key={cls.class} className="border-b hover:bg-gray-50">
                  <td className="p-3">{cls.class}</td>
                  <td className="p-3">{cls.total}</td>
                  <td className="p-3">{cls.participated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={exportReport}
          className="mt-6 px-6 py-3 bg-[#0b5ed7] hover:bg-[#094db0] text-white rounded-lg shadow font-medium"
        >
          Export report
        </button>

      </section>
    </div>
  );
}
