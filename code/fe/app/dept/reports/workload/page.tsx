"use client";

import React, { useState, useMemo } from "react";
import { hasRole, Role } from '@/app/lib/role';
import ClientRoleGuard from "@/app/coord/ClientRoleGuard";

const WorkloadReports: React.FC = () => {
  const [period, setPeriod] = useState("monthly");

  const workloadData = useMemo(() => [
    { coordinator: "Alice Johnson", assignedSessions: 45, resolvedConflicts: 12, pendingRequests: 8, avgResponseTime: "2.3h" },
    { coordinator: "Bob Smith", assignedSessions: 38, resolvedConflicts: 15, pendingRequests: 5, avgResponseTime: "1.8h" },
    { coordinator: "Carol Davis", assignedSessions: 52, resolvedConflicts: 8, pendingRequests: 12, avgResponseTime: "3.1h" },
    { coordinator: "David Wilson", assignedSessions: 41, resolvedConflicts: 10, pendingRequests: 6, avgResponseTime: "2.5h" },
  ], []);

  return (
    <ClientRoleGuard allowedRoles={[Role.DepartmentChair, Role.ProgramAdmin]} title="Workload reports (DepartmentChair only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Workload reports</h1>
        <p className="text-sm text-black/70 mt-1">Monitor coordinator performance and workload distribution.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="weekly">This week</option>
            <option value="monthly">This month</option>
            <option value="quarterly">This quarter</option>
          </select>

          {hasRole(Role.Coordinator, Role.ProgramAdmin) ? (
            <button onClick={() => import('@/app/admin/actions').then(m => m.exportWorkload())} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
              Export report
            </button>
          ) : (
            <div className="text-sm text-black/60">Exporting reports is limited to Coordinators and Program Admins.</div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-white-blue">
                <th className="text-left py-3 px-2 font-medium text-dark-blue">Coordinator</th>
                <th className="text-center py-3 px-2 font-medium text-dark-blue">Assigned Sessions</th>
                <th className="text-center py-3 px-2 font-medium text-dark-blue">Resolved Conflicts</th>
                <th className="text-center py-3 px-2 font-medium text-dark-blue">Pending Requests</th>
                <th className="text-center py-3 px-2 font-medium text-dark-blue">Avg Response Time</th>
              </tr>
            </thead>
            <tbody>
              {workloadData.map((data, index) => (
                <tr key={index} className="border-b border-soft-white-blue/50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-dark-blue">{data.coordinator}</td>
                  <td className="py-3 px-2 text-center">{data.assignedSessions}</td>
                  <td className="py-3 px-2 text-center">{data.resolvedConflicts}</td>
                  <td className="py-3 px-2 text-center">{data.pendingRequests}</td>
                  <td className="py-3 px-2 text-center">{data.avgResponseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark-blue mb-3">Workload distribution</h3>
          <div className="space-y-3">
            {workloadData.map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-dark-blue w-32 truncate">{data.coordinator}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(data.assignedSessions / 60) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-black/60 w-12 text-right">{data.assignedSessions}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h3 className="text-base font-semibold text-dark-blue mb-3">Performance metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-dark-blue">176</div>
              <div className="text-sm text-black/60">Total assignments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-dark-blue">45</div>
              <div className="text-sm text-black/60">Conflicts resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-dark-blue">31</div>
              <div className="text-sm text-black/60">Pending requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-dark-blue">2.4h</div>
              <div className="text-sm text-black/60">Avg response time</div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ClientRoleGuard>
  );
};

export default WorkloadReports;
