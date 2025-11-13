"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CONFLICTS } from '@/app/lib/mocks';

type SessionRequest = {
  id: string;
  studentName: string;
  course: string;
  preferredSlot: string;
  status: string;
};

type Conflict = {
  id: string;
  type: "SLOT_CONFLICT";
  slot: string;
  details: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  requests: SessionRequest[];
};

const CoordConflicts: React.FC = () => {
  const router = useRouter();

  // Use centralized conflicts mock (cast to local Conflict shape). Provide fallback to [] during SSR.
  const conflicts = useMemo(
    () => ((typeof CONFLICTS !== "undefined" && Array.isArray(CONFLICTS) ? (CONFLICTS as unknown as Conflict[]) : []) as Conflict[]),
    []
  );

  const severityColor = (s: Conflict["severity"]) => {
    switch (s) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const resolveConflict = (reqId: string) => {
    // Navigate to manual match page
    router.push(`/coord/manual-match?req=${reqId}`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Overbook / Conflicts
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-3xl">
          Detects schedule conflicts from tutor availability, student booking limits, and room usage.
          Coordinator can resolve or reassign. (FR-SCH.03 / FR-SCH.04)
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-4">
        {/* filters */}
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
            All
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
            Tutor overbook
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
            Student quota
          </button>
          <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
            Room conflicts
          </button>
        </div>

        {/* list */}
        <div className="space-y-3">
          {conflicts.length === 0 ? (
            <p className="text-sm text-black/40 italic">
              No active conflicts 🎉
            </p>
          ) : (
            conflicts.map((cf) => (
              <article
                key={cf.id}
                className="bg-white rounded-lg border border-black/5 p-4 flex flex-col md:flex-row md:justify-between gap-3"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2 items-center flex-wrap">
                    <h2 className="text-sm font-semibold text-dark-blue">
                      Scheduling conflict
                    </h2>
                    <span
                      className={`text-[0.6rem] px-2 py-0.5 rounded-full border ${severityColor(
                        cf.severity
                      )}`}
                    >
                      {cf.severity}
                    </span>
                  </div>
                  <p className="text-xs text-black/60">
                    Slot / resource: <b>{cf.slot}</b>
                  </p>
                  <p className="text-xs text-black/50 bg-soft-white-blue/60 rounded-md p-2">
                    {cf.details}
                  </p>
                  <div className="mt-2 space-y-1">
                    {(cf.requests ?? []).map((r) => (
                      <div key={r.id} className="text-xs text-black/70 flex gap-2 justify-between items-center border-t border-black/5 pt-1">
                        <span>{r.id} · {r.studentName} · {r.course} · Status: {r.status}</span>
                        <button
                          onClick={() => resolveConflict(r.id)}
                          className="text-[0.65rem] text-light-heavy-blue hover:underline"
                        >
                          Resolve →
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[0.6rem] text-black/40">
                    Auto-detected from session store by same course + slot
                  </p>
                </div>
              </article>
            ))
          )}
        </div>

        <p className="text-center text-[0.65rem] text-black/35 mt-6">
          FR-SCH.03 Reschedule / Cancel rules · FR-MAT.* escalation to coordinator
        </p>
      </main>
    </div>
  );
};

export default CoordConflicts;