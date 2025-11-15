"use client";

import React, { useState, useEffect } from "react";
import { hasRole, Role } from '@/src/lib/role';
import { useRouter } from "next/navigation";
// ExportControl is defined below to avoid calling hasRole during SSR/hydration

type StudentSupportReq = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  preferredTime: string;
  note?: string;
  status: "NEW" | "ROUTED" | "REJECTED";
  reasonAI?: string;
};

const mock_studentRequests: StudentSupportReq[] = [
    {
      id: "SR-2025-11-02-001",
      studentId: "2352525",
      studentName: "Nguyen M. Q. Khanh",
      course: "CO1001 – Programming Fundamentals",
      preferredTime: "Wed 14:00 – 16:00",
      note: "Muốn cùng tutor debug lab 03, cần person CS",
      status: "NEW",
      reasonAI: "AI could not find tutor with same time slot",
    },
    {
      id: "SR-2025-11-02-002",
      studentId: "2352444",
      studentName: "Tran T. H. An",
      course: "MA1001 – Calculus I",
      preferredTime: "Thu 09:00 – 10:00",
      note: "Ôn trước midterm, cần nữ tutor",
      status: "NEW",
      reasonAI: "AI match filtered out due to gender preference",
    },
    {
      id: "SR-2025-11-01-015",
      studentId: "2310001",
      studentName: "Le V. Dung",
      course: "EE2002 – Digital Systems",
      preferredTime: "Fri 16:30 – 17:30",
      status: "ROUTED",
      reasonAI: "Already sent to /coord/pending-assign",
    },
  ]

const CoordStudentRequests: React.FC = () => {
  const router = useRouter();
  const [reqs, setReqs] = useState<StudentSupportReq[]>(mock_studentRequests);

  const routeToAssign = (req: StudentSupportReq) => {
    // mock: xóa tại đây, rồi điều hướng sang pending-assign để giả vờ đang xử lý
    setReqs((prev) =>
      prev.map((r) =>
        r.id === req.id ? { ...r, status: "ROUTED" } : r
      )
    );
    router.push(`/coord/pending-assign?from=student&sid=${req.studentId}`);
  };

  const rejectReq = (id: string) => {
    setReqs((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
  };

  const statusBadge = (s: StudentSupportReq["status"]) => {
    switch (s) {
      case "NEW":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "ROUTED":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border border-red-200";
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Student Requests (Escalated)
        </h1>
        <p className="text-sm text-black/70 mt-1">
          Students who could not get a tutor automatically (no slot, special preference,
          at-risk flagged) will appear here for the coordinator to handle. (FR-MAT.02 + FR-RPT.01)
        </p>
      </header>

      <main className="max-w-6xl mx-auto space-y-4">
        {/* info bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-black/60">
            {reqs.filter((r) => r.status === "NEW").length} new request(s)
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
              Filter
            </button>
            {/* Avoid calling hasRole during SSR/hydration. Check role after mount to keep server and initial client markup identical. */}
            <ExportControl />
          </div>
        </div>

        {/* list */}
        <div className="space-y-3">
          {reqs.map((r) => (
            <article
              key={r.id}
              className="bg-white rounded-lg border border-black/5 p-4 flex flex-col md:flex-row md:items-start md:justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex gap-2 items-center flex-wrap">
                  <h2 className="text-sm font-semibold text-dark-blue">
                    {r.studentName} · {r.studentId}
                  </h2>
                  <span
                    className={`text-[0.6rem] px-2 py-0.5 rounded-full ${statusBadge(
                      r.status
                    )}`}
                  >
                    {r.status === "NEW"
                      ? "Needs action"
                      : r.status === "ROUTED"
                      ? "Sent to pending-assign"
                      : "Rejected"}
                  </span>
                  <span className="text-[0.6rem] text-black/40">
                    {r.id}
                  </span>
                </div>
                <p className="text-sm text-black/70">
                  Course: <span className="font-medium">{r.course}</span>
                </p>
                <p className="text-xs text-black/60">
                  Preferred time: {r.preferredTime}
                </p>
                {r.note && (
                  <p className="text-xs text-black/60 bg-soft-white-blue/50 rounded-md p-2">
                    Student note: &ldquo;{r.note}&rdquo;
                  </p>
                )}
                {r.reasonAI && (
                  <p className="text-[0.6rem] text-black/40">
                    Reason from AI/matching: {r.reasonAI}
                  </p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap md:flex-col">
                <button
                  onClick={() => routeToAssign(r)}
                  disabled={r.status !== "NEW"}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${
                    r.status === "NEW"
                      ? "bg-light-heavy-blue hover:bg-light-blue text-white"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Send to pending assign
                </button>
                <button
                  onClick={() => rejectReq(r.id)}
                  disabled={r.status !== "NEW"}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md ${
                    r.status === "NEW"
                      ? "bg-white border border-red-200 text-red-600 hover:bg-red-50"
                      : "bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                  }`}
                >
                  Reject
                </button>
                <button className="text-xs font-medium px-3 py-1.5 rounded-md bg-white border border-black/10 text-dark-blue hover:bg-soft-white-blue">
                  View student profile
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="text-center text-[0.65rem] text-black/35 mt-6">
          FR-MAT.02 Escalation to coordinator · FR-MAT.04 Manual pairing · Audit enabled
        </p>
      </main>
    </div>
  );
};

export default CoordStudentRequests;

function ExportControl() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render same placeholder text as server to avoid hydration mismatch
    return <div className="text-sm text-black/60">Exporting student requests is restricted to Coordinators or Program Admins.</div>;
  }

  const canExport = hasRole(Role.COORDINATOR, Role.PROGRAM_ADMIN);

  return canExport ? (
    <button className="px-3 py-1.5 rounded-md bg-white text-dark-blue text-xs font-medium border border-black/10 hover:bg-soft-white-blue">
      Export
    </button>
  ) : (
    <div className="text-sm text-black/60">Exporting student requests is restricted to Coordinators or Program Admins.</div>
  );
}