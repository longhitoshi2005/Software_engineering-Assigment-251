"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CONFLICTS, type Conflict, type ConflictRequest } from '@/src/lib/mocks';

const CoordConflicts: React.FC = () => {
  const router = useRouter();
  // Use centralized conflicts mock with proper typing
  const conflicts = useMemo<Conflict[]>(() => CONFLICTS, []);

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

  const resolveConflict = (request: ConflictRequest, conflict: Conflict) => {
    // Navigate to manual match page with studentId and the conflicted tutor id
    const studentId = request.studentId ?? "";
    const conflictedTutorId = conflict.tutor ? conflict.tutor.id : "";

    router.push(
      `/coord/manual-match?studentId=${encodeURIComponent(studentId)}&suggestedTutorId=${encodeURIComponent(conflictedTutorId)}`
    );
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
              /* New, clearer article structure */
              <article key={cf.id} className="bg-white rounded-lg border border-black/5 p-4">

                {/* Card Header */}
                <div className="flex gap-3 items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <h2 className="text-base font-semibold text-dark-blue">
                      {cf.type === 'TUTOR_DOUBLE_BOOKING' ? 'Tutor Double Booking' : 'Room Conflict'}
                    </h2>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-medium ${severityColor(
                        cf.severity
                      )}`}
                    >
                      {cf.severity}
                    </span>
                  </div>
                  <p className="text-xs text-black/40">ID: {cf.id}</p>
                </div>

                {/* Conflicted Resource Details */}
                <div className="grid grid-cols-2 gap-4 bg-soft-white-blue/60 p-3 rounded-md my-3">
                  <div>
                    <p className="text-xs font-semibold text-black/60">Conflicted Tutor</p>
                    <p className="text-sm font-medium text-dark-blue">{cf.tutor?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-black/60">Resource / Slot</p>
                    <p className="text-sm font-medium text-dark-blue">{cf.slot}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-black/60">Details</p>
                    <p className="text-sm text-black/70">{cf.details}</p>
                  </div>
                </div>

                {/* Affected Students List */}
                <div>
                  <h3 className="text-sm font-semibold text-dark-blue mb-2">Affected Requests</h3>
                  <ul className="space-y-2">
                    {(cf.requests ?? []).map((r: ConflictRequest) => (
                      <li
                        key={r.id}
                        className="flex gap-2 justify-between items-center border-b border-black/5 pb-2 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm text-black/80 font-medium">{r.studentName} ({r.studentId})</p>
                          <p className="text-xs text-black/60">Request ID: {r.id} · Course: {r.course} · Status: {r.status}</p>
                        </div>
                        <button
                          onClick={() => resolveConflict(r, cf)}
                          className="text-sm font-medium text-light-heavy-blue hover:underline whitespace-nowrap border rounded-lg p-1"
                        >
                          Resolve →
                        </button>
                      </li>
                    ))}
                  </ul>
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