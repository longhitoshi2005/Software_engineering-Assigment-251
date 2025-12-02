"use client";

import { useEffect, useState } from "react";

export default function EligibilityPage() {
  const [rules, setRules] = useState({ minSessions: 4, minFeedback: 75 });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // ------------ LOAD DATA FROM BACKEND ------------
  async function loadData() {
    const [rulesRes, studentsRes] = await Promise.all([
      fetch("/api/sa/eligibility/rules").then((r) => r.json()),
      fetch("/api/sa/eligibility/students").then((r) => r.json()),
    ]);

    setRules(rulesRes);
    setStudents(studentsRes);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function recalc() {
    await fetch("/api/sa/eligibility/recalculate", {
      method: "POST",
      body: JSON.stringify(rules),
    });

    alert("Eligibility recalculated!");
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">
        Loading eligibility data...
      </div>
    );

  // Calculate summary
  const eligible = students.filter(
    (s: any) =>
      s.sessions >= rules.minSessions &&
      s.feedback >= rules.minFeedback
  ).length;

  const total = students.length;
  const notEligible = total - eligible;

  return (
    <div className="bg-[#eef2fa] min-h-screen p-6 md:p-10 space-y-10">

      {/* -------- Page Header -------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#0b1e49]">Eligibility / Credits</h1>
        <p className="text-sm text-gray-600 mt-1">
          Define eligibility rules and check which students qualify for training credits or scholarships.
        </p>
      </header>

      {/* -------- Eligibility Rules -------- */}
      <section className="bg-white border border-gray-300 rounded-xl p-6 shadow">
        <h2 className="text-lg font-semibold text-[#0b1e49] mb-4">Eligibility Rules</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-gray-600">Minimum Sessions Attended</label>
            <input
              type="number"
              value={rules.minSessions}
              onChange={(e) =>
                setRules({ ...rules, minSessions: Number(e.target.value) })
              }
              className="w-full mt-1 p-3 border rounded-md bg-[#d9dfee]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Minimum Feedback Completion (%)</label>
            <input
              type="number"
              value={rules.minFeedback}
              onChange={(e) =>
                setRules({ ...rules, minFeedback: Number(e.target.value) })
              }
              className="w-full mt-1 p-3 border rounded-md bg-[#d9dfee]"
            />
          </div>

        </div>

        <button
          onClick={recalc}
          className="mt-5 px-5 py-3 bg-[#0b5ed7] text-white rounded-lg shadow hover:bg-[#094db0]"
        >
          🔄 Recalculate Eligibility
        </button>
      </section>

      {/* -------- Eligible Students Table -------- */}
      <section className="bg-white border border-gray-300 rounded-xl p-6 shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#0b1e49]">
            Eligible Students ({eligible})
          </h2>

          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100">
            📄 Export List
          </button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">Student ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Sessions</th>
              <th className="p-3 text-left">Feedback (%)</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s: any) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{s.id}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.sessions}</td>
                <td className="p-3">{s.feedback}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* -------- Summary Statistics -------- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <SummaryCard title="Total Students" value={total} color="bg-gray-100" />
        <SummaryCard title="Eligible" value={eligible} color="bg-green-100 text-green-700" />
        <SummaryCard title="Not Eligible" value={notEligible} color="bg-yellow-100 text-yellow-700" />

      </section>

    </div>
  );
}

// Summary card component
function SummaryCard({ title, value, color }: any) {
  return (
    <div className={`rounded-xl p-6 border border-gray-300 ${color}`}>
      <p className="text-gray-600 text-sm">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
  );
}
