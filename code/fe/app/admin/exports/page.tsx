"use client";

import { useState } from "react";
import { hasRole, Role } from '@/src/lib/role';

interface ExportJob {
  id: string;
  name: string;
  at: string;
  status: "Done" | "Queued" | "Processing" | "Failed" | "Canceled" | "Timeout";
}

export default function AdminExportsPage() {
  const [jobs, setJobs] = useState<ExportJob[]>([
    { id: "E-090", name: "Departmental Report (CSV)", at: "2025-11-01 21:15", status: "Done" },
    { id: "E-091", name: "Participation Report (PDF)", at: "2025-11-02 08:05", status: "Queued" },
    { id: "E-092", name: "Audit Logs (CSV)", at: "2025-11-02 09:40", status: "Processing" },
    { id: "E-093", name: "System Errors (JSON)", at: "2025-11-02 10:05", status: "Failed" },
  ]);

  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const triggerExport = (kind: string) => {
    const names = {
      departmental_csv: "Departmental Report (CSV)",
      participation_pdf: "Participation Report (PDF)",
      audit_csv: "Audit Logs (CSV)",
    };
    const newJob: ExportJob = {
      id: `E-${Date.now().toString().slice(-3)}`,
      name: names[kind as keyof typeof names] || "Unknown Export",
      at: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Queued",
    };
    setJobs([newJob, ...jobs]);
    showMessage(`Export job ${newJob.id} created and queued.`);
  };

  const retryExport = (id: string) => {
    setJobs(
      jobs.map((j) => (j.id === id ? { ...j, status: "Queued" as const } : j))
    );
    showMessage(`Job ${id} retry initiated.`);
  };

  const cancelExport = (id: string) => {
    setJobs(
      jobs.map((j) => (j.id === id ? { ...j, status: "Canceled" as const } : j))
    );
    showMessage(`Job ${id} canceled.`);
  };

  const downloadExport = (id: string) => {
    showMessage(`Downloading job ${id} (mock)...`);
  };

  const getStatusColor = (status: string) => {
    if (status === "Done") return "text-green-700 bg-green-50";
    if (status === "Queued") return "text-orange-700 bg-orange-50";
    if (status === "Processing") return "text-blue-700 bg-blue-50";
    if (status === "Failed" || status === "Timeout") return "text-red-700 bg-red-50";
    return "text-gray-700 bg-gray-50";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Exports & Reports</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          Recent exports and their statuses. You can trigger new exports for Departmental,
          Participation, and Audit reports.
        </p>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm animate-fadeIn">
          {message}
        </div>
      )}

      {/* Action Bar */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue mb-3">Create New Export</h2>
        <div className="flex flex-wrap gap-3">
          {hasRole(Role.PROGRAM_ADMIN) && (
            <button
              onClick={() => triggerExport("audit_csv")}
              className="px-4 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-sm font-medium text-dark-blue hover:bg-blue-50 transition"
            >
              Audit Logs (CSV)
            </button>
          )}

          {!hasRole(Role.PROGRAM_ADMIN) && (
            <div className="text-sm text-black/60">You do not have permission to create admin export jobs. Contact Program Admin.</div>
          )}
        </div>
      </section>

      {/* Export Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <h2 className="text-base font-semibold text-dark-blue mb-3">Export Jobs</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Job ID</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Name</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Requested at</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Status</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-soft-white-blue hover:bg-soft-white-blue">
                <td className="py-3 px-3 font-medium text-dark-blue">{job.id}</td>
                <td className="py-3 px-3 text-black/70">{job.name}</td>
                <td className="py-3 px-3 text-black/60">{job.at}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    {job.status === "Done" && (
                      <button
                        onClick={() => downloadExport(job.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Download
                      </button>
                    )}
                    {(job.status === "Failed" || job.status === "Timeout") && (
                      <button
                        onClick={() => retryExport(job.id)}
                        className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                      >
                        Retry
                      </button>
                    )}
                    {(job.status === "Queued" || job.status === "Processing") && (
                      <button
                        onClick={() => cancelExport(job.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}