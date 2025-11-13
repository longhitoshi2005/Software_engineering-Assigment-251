"use client";

import React, { useMemo, useState } from "react";
import ClientRoleGuard from "@/app/coord/ClientRoleGuard";
import { Role } from "@/app/lib/role";
import { FlaggedFeedback } from "./types";

const mockData: FlaggedFeedback[] = [
  {
    feedbackId: "F-1001",
    sessionId: "S-2001",
    status: "NEW",
    flagReason: "1-Star Rating",
    student: { id: "ST-01", name: "Alice Nguyen" },
    tutor: { id: "T-10", name: "Dr. Tran" },
    session: { course: "MATH101", sessionTime: "2025-11-13 14:00" },
    rating: 1,
    comment: "Tutor did not show up and did not communicate.",
  },
  {
    feedbackId: "F-1002",
    sessionId: "S-2002",
    status: "IN_PROGRESS",
    flagReason: "Keyword: 'absent'",
    student: { id: "ST-02", name: "Bao Le" },
    tutor: { id: "T-11", name: "Ms. Pham" },
    session: { course: "PHYS201", sessionTime: "2025-11-12 10:00" },
    rating: 2,
    comment: "Student was absent for half the session, tutor left early.",
  },
  {
    feedbackId: "F-1003",
    sessionId: "S-2003",
    status: "RESOLVED",
    flagReason: "1-Star Rating",
    student: { id: "ST-03", name: "Chi Vu" },
    tutor: { id: "T-12", name: "Mr. Hoang" },
    session: { course: "ENG102", sessionTime: "2025-11-11 09:00" },
    rating: 1,
    comment: "Very low quality; slides missing.",
  },
];

const statusOptions = ["ALL", "NEW", "IN_PROGRESS", "RESOLVED"] as const;

const CoordinatorInbox: React.FC = () => {
  const [items, setItems] = useState<FlaggedFeedback[]>(mockData);
  const [filter, setFilter] = useState<typeof statusOptions[number]>("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter !== "ALL" && it.status !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        it.student.name.toLowerCase().includes(q) ||
        it.tutor.name.toLowerCase().includes(q) ||
        it.session.course.toLowerCase().includes(q) ||
        it.comment.toLowerCase().includes(q)
      );
    });
  }, [items, filter, search]);

  const updateStatus = (id: string, status: FlaggedFeedback['status']) => {
    setItems((prev) => prev.map((p) => (p.feedbackId === id ? { ...p, status } : p)));
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.Coordinator]} title="Feedback Inbox">
      <div className="min-h-[calc(100vh-60px)] px-4 py-6 md:px-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback Inbox</h1>
          <p className="text-sm text-black/70 mt-1">Unresolved and new feedback items for Coordinators to triage.</p>
        </header>

        <section className="bg-white border border-soft-white-blue rounded-lg p-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-black/70">Filter:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-2 py-1 border rounded">
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex justify-end">
            <input placeholder="Search student, tutor, course, comment..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-xl px-3 py-1 border rounded" />
          </div>
        </section>

        <main className="space-y-4">
          {filtered.length === 0 && (
            <div className="bg-white border border-soft-white-blue rounded-lg p-4 text-sm text-black/60">No feedback matching the current filters.</div>
          )}

          {filtered.map((it) => (
            <article key={it.feedbackId} className="bg-white border border-soft-white-blue rounded-lg p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-dark-blue">{it.flagReason} — {it.session.course}</h2>
                    <span className="text-sm text-black/60">{it.session.sessionTime}</span>
                  </div>

                  <div className="mt-2 text-sm text-black/70">
                    <div><strong>Student:</strong> {it.student.name} ({it.student.id})</div>
                    <div><strong>Tutor:</strong> {it.tutor.name} ({it.tutor.id})</div>
                    <div className="mt-2"><strong>Comment:</strong></div>
                    <div className="whitespace-pre-wrap mt-1 text-sm text-black/80">{it.comment}</div>
                  </div>
                </div>

                <aside className="w-52 flex flex-col items-end gap-3">
                  <div className="text-sm text-black/60">Status: <span className="font-medium text-black">{it.status}</span></div>
                  <div className="flex flex-col w-full">
                    {it.status !== 'RESOLVED' && (
                      <button onClick={() => updateStatus(it.feedbackId, 'RESOLVED')} className="w-full px-3 py-1 rounded bg-green-600 text-white text-sm">Mark as Resolved</button>
                    )}
                    {it.status === 'NEW' && (
                      <button onClick={() => updateStatus(it.feedbackId, 'IN_PROGRESS')} className="w-full mt-2 px-3 py-1 rounded bg-yellow-500 text-white text-sm">Start Progress</button>
                    )}
                    <button onClick={() => updateStatus(it.feedbackId, 'NEW')} className="w-full mt-2 px-3 py-1 rounded bg-white border text-sm">Reset to NEW</button>
                    <button onClick={() => { navigator.clipboard?.writeText(it.session.sessionTime); alert('Session time copied'); }} className="w-full mt-2 px-3 py-1 rounded bg-white border text-sm">Copy Session Time</button>
                  </div>
                </aside>
              </div>
            </article>
          ))}
        </main>
      </div>
    </ClientRoleGuard>
  );
};

export default CoordinatorInbox;
