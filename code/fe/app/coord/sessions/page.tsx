"use client";

import React, { useMemo, useState } from "react";

type Session = { id: string; student: string; tutor: string; course: string; startTime: string; status: string; issueFlag?: string | null };

const mock: Session[] = [
  { id: "S-1001", student: "Nguyen M.Q.", tutor: "Nguyen T.A.", course: "CO1001", startTime: "2025-11-02T14:00:00Z", status: "SCHEDULED", issueFlag: null },
  { id: "S-1002", student: "Tran T.H.", tutor: "Pham Q.T.", course: "MA1001", startTime: "2025-11-01T09:00:00Z", status: "CANCELLED", issueFlag: "late cancellation" },
  { id: "S-1003", student: "Le V.D.", tutor: "Truong Q.T.", course: "EE2002", startTime: "2025-11-01T11:00:00Z", status: "COMPLETED", issueFlag: "missing feedback" },
];

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(mock);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filtered = useMemo(() => sessions.filter((s) => statusFilter === "ALL" || s.status === statusFilter), [sessions, statusFilter]);

  const markResolved = (id: string) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, issueFlag: null } : s)));
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">Coordinator — Sessions</h1>
        <p className="text-sm text-black/70 mt-1">View and monitor sessions for reschedules, late cancellations, or missing logs (FR-SCH.03).</p>
      </header>

      <main className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-black/60">{filtered.length} sessions</div>
          <div className="flex gap-2">
            <select className="px-3 py-1 rounded-md border border-black/10 bg-white text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-black/5 p-4 space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="flex justify-between items-start gap-4 border-b last:border-b-0 pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-dark-blue">{s.student} · {s.id}</h3>
                  <span className="text-xs text-black/50">{new Date(s.startTime).toLocaleString()}</span>
                </div>
                <p className="text-xs text-black/70">Tutor: {s.tutor} · Course: {s.course}</p>
                {s.issueFlag && <p className="text-xs text-red-600 mt-1">Issue: {s.issueFlag}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <button className="px-3 py-1 rounded-md bg-white border border-black/10 text-dark-blue text-sm">View details</button>
                {s.issueFlag ? (
                  <button onClick={() => markResolved(s.id)} className="px-3 py-1 rounded-md bg-emerald-600 text-white text-sm">Mark resolved</button>
                ) : (
                  <button className="px-3 py-1 rounded-md bg-white border border-black/10 text-dark-blue text-sm">No action</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Sessions;