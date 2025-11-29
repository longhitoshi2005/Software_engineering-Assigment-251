"use client";

import React, { useMemo, useState } from "react";
import { hasRole, Role } from "@/lib/role";
import { requestExport } from "@/lib/exports";
import ClientRoleGuard from "@/components/ClientRoleGuard";
import { TUTOR_STATS, type TutorStat } from "@/lib/mocks";

const ReportsWorkload: React.FC = () => {
  const [tutors] = useState<TutorStat[]>(TUTOR_STATS);

  const totalTutors = tutors.length;
  const avgLoad = useMemo(
    () => Math.round(tutors.reduce((s, t) => s + t.utilization, 0) / tutors.length),
    [tutors]
  );
  const overbooked = tutors.filter((t) => t.utilization > 100).length;

  const exportCsv = async (kind = "workload") => {
    try {
      await requestExport(kind);
      alert("Export started / downloaded");
    } catch (err: any) {
      alert("Export failed: " + (err?.message || String(err)));
    }
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.DEPARTMENT_CHAIR, Role.PROGRAM_ADMIN]} title="Reports">
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
        <header>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">Workload Report</h1>
          <p className="text-sm text-black/70 mt-1">Department workload summary showing total sessions and tutor load.</p>
        </header>

        <main className="max-w-6xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-black/5 p-4">
              <p className="text-xs text-black/60">Total tutors</p>
              <p className="text-2xl font-semibold">{totalTutors}</p>
            </div>
            <div className="bg-white rounded-lg border border-black/5 p-4">
              <p className="text-xs text-black/60">Average utilization</p>
              <p className="text-2xl font-semibold">{avgLoad}%</p>
            </div>
            <div className="bg-white rounded-lg border border-black/5 p-4">
              <p className="text-xs text-black/60">Overbooked</p>
              <p className="text-2xl font-semibold">{overbooked}</p>
            </div>
          </div>

          <div className="flex justify-end">
            {hasRole(Role.DEPARTMENT_CHAIR) ? (
              <button onClick={() => exportCsv("departmental_csv")} className="px-3 py-1 rounded-md bg-light-heavy-blue text-white text-sm">
                Departmental (CSV)
              </button>
            ) : (
              <div className="text-sm text-black/60">You do not have permission to export this report.</div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-black/5 p-4">
            <table className="w-full text-sm">
              <thead className="text-xs text-black/60">
                <tr>
                  <th className="text-left py-2">Tutor</th>
                  <th className="text-left">Faculty</th>
                  <th className="text-left">ActiveSessions</th>
                  <th className="text-left">MaxLoad</th>
                  <th className="text-left">Utilization%</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tutors.map((t) => (
                  <tr key={t.name}>
                    <td className="py-2">{t.name}</td>
                    <td>{t.faculty}</td>
                    <td>{t.active}</td>
                    <td>{t.max}</td>
                    <td>{t.utilization}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </ClientRoleGuard>
  );
};

export default ReportsWorkload;
