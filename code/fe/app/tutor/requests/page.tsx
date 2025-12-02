"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ADDED: for Back button

type BookingRequest = {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  topic?: string;
  scheduleText: string; // "Wed · 14:00 – 15:30 · B4-205 / Online"
  mode: "Online" | "Offline" | "Hybrid";
  note?: string;
  createdAgo: string; // "15 min ago"
  status?: "NEW" | "PENDING" | "APPROVED" | "REJECTED";
  conflict?: string;
};

type UpcomingSession = {
  id: string;
  studentName: string;
  course: string;
  time: string;
  location: string;
};

type DecisionLog = {
  id: string;
  action: "approved" | "rejected" | "forwarded"; // ADDED: 'forwarded'
  studentName: string;
  course: string;
  time: string;
  reason?: string;
};

export default function TutorRequestsPage() {
  const router = useRouter(); // ADDED: useRouter instance

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock pending requests
  const [pending, setPending] = useState<BookingRequest[]>([
    {
      id: "REQ-001",
      studentName: "Nguyen M. Q. Khanh",
      studentId: "2352525",
      course: "CO1001 · Programming Fundamentals",
      topic: "Recursion and pointers",
      scheduleText: "Wed · 14:00 – 15:30 · B4-205 / Online",
      mode: "Hybrid",
      note: "Need help with Lab 03",
      createdAgo: "15 min ago",
      status: "NEW",
    },
    {
      id: "REQ-002",
      studentName: "Tran H. Minh",
      studentId: "2353001",
      course: "MA1001 · Calculus I",
      topic: "Derivative problems",
      scheduleText: "Thu · 09:00 – 10:30 · Online only",
      mode: "Online",
      note: "Midterm preparation",
      createdAgo: "1 hour ago",
      status: "PENDING",
    },
  ]);

  // mock upcoming (những cái tutor đã accept)
  const [upcoming] = useState<UpcomingSession[]>([
    {
      id: "UP-1",
      studentName: "Pham Q. T.",
      course: "EE2002 · Digital Systems",
      time: "Today · 15:30 – 16:30",
      location: "Online (Meet)",
    },
    {
      id: "UP-2",
      studentName: "Le N. H.",
      course: "CO2003 · Data Structures",
      time: "Tomorrow · 09:00 – 10:30",
      location: "B4-205",
    },
  ]);

  // mock decisions
  const [decisions, setDecisions] = useState<DecisionLog[]>([
    {
      id: "LOG-1",
      action: "approved",
      studentName: "Vu T. Q.",
      course: "MA1001 · Calculus I",
      time: "Today · 08:25",
    },
    {
      id: "LOG-2",
      action: "rejected",
      studentName: "Student (anonymous)",
      course: "Unmatched subject",
      time: "Today · 08:10",
      reason: "Not teaching this course / time conflict",
    },
  ]);

  // ==== ADDED: lightweight toast (no navigation) ====
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "danger" | "warning";
  }>({ show: false, message: "", variant: "success" });

  const showToast = (message: string, variant: "success" | "danger" | "warning" = "success") => {
    setToast({ show: true, message, variant });
  };

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast((s) => ({ ...s, show: false })), 2200);
    return () => clearTimeout(t);
  }, [toast.show]);
  // ==== END ADDED ====

  const handleApprove = (req: BookingRequest) => {
    setPending((prev) => prev.filter((r) => r.id !== req.id));
    setDecisions((prev) => [
      {
        id: `LOG-${Date.now()}`, // created on click → safe for hydration
        action: "approved",
        studentName: req.studentName,
        course: req.course,
        time: "Just now",
      },
      ...prev,
    ]);
    showToast(`Approved booking for ${req.studentName}`, "success"); // ADDED
  };

  const handleReject = (req: BookingRequest) => {
    setPending((prev) => prev.filter((r) => r.id !== req.id));
    setDecisions((prev) => [
      {
        id: `LOG-${Date.now()}`,
        action: "rejected",
        studentName: req.studentName,
        course: req.course,
        time: "Just now",
        reason: "Tutor rejected from UI",
      },
      ...prev,
    ]);
    showToast(`Rejected request from ${req.studentName}`, "danger"); // ADDED
  };

  const handleForward = (req: BookingRequest) => {
    setPending((prev) => prev.filter((r) => r.id !== req.id));
    setDecisions((prev) => [
      {
        id: `LOG-${Date.now()}`,
        action: "forwarded", // ADDED: tách riêng 'forwarded' để log đúng nghĩa
        studentName: req.studentName,
        course: req.course,
        time: "Just now",
        reason: "Forwarded to coordinator",
      },
      ...prev,
    ]);
    showToast(`Sent ${req.studentName}'s request to coordinator`, "warning"); // ADDED
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-8">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Incoming Session Requests
          </h1>
          <p className="text-sm text-black/70 mt-1 max-w-2xl">
            Approve or reject booking requests sent by students. Approved slots will appear on your schedule and in the student dashboard.
          </p>
        </div>

        {/* ADDED: Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="shrink-0 rounded-md border border-black/10 px-3 py-1.5 text-sm text-dark-blue hover:bg-soft-white-blue transition"
          title="Go back"
        >
          ← Back
        </button>
        {/* END ADDED */}
      </header>

      {/* main */}
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: PENDING LIST */}
          <section className="lg:col-span-2 bg-white rounded-lg border border-black/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-dark-blue">
                Pending approvals
              </h2>
              <span className="inline-flex items-center gap-2 text-[0.65rem] bg-soft-white-blue px-3 py-1 rounded-full text-dark-blue font-medium">
                {pending.length} pending
                <span className="w-2 h-2 rounded-full bg-light-heavy-blue inline-block" />
              </span>
            </div>

            {pending.length === 0 ? (
              <p className="text-sm text-black/40 italic">
                No pending requests right now.
              </p>
            ) : (
              <div className="space-y-3">
                {pending.map((req) => {
                  const isExpanded = expandedId === req.id;
                  return (
                    <article
                      key={req.id}
                      className="border border-black/5 rounded-lg bg-soft-white-blue/50 p-3"
                    >
                      {/* top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-dark-blue">
                            {req.studentName} · {req.studentId}
                          </p>
                          <p className="text-[0.7rem] text-black/50">
                            {req.createdAgo}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="text-[0.6rem]  text-white bg-light-blue px-3 py-1 rounded-full">
                            {req.mode}
                          </span>
                          {/* trạng thái nhỏ */}
                          {req.status && (
                            <span className="text-[0.55rem] bg-white text-dark-blue/70 border border-black/5 px-2 py-0.5 rounded-full uppercase">
                              {req.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* basic info */}
                      <div className="mt-2 text-[0.75rem] text-black">
                        <p className="font-medium text-dark-blue/90">
                          {req.course}
                        </p>
                        <p className="text-black/60">{req.scheduleText}</p>
                      </div>

                      {/* expand */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          {req.topic && (
                            <p className="text-[0.7rem] text-black/75 bg-white border border-black/5 rounded-md px-2 py-1">
                              <span className="font-semibold text-dark-blue">
                                Goal:
                              </span>{" "}
                              {req.topic}
                            </p>
                          )}

                          {req.note && (
                            <p className="text-[0.7rem] text-black/50">
                              Student note: &ldquo;{req.note}&rdquo;
                            </p>
                          )}

                          {req.conflict && (
                            <p className="text-[0.65rem] text-red-500 bg-red-50 border border-red-100 rounded-md px-2 py-1">
                              ⚠ {req.conflict}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <button type="button" className="text-[0.65rem] text-light-heavy-blue hover:underline">
                              View student profile
                            </button>
                            <button type="button" className="text-[0.65rem] text-light-heavy-blue hover:underline">
                              View previous sessions
                            </button>
                          </div>
                        </div>
                      )}

                      {/* actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button" // ensure no form submit
                          onClick={() => handleApprove(req)}
                          className="bg-light-heavy-blue hover:bg-light-blue text-white text-xs font-semibold px-3 py-1.5 rounded-md transition"
                        >
                          Approve booking
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          className="bg-white border border-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-red-50 transition"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => handleForward(req)}
                          className="bg-white border border-amber-200 text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-amber-50 transition"
                        >
                          Send to coordinator
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleExpand(req.id)}
                          className="bg-white border border-black/10 text-dark-blue text-xs font-medium px-3 py-1.5 rounded-md hover:bg-soft-white-blue"
                        >
                          {isExpanded ? "Hide details" : "View details"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* upcoming */}
            <section className="bg-white rounded-lg border border-black/5 p-4">
              <h2 className="text-sm font-semibold text-dark-blue mb-3">
                Today / Upcoming
              </h2>
              <div className="space-y-2">
                {upcoming.map((sess) => (
                  <div
                    key={sess.id}
                    className="border border-black/5 rounded-md px-3 py-2 bg-soft-white-blue/40"
                  >
                    <p className="text-xs font-semibold text-dark-blue">
                      {sess.time}
                    </p>
                    <p className="text-xs text-black/75">
                      {sess.studentName} – {sess.course}
                    </p>
                    <p className="text-[0.6rem] text-black/40 mt-1">
                      {sess.location}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* decisions log */}
            <section className="bg-white rounded-lg border border-black/5 p-4">
              <h2 className="text-sm font-semibold text-dark-blue mb-3">
                Recent decisions
              </h2>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {decisions.map((log) => (
                  <div
                    key={log.id}
                    className="border border-black/5 rounded-md px-3 py-2 flex items-start gap-2"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-1 ${
                        log.action === "approved"
                          ? "bg-emerald-500"
                          : log.action === "rejected"
                          ? "bg-red-500"
                          : "bg-amber-500" // forwarded
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-[0.7rem] text-black">
                        {log.action === "approved"
                          ? "Approved"
                          : log.action === "rejected"
                          ? "Rejected"
                          : "Forwarded to coordinator"}{" "}
                        <span className="font-semibold">{log.studentName}</span>{" "}
                        for {log.course}
                      </p>
                      <p className="text-[0.6rem] text-black/40">{log.time}</p>
                      {log.reason && (
                        <p className="text-[0.6rem] text-black/50 mt-0.5">
                          {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* footer mini */}
        <p className="text-center text-[0.65rem] text-black/35">
          FR-SCH.02 Tutor confirmation · FR-SCH.03 Reschedule/Cancel rules · Linked to student dashboard
        </p>
      </div>

      {/* ==== ADDED: Toast UI (no navigation) ==== */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`px-4 py-3 rounded-md shadow-lg text-sm text-white ${
              toast.variant === "success"
                ? "bg-emerald-600"
                : toast.variant === "danger"
                ? "bg-red-600"
                : "bg-amber-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      {/* ==== END ADDED ==== */}
    </div>
  );
}
