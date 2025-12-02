"use client";

import React, { useState } from "react";
import { TUTORS } from "@/lib/mocks";

type TutorAvail = {
  id: string;
  name: string;
  faculty: string;
  subjects: string[];
  status: "OK" | "MISSING" | "NEAR_FULL";
  nextSlots: string[];
  currentLoad: string; // "3/6", "5/5"
};

const CoordTutorsAvailability: React.FC = () => {
  const [facultyFilter, setFacultyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Map shared TUTORS mock into coordinator view shape
  const tutors: TutorAvail[] = TUTORS.map((t) => ({
    id: `tut-${String(t.id).padStart(3, "0")}`,
    name: t.fullName || t.name || "—",
    faculty: t.faculty?.split(" ")[0] ?? (t.faculty as any) ?? "—",
    subjects: [t.subject ?? "—"],
    status: t.status === "Available" ? "OK" : t.status ? "NEAR_FULL" : "MISSING",
    nextSlots: (t.slots ?? []).map((s) => `${s.time} (${s.mode})`),
    currentLoad: t.sessionsCompleted ? `${t.sessionsCompleted}/6` : "—",
  }));

  const filtered = tutors.filter((t) => {
    if (facultyFilter !== "ALL" && t.faculty !== facultyFilter) return false;
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    return true;
  });

  const statusBadge = (s: TutorAvail["status"]) => {
    switch (s) {
      case "OK":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "NEAR_FULL":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "MISSING":
        return "bg-red-100 text-red-700 border border-red-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Tutor Availability Monitor
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-3xl">
          See which tutors have published availability (FR-SCH.01), who is almost full,
          and who still needs to declare slots. Useful for manual assignment / conflict resolution.
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-4">
        {/* filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <label className="text-xs text-black/60">Faculty</label>
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="text-sm bg-white border border-black/10 rounded-md px-3 py-1.5"
          >
            <option value="ALL">All</option>
            <option value="CSE">CSE</option>
            <option value="Math">Math</option>
            <option value="EE">EE</option>
          </select>

          <label className="text-xs text-black/60">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm bg-white border border-black/10 rounded-md px-3 py-1.5"
          >
            <option value="ALL">All</option>
            <option value="OK">OK</option>
            <option value="NEAR_FULL">Near full</option>
            <option value="MISSING">Missing availability</option>
          </select>

          <div className="ml-auto text-xs text-black/50">
            {filtered.length} tutor(s) found
          </div>
        </div>

        {/* list */}
        <div className="bg-white rounded-lg border border-black/5">
          <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-black/5 text-[0.65rem] text-black/50">
            <div className="col-span-3">Tutor</div>
            <div className="col-span-2">Faculty</div>
            <div className="col-span-2">Subjects</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Next slots</div>
            <div className="col-span-1 text-right">Load</div>
          </div>

          {filtered.map((t) => (
            <div
              key={t.id}
              className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-black/5 last:border-b-0 items-center"
            >
              <div className="col-span-3">
                <p className="text-sm font-semibold text-dark-blue">{t.name}</p>
                <p className="text-[0.65rem] text-black/40">{t.id}</p>
              </div>
              <div className="col-span-2 text-sm text-black/70">{t.faculty}</div>
              <div className="col-span-2 text-xs text-black/70">
                {t.subjects.join(", ")}
              </div>
              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.65rem] ${statusBadge(
                    t.status
                  )}`}
                >
                  {t.status === "MISSING"
                    ? "No availability"
                    : t.status === "NEAR_FULL"
                    ? "Almost full"
                    : "OK"}
                </span>
              </div>
              <div className="col-span-2 text-xs text-black/70 space-y-1">
                {t.nextSlots.length === 0 ? (
                  <span className="text-black/30 italic">—</span>
                ) : (
                  t.nextSlots.map((slt) => <p key={slt}>{slt}</p>)
                )}
              </div>
              <div className="col-span-1 text-right text-xs text-black/60">
                {t.currentLoad}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[0.65rem] text-black/35 mt-4">
          FR-SCH.01 Tutor declares slot · FR-MAT.03 Coordinator can nudge tutors who don&apos;t publish
        </p>
      </main>
    </div>
  );
};

export default CoordTutorsAvailability;