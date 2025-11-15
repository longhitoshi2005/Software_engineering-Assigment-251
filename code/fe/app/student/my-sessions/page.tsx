"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { swalConfirm, swalSuccess, swalError } from "@/src/lib/swal";
import { MY_UPCOMING_SESSIONS, MY_COMPLETED_SESSIONS } from "@/src/lib/mocks";

type SessionStatus =
  | "CONFIRMED"
  | "PENDING"
  | "NEEDS_FEEDBACK"
  | "FEEDBACK_SKIPPED";

type Session = {
  id: string;
  datetime: string;
  tutorName: string;
  course: string;
  mode: string;
  status: SessionStatus;
  note?: string;
  focus?: string;
};

export default function MySessionsPage() {
  const router = useRouter();
  
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>(MY_UPCOMING_SESSIONS as Session[]);

  const [completedSessions] = useState<Session[]>(MY_COMPLETED_SESSIONS as Session[]);

  const renderStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Awaiting Tutor Confirmation
          </span>
        );
      case "NEEDS_FEEDBACK":
        return (
          <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold bg-light-heavy-blue text-white border border-light-heavy-blue shadow-sm">
            Needs Feedback
          </span>
        );
      case "FEEDBACK_SKIPPED":
        return (
          <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold bg-black/5 text-black/50 border border-black/10">
            Feedback Skipped
          </span>
        );
      default:
        return null;
    }
  };

  const handleReschedule = async (sess: Session) => {
    // Open in-page reschedule modal (instead of navigating to a separate page)
    setRescheduleSession(sess);
    setRescheduleOpen(true);
  };

  const handleCancel = async (sess: Session) => {
    const ok = await swalConfirm(
      "Cancel session",
      "Are you sure you want to cancel this session? This cannot be undone.",
      { confirmText: "Yes, cancel", cancelText: "Keep session" }
    );
    if (!ok) return;

    // Mock cancel: remove from upcoming sessions and show success
    setUpcomingSessions((prev) => prev.filter((s) => s.id !== sess.id));
    await swalSuccess("Session cancelled", "Your session has been cancelled (mock).");
  };

  const handleCancelRequest = async (sess: Session) => {
    const ok = await swalConfirm(
      "Cancel request",
      "Are you sure you want to cancel this request? This cannot be undone.",
      { confirmText: "Yes, cancel", cancelText: "Keep request" }
    );
    if (!ok) return;

    // Mock cancel: remove from upcoming sessions and show success
    setUpcomingSessions((prev) => prev.filter((s) => s.id !== sess.id));
    await swalSuccess("Session request cancelled", "Your session request has been cancelled.");
  };

  const handleSubmitFeedback = (sess: Session) => {
    router.push("/student/feedback");
  };

  // Modal state for viewing session summary
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState<Session | null>(null);

  // Reschedule modal state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [newDatetime, setNewDatetime] = useState("");
  // Mock available slots for rescheduling - in production, fetch from API
  const availableSlots = [
    "Wed · 16:00 – 17:30 · Room B4-205",
    "Thu · 10:00 – 11:30 · Room B4-205",
    "Fri · 14:00 – 15:30 · Online",
  ];
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const handleViewSummary = (sess: Session) => {
    setModalSession(sess);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSession(null);
  };

  const saveReschedule = async () => {
    if (!rescheduleSession) return;
    if (!selectedSlot) {
      await swalError("Please select a slot", "Choose one of the available slots to reschedule.");
      return;
    }

    setUpcomingSessions((prev) =>
      prev.map((s) =>
        s.id === rescheduleSession.id ? { ...s, datetime: selectedSlot } : s
      )
    );
    setRescheduleOpen(false);
    setRescheduleSession(null);
    setNewDatetime("");
    setSelectedSlot(null);
    await swalSuccess("Rescheduled Successfully!", "Your session has been moved. Notifications have been sent to your tutor.");
  };

  const cancelReschedule = () => {
    setRescheduleOpen(false);
    setRescheduleSession(null);
    setNewDatetime("");
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          My Sessions
        </h1>
        <p className="text-sm text-black/70 mt-1">
          View your upcoming sessions, pending requests, and completed sessions.
          You can reschedule, cancel, or submit feedback from here.
        </p>
        <p className="text-[0.7rem] text-black/50 mt-2">
          • You can reschedule / cancel at least <b>2h before the session start</b>. <br/>
          • Sessions marked &quot;Awaiting Tutor Confirmation&quot; are not final yet. <br />
          • Completed sessions that have no feedback will ask you to submit feedback.
        </p>
      </header>

      {/* Upcoming & Pending */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Upcoming &amp; Pending
            </h2>
            <p className="text-sm text-black/60">
              Your next bookings, including those waiting for tutor approval.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {upcomingSessions.map((sess) => (
            <article
              key={sess.id}
              className="bg-soft-white-blue/50 border border-soft-white-blue rounded-lg p-4 grid gap-4 md:grid-cols-[1.2fr_auto]"
            >
              {/* left */}
              <div className="space-y-3">
                {/* top row */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm md:text-base font-semibold text-dark-blue">
                    {sess.datetime}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {renderStatusBadge(sess.status)}
                    {sess.status === "CONFIRMED" ? (
                      <span className="px-2 py-1 rounded-md text-[0.65rem] font-semibold bg-light-heavy-blue text-white border border-light-heavy-blue/80 shadow-sm">
                        Reminder sent
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* detail blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Tutor
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.tutorName}
                      <br />
                      <span className="text-[0.65rem] text-black/50">
                        {sess.course}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Mode
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.mode}
                    </p>
                  </div>
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Status
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.status === "CONFIRMED"
                        ? "Tutor accepted · Scheduled"
                        : "Waiting · You're in queue"}
                    </p>
                  </div>
                </div>

                {/* note */}
                {sess.note ? (
                  <div className="bg-white rounded-md border border-soft-white-blue p-3">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Your request to tutor
                    </p>
                    <p className="text-sm text-black/70 leading-relaxed">
                      {sess.note}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* right actions */}
              <div className="flex flex-col gap-2 justify-between min-w-[180px]">
                <div className="flex flex-col gap-2">
                  {sess.status === "CONFIRMED" ? (
                    <>
                      <button
                        onClick={() => handleReschedule(sess)}
                        className="w-full rounded-md bg-white text-amber-600 text-sm font-semibold border border-amber-200 px-3 py-2 hover:bg-amber-50 transition"
                      >
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancel(sess)}
                        className="w-full rounded-md bg-white text-red-500 text-sm font-semibold border border-red-200 px-3 py-2 hover:bg-red-50 transition"
                      >
                        Cancel Session
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => handleCancelRequest(sess)}
                      className="w-full rounded-md bg-white text-red-500 text-sm font-semibold border border-red-200 px-3 py-2 hover:bg-red-50 transition"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
                <p className="text-[0.65rem] text-black/50">
                  Can reschedule / cancel up to 2h before start (FR-SCH.03).
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

        {/* Session Summary Modal */}
        {modalOpen && modalSession && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full shadow-lg border border-black/5 overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between p-4 border-b border-black/5">
                <div>
                  <h3 className="text-lg font-semibold text-dark-blue">Session Summary</h3>
                  <p className="text-xs text-black/60">Session · {modalSession.datetime}</p>
                </div>
                <div>
                  <button onClick={closeModal} className="text-sm text-black/50 hover:text-black/80 border rounded-full w-8 h-8">X</button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] text-black/60">Tutor</p>
                    <p className="text-sm text-dark-blue font-semibold">{modalSession.tutorName}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-black/60">Course</p>
                    <p className="text-sm text-dark-blue font-semibold">{modalSession.course}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-black/60">Focus</p>
                  <p className="text-sm text-black/80">{modalSession.focus || '—'}</p>
                </div>

                <section className="bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-dark-blue">Tutor&apos;s Summary</h4>
                  <div className="mt-2 text-sm text-black/80 whitespace-pre-wrap">
                    {modalSession.course.toLowerCase().includes("digital systems") || modalSession.focus?.toLowerCase().includes("timing") ? (
  `Session: Sat - Oct 18, 2025 (08:30 - 10:00)
  Tutor: Truong Q. T.

  Course: Digital Systems (EE2002)

  Focus: Timing diagrams, flip-flop troubleshooting

  Tutor's Summary:
  Reviewed several timing diagrams for D-type and SR flip-flops.

  We focused on identifying common troubleshooting issues when analyzing outputs. The student initially confused edge-triggered and level-triggered behavior but showed improved understanding by the end of the session.

  Assigned 2 practice exercises on D flip-flops for further practice.
`
                    ) : (
                      modalSession.note || `Tutor summary not available for this session. This is a sample view showing how the tutor's session notes would appear.`
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule modal */}
        {rescheduleOpen && rescheduleSession ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={cancelReschedule} />
            <div className="relative max-w-xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-blue">Reschedule Session</h3>
                <button onClick={cancelReschedule} className="text-sm text-black/50 hover:text-black" aria-label="Close">✕</button>
              </div>

              <p className="text-sm text-black/60 mt-2">Current: <b>{rescheduleSession.datetime}</b></p>

              <div className="mt-4">
                <p className="block text-[0.8rem] text-black/60">Available slots</p>
                <div className="mt-2 grid gap-2">
                  {availableSlots.map((slot) => (
                    <label key={slot} className={`flex items-center gap-3 p-2 rounded-md border ${selectedSlot === slot ? 'border-light-heavy-blue bg-light-heavy-blue/10' : 'border-black/10 bg-white'}`}>
                      <input
                        type="radio"
                        name="slot"
                        checked={selectedSlot === slot}
                        onChange={() => setSelectedSlot(slot)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-black/80">{slot}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[0.75rem] text-black/50 mt-2">Choose one of the available slots. In production this list comes from the server.</p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button onClick={cancelReschedule} className="rounded-md border px-4 py-2 text-sm bg-white">Cancel</button>
                <button onClick={saveReschedule} className="rounded-md bg-light-heavy-blue text-white px-4 py-2 text-sm">Save</button>
              </div>
            </div>
          </div>
        ) : null}

      {/* Completed sessions */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6 space-y-4 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Completed Sessions
            </h2>
            <p className="text-sm text-black/60">
              Fill in feedback to help improve tutoring quality.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {completedSessions.map((sess) => (
            <article
              key={sess.id}
              className="bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-4 grid gap-4 md:grid-cols-[1.2fr_auto]"
            >
              {/* left */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm md:text-base font-semibold text-dark-blue">
                    {sess.datetime}
                  </p>
                  {renderStatusBadge(sess.status)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Tutor
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.tutorName}
                      <br />
                      <span className="text-[0.65rem] text-black/50">
                        {sess.course}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Focus
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.focus || "—"}
                    </p>
                  </div>
                  <div className="bg-white rounded-md border border-soft-white-blue p-2.5">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      Status
                    </p>
                    <p className="text-sm text-black/75 leading-snug">
                      {sess.status === "NEEDS_FEEDBACK"
                        ? "Completed · Feedback pending"
                        : "Completed · Feedback deadline passed"}
                    </p>
                  </div>
                </div>

                {sess.note ? (
                  <div className="bg-white rounded-md border border-soft-white-blue p-3">
                    <p className="text-[0.7rem] font-semibold text-dark-blue mb-1">
                      {sess.status === "NEEDS_FEEDBACK"
                        ? "Session summary"
                        : "System note"}
                    </p>
                    <p className="text-sm text-black/70 leading-relaxed">
                      {sess.note}
                    </p>
                  </div>
                ) : null}
              </div>

              {/* right actions */}
              <div className="flex flex-col gap-2 justify-between min-w-[180px]">
                {sess.status === "NEEDS_FEEDBACK" ? (
                  <button
                    onClick={() => handleSubmitFeedback(sess)}
                    className="w-full rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-3 py-2 hover:bg-light-blue transition"
                  >
                    Submit Feedback
                  </button>
                ) : (
                  <button onClick={() => handleViewSummary(sess)} className="w-full rounded-md bg-white text-dark-blue text-sm font-semibold border border-light-heavy-blue/40 px-3 py-2 hover:bg-soft-white-blue/70 transition">
                    View Session Summary
                  </button>
                )}
                <p className="text-[0.65rem] text-black/50">
                  Your feedback is linked to this session (FR-FBK.01).
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
