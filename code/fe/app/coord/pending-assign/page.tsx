"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { hasRole, Role } from '@/app/lib/role';
import { PENDING_ASSIGN_ITEMS } from '@/app/lib/mocks';

type PendingMatch = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  suggestedTutor: string;
  reason: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  createdAgo: string;
  source: "AI" | "StudentRequest" | "System" | "Tutor";
  preferredSlot?: string;
};

const CoordPendingAssign: React.FC = () => {
  const router = useRouter();

  const [items, setItems] = useState<PendingMatch[]>(PENDING_ASSIGN_ITEMS);

  const handleApprove = (id: string) => {
    // Update status
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleReassign = (pm: PendingMatch) => {
    // Navigate to manual match page with request ID
    router.push(`/coord/manual-match?req=${pm.id}`);
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const badgeColor = (p: PendingMatch["priority"]) => {
    switch (p) {
      case "HIGH":
        return "bg-red-100 text-red-600 border-red-200";
      case "NORMAL":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* header */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Pending Tutor Assignments
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-3xl">
          Requests that could not be auto-approved (AI match / student request /
          system escalation). Coordinator needs to pick or confirm a tutor. (FR-MAT.02 · FR-MAT.04)
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-4">
        {/* info bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-black/60">
            {items.length} assignment(s) waiting for action.
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
              Filter: All
            </button>
            {hasRole(Role.Coordinator,Role.ProgramAdmin) ? (
              <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
                Export
              </button>
            ) : (<></> )}
          </div>
        </div>

        {/* list */}
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-black/40 italic">
              Nothing to assign right now.
            </p>
          ) : (
            items.map((it) => (
              <article
                key={it.id}
                className="bg-white rounded-lg border border-black/5 p-4 flex flex-col gap-3 md:flex-row md:justify-between md:items-start"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-dark-blue">
                      {it.studentName} · {it.studentId}
                    </h2>
                    <span
                      className={`text-[0.6rem] px-2 py-0.5 rounded-full border ${badgeColor(
                        it.priority
                      )}`}
                    >
                      {it.priority} priority
                    </span>
                    <span className="text-[0.6rem] text-black/40">
                      {it.createdAgo}
                    </span>
                  </div>
                  <p className="text-sm text-black/75">
                    Requested course:{" "}
                    <span className="font-medium">{it.course}</span>
                  </p>
                  <p className="text-xs text-black/70">
                    Suggested tutor:{" "}
                    <span className="font-semibold text-dark-blue">
                      {it.suggestedTutor}
                    </span>
                  </p>
                  <p className="text-xs text-black/50 bg-soft-white-blue/60 rounded-md p-2">
                    Reason: {it.reason}
                  </p>
                  <p className="text-[0.6rem] text-black/40">
                    Source: {it.source} · Logged to audit
                  </p>
                </div>

                {/* actions */}
                <div className="flex gap-2 flex-wrap md:flex-col">
                  <button
                    onClick={() => handleApprove(it.id)}
                    className="bg-light-heavy-blue hover:bg-light-blue text-white text-xs font-semibold px-3 py-1.5 rounded-md transition"
                  >
                    Approve & Assign
                  </button>
                  <button
                    onClick={() => handleReassign(it)}
                    className="bg-white border border-black/10 text-dark-blue text-xs font-medium px-3 py-1.5 rounded-md hover:bg-soft-white-blue"
                  >
                    Reassign tutor
                  </button>
                  <button
                    onClick={() => handleReject(it.id)}
                    className="bg-white border border-red-200 text-red-600 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <p className="text-center text-[0.65rem] text-black/35 mt-6">
          FR-MAT.02 Auto → human review · FR-MAT.04 Manual override logged · Linked with student
          request pool
        </p>
      </main>
    </div>
  );
};

export default CoordPendingAssign;