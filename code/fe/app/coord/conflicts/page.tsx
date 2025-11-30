"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Conflict, ConflictRequest } from "@/lib/mocks"; // hoặc tự define type bên dưới

export default function CoordConflicts() {
  const router = useRouter();

  // Local state
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------------
      FETCH CONFLICTS FROM BACKEND
  --------------------------------*/
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/conflicts");
        const data = await res.json();
        setConflicts(data.conflicts || []);
      } catch (err) {
        console.error("Failed to fetch conflicts:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* -------------------------------
      COLOR FOR SEVERITY
  --------------------------------*/
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

  /* -------------------------------
      RESOLVE A CONFLICT (BACKEND)
  --------------------------------*/
  const resolveConflict = async (
    request: ConflictRequest,
    conflict: Conflict
  ) => {
    try {
      // 1. Call backend to resolve
      await fetch("/api/conflicts", {
        method: "POST",
        body: JSON.stringify({ conflictId: conflict.id }),
      });

      // 2. Redirect to manual-match
      const studentId = request.studentId ?? "";
      const tutorId = conflict.tutor?.id ?? "";

      router.push(
        `/coord/manual-match?studentId=${encodeURIComponent(
          studentId
        )}&suggestedTutorId=${encodeURIComponent(tutorId)}`
      );
    } catch (err) {
      console.error("Failed to resolve conflict:", err);
    }
  };

  /* -------------------------------
      PAGE UI
  --------------------------------*/
  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Overbook / Conflicts
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-3xl">
          Detects schedule conflicts from tutor availability, overbooked tutors,
          room collisions, and student booking limit issues.
          Coordinator can resolve or reassign. (FR-SCH.03 / FR-SCH.04)
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-4">

        {/* Loading State */}
        {loading && (
          <p className="text-sm text-black/50 italic">Loading conflicts…</p>
        )}

        {/* Filters (UI only — no logic yet) */}
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

        {/* Conflict List */}
        <div className="space-y-3">
          {!loading && conflicts.length === 0 ? (
            <p className="text-sm text-black/40 italic">
              No active conflicts 🎉
            </p>
          ) : (
            conflicts.map((cf) => (
              <article
                key={cf.id}
                className="bg-white rounded-lg border border-black/5 p-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3 items-center">
                    <h2 className="text-base font-semibold text-dark-blue">
                      {cf.type === "TUTOR_DOUBLE_BOOKING"
                        ? "Tutor Double Booking"
                        : cf.type === "ROOM_CONFLICT"
                        ? "Room Conflict"
                        : "Conflict"}
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

                {/* Conflict Details */}
                <div className="grid grid-cols-2 gap-4 bg-soft-white-blue/60 p-3 rounded-md my-3">
                  <div>
                    <p className="text-xs font-semibold text-black/60">
                      Conflicted Tutor
                    </p>
                    <p className="text-sm font-medium text-dark-blue">
                      {cf.tutor?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-black/60">
                      Slot
                    </p>
                    <p className="text-sm font-medium text-dark-blue">
                      {cf.slot}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-black/60">
                      Details
                    </p>
                    <p className="text-sm text-black/70">{cf.details}</p>
                  </div>
                </div>

                {/* Affected Requests */}
                <div>
                  <h3 className="text-sm font-semibold text-dark-blue mb-2">
                    Affected Requests
                  </h3>

                  <ul className="space-y-2">
                    {(cf.requests ?? []).map((r) => (
                      <li
                        key={r.id}
                        className="flex justify-between items-center border-b border-black/5 pb-2 last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-black/80">
                            {r.studentName} ({r.studentId})
                          </p>
                          <p className="text-xs text-black/60">
                            Request ID: {r.id} · Course: {r.course} · Status:{" "}
                            {r.status}
                          </p>
                        </div>

                        <button
                          onClick={() => resolveConflict(r, cf)}
                          className="text-sm font-medium text-light-heavy-blue underline hover:text-[#004a8a] whitespace-nowrap"
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
          FR-SCH.03 Scheduling Rules · FR-MAT.01 Matching · Coordinator Conflict Resolution
        </p>
      </main>
    </div>
  );
}

/* -------------------------------
    OPTIONAL — DEFINE TYPES HERE
--------------------------------*/


