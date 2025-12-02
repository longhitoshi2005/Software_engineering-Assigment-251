"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { swalConfirm, swalSuccess, swalError } from "@/lib/swal";
import { format, differenceInHours } from "date-fns";
import { parseUTC } from "@/lib/dateUtils";
import SessionCard from "@/components/SessionCard";
import NegotiationModal from "./NegotiationModal";
import FeedbackModal from "@/components/FeedbackModal";
import { BASE_API_URL } from "@/config/env";

type SessionStatus =
  | "WAITING_FOR_TUTOR"
  | "WAITING_FOR_STUDENT"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

type Session = {
  id: string;
  tutor_id: string;
  tutor_name: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  topic?: string | null;
  start_time: string;
  end_time: string;
  mode: string;
  location: string | null;
  status: SessionStatus;
  note?: string | null;
  session_request_type?: string;
  max_capacity?: number;
  is_public?: boolean;
  is_requester?: boolean;
  proposal?: {
    new_topic?: string;
    new_start_time?: string;
    new_end_time?: string;
    new_mode?: string;
    new_location?: string;
    tutor_message: string;
    new_max_capacity?: number;
    new_is_public?: boolean;
  } | null;
};

type AvailabilitySlot = {
  id: string;
  tutor_id: string;
  start_time: string;
  end_time: string;
  allowed_modes: string[];
  is_booked: boolean;
};

export default function MySessionsPage() {
  const router = useRouter();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchText, setSearchText] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterMode, setFilterMode] = useState("all");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState<Session | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [proposalSession, setProposalSession] = useState<Session | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/sessions/?role=student`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const data: Session[] = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
      await swalError("Failed to load sessions", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (sessionList: Session[]) => {
    return sessionList.filter(sess => {
      // Search filter (session name/topic, tutor name)
      if (searchText) {
        const search = searchText.toLowerCase();
        const matchesTopic = sess.topic?.toLowerCase().includes(search);
        const matchesTutor = sess.tutor_name.toLowerCase().includes(search);
        if (!matchesTopic && !matchesTutor) return false;
      }

      // Course filter
      if (filterCourse !== "all" && sess.course_code !== filterCourse) return false;

      // Status filter
      if (filterStatus !== "all" && sess.status !== filterStatus) return false;

      // Type filter
      if (filterType !== "all") {
        if (filterType === "ONE_ON_ONE" && sess.session_request_type !== "ONE_ON_ONE") return false;
        if (filterType === "PUBLIC_GROUP" && sess.session_request_type !== "PUBLIC_GROUP") return false;
        if (filterType === "PRIVATE_GROUP" && sess.session_request_type !== "PRIVATE_GROUP") return false;
      }

      // Mode filter
      if (filterMode !== "all" && sess.mode !== filterMode) return false;

      return true;
    });
  };

  // Get unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(sessions.map(s => s.course_code)));

  // Filter sessions
  const upcomingSessions = applyFilters(sessions.filter(s => 
    s.status === "WAITING_FOR_TUTOR" || 
    s.status === "WAITING_FOR_STUDENT" || 
    s.status === "CONFIRMED"
  ));
  const completedSessions = applyFilters(sessions.filter(s => s.status === "COMPLETED"));

  const getModeLabel = (mode: string) => {
    if (mode === 'ONLINE') return 'Online';
    if (mode === 'CAMPUS_1') return 'Campus 1';
    if (mode === 'CAMPUS_2') return 'Campus 2';
    return mode;
  };

  const handleReschedule = async (sess: Session) => {
    // Check if within 2 hours
    const hoursUntil = differenceInHours(parseUTC(sess.start_time), new Date());
    if (hoursUntil < 2) {
      const proceed = await swalConfirm(
        "Late Reschedule Warning",
        "You are rescheduling less than 2 hours before the session. This will be flagged in your record. Continue?",
        { confirmText: "Yes, reschedule anyway", cancelText: "Cancel" }
      );
      if (!proceed) return;
    }

    // Load available slots for this tutor
    try {
      const response = await fetch(`${BASE_API_URL}/availability/${sess.tutor_id}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load availability");

      const slots: AvailabilitySlot[] = await response.json();
      const freeSlots = slots.filter(slot => !slot.is_booked);

      if (freeSlots.length === 0) {
        await swalError("No Available Slots", "This tutor has no available time slots. Please contact them directly.");
        return;
      }

      setAvailableSlots(freeSlots);
      setRescheduleSession(sess);
      setRescheduleOpen(true);
    } catch (error) {
      console.error("Error loading slots:", error);
      await swalError("Failed to load availability", "Please try again later.");
    }
  };

  const saveReschedule = async () => {
    if (!rescheduleSession || !selectedSlot) {
      await swalError("Please select a slot", "Choose one of the available slots to reschedule.");
      return;
    }

    if (!rescheduleMessage.trim()) {
      await swalError("Message required", "Please explain why you want to reschedule.");
      return;
    }

    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${rescheduleSession.id}/negotiate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_start_time: selectedSlot.start_time,
          new_end_time: selectedSlot.end_time,
          new_mode: selectedSlot.allowed_modes[0],
          message: rescheduleMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to reschedule" }));
        throw new Error(errorData.detail || "Failed to reschedule");
      }

      await swalSuccess("Reschedule Request Sent", "Your tutor will be notified. The session is now pending their approval.");
      setRescheduleOpen(false);
      setRescheduleSession(null);
      setSelectedSlot(null);
      setRescheduleMessage("");
      loadSessions();
    } catch (error) {
      console.error("Error rescheduling:", error);
      await swalError("Failed to reschedule", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleCancel = async (sess: Session) => {
    // For public sessions, handle differently based on requester status
    if (sess.is_public) {
      return handleLeavePublicSession(sess);
    }
    
    // Check if within 2 hours
    const hoursUntil = differenceInHours(parseUTC(sess.start_time), new Date());
    
    let message = "Are you sure you want to cancel this session? This cannot be undone.";
    if (hoursUntil < 2) {
      message = "⚠️ You are cancelling less than 2 hours before the session. This will be flagged in your record and may affect your training credits. Are you sure?";
    }

    const ok = await swalConfirm("Cancel Session", message, { 
      confirmText: "Yes, cancel", 
      cancelText: "Keep session" 
    });
    if (!ok) return;

    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sess.id}/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          reason: hoursUntil < 2 ? "Late cancellation (< 2 hours)" : "Student cancelled" 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to cancel" }));
        throw new Error(errorData.detail || "Failed to cancel session");
      }

      await swalSuccess("Session Cancelled", hoursUntil < 2 ? "Your session has been cancelled. A late cancellation flag has been recorded." : "Your session has been cancelled.");
      loadSessions();
    } catch (error) {
      console.error("Error cancelling:", error);
      await swalError("Failed to cancel", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleLeavePublicSession = async (sess: Session) => {
    const hoursUntil = differenceInHours(parseUTC(sess.start_time), new Date());
    
    let title = "Leave Session";
    let message = "Are you sure you want to leave this public session?";
    
    if (hoursUntil < 2) {
      title = "Late Leave Warning";
      message = "⚠️ You are leaving less than 2 hours before the session. Your participation will be marked as CANCELLED (you will remain in the session list but marked as cancelled). Are you sure?";
    }

    const ok = await swalConfirm(title, message, { 
      confirmText: "Yes, leave", 
      cancelText: "Stay in session" 
    });
    if (!ok) return;

    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sess.id}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to leave session" }));
        throw new Error(errorData.detail || "Failed to leave session");
      }

      const data = await response.json();
      
      if (data.late_leave) {
        await swalSuccess("Marked as Cancelled", "Your participation has been marked as cancelled due to leaving less than 2 hours before the session. You remain in the session list.");
      } else if (data.session_cancelled) {
        await swalSuccess("Session Cancelled", "You have left the session. All students have left, so the session has been cancelled.");
      } else {
        await swalSuccess("Left Session", "You have successfully left the public session.");
      }
      
      loadSessions();
    } catch (error) {
      console.error("Error leaving session:", error);
      await swalError("Failed to leave", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const handleCancelRequest = async (sess: Session) => {
    // For non-confirmed sessions, use simpler cancel flow
    const ok = await swalConfirm(
      "Cancel Request",
      "Are you sure you want to cancel this request? This cannot be undone.",
      { confirmText: "Yes, cancel", cancelText: "Keep request" }
    );
    if (!ok) return;

    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sess.id}/cancel`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Student cancelled request" }),
      });

      if (!response.ok) throw new Error("Failed to cancel");

      await swalSuccess("Request Cancelled", "Your session request has been cancelled.");
      loadSessions();
    } catch (error) {
      console.error("Error cancelling:", error);
      await swalError("Failed to cancel", "Please try again.");
    }
  };

  const handleViewProposal = (sess: Session) => {
    setProposalSession(sess);
    setProposalModalOpen(true);
  };

  const handleAcceptProposal = async () => {
    if (!proposalSession) return;

    try {
      // When accepting a proposal, we need to provide the final session details
      const confirmDetails = {
        topic: proposalSession.proposal?.new_topic || proposalSession.topic || "Session",
        max_capacity: proposalSession.proposal?.new_max_capacity || proposalSession.max_capacity || 1,
        is_public: proposalSession.proposal?.new_is_public ?? proposalSession.is_public ?? false,
        final_location_link: proposalSession.proposal?.new_location || proposalSession.location || null
      };

      const response = await fetch(`${BASE_API_URL}/sessions/${proposalSession.id}/negotiate/accept`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(confirmDetails),
      });

      if (!response.ok) throw new Error("Failed to accept proposal");

      await swalSuccess("Proposal Accepted", "The session has been updated with the new details.");
      setProposalModalOpen(false);
      setProposalSession(null);
      loadSessions();
    } catch (error) {
      console.error("Error accepting proposal:", error);
      await swalError("Failed to accept", "Please try again.");
    }
  };

  const handleRejectProposal = async () => {
    if (!proposalSession) return;

    const ok = await swalConfirm(
      "Reject Proposal",
      "Rejecting this proposal will cancel the session entirely. You'll need to create a new booking request if you still want to meet this tutor.",
      { confirmText: "Yes, reject", cancelText: "Keep proposal" }
    );
    if (!ok) return;

    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${proposalSession.id}/negotiate/reject`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to reject proposal");

      await swalSuccess("Proposal Rejected", "The session has been cancelled.");
      setProposalModalOpen(false);
      setProposalSession(null);
      loadSessions();
    } catch (error) {
      console.error("Error rejecting proposal:", error);
      await swalError("Failed to reject", "Please try again.");
    }
  };

  const handleSubmitFeedback = (sess: Session) => {
    setFeedbackSessionId(sess.id);
    setFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModalOpen(false);
    setFeedbackSessionId(null);
  };

  const handleFeedbackSaved = () => {
    // Optionally reload sessions to update status
    loadSessions();
  };

  const handleViewSummary = (sess: Session) => {
    setModalSession(sess);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalSession(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center py-10">Loading sessions...</div>
      </div>
    );
  }

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
          • You can reschedule / cancel at least <b>2h before the session start</b>. Late changes will be flagged. <br/>
          • Sessions marked &quot;Awaiting Tutor Confirmation&quot; are not final yet. <br />
          • Completed sessions require feedback submission.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-dark-blue">Filters</h3>
        
        <div className="space-y-3">
          {/* Search and Course */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-3">
              <input
                type="text"
                placeholder="Search by session name or tutor name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
              />
            </div>

            <div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
              >
                <option value="all">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status, Mode, Type, Clear */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
              >
                <option value="all">All Status</option>
                <option value="WAITING_FOR_TUTOR">Waiting for Tutor</option>
                <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
              >
                <option value="all">All Modes</option>
                <option value="ONLINE">Online</option>
                <option value="CAMPUS_1">Campus 1</option>
                <option value="CAMPUS_2">Campus 2</option>
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
              >
                <option value="all">All Types</option>
                <option value="ONE_ON_ONE">One-on-One</option>
                <option value="PUBLIC_GROUP">Public Group</option>
                <option value="PRIVATE_GROUP">Private Group</option>
              </select>
            </div>

            <div>
              <button
                onClick={() => {
                  setSearchText("");
                  setFilterCourse("all");
                  setFilterStatus("all");
                  setFilterType("all");
                  setFilterMode("all");
                }}
                className="w-full px-3 py-2 text-sm bg-soft-white-blue text-dark-blue rounded-lg hover:bg-soft-white-blue/70 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

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

        {upcomingSessions.length === 0 ? (
          <div className="bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-8 text-center">
            <p className="text-sm text-black/40 italic">No upcoming sessions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((sess) => (
              <SessionCard
                key={sess.id}
                session={sess}
                onCancel={sess.status === "CONFIRMED" ? handleCancel : handleCancelRequest}
                onReschedule={handleReschedule}
                onSolve={handleViewProposal}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completed sessions */}
      <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6 space-y-4 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Completed Sessions
            </h2>
            <p className="text-sm text-black/60">
              Submit feedback to help improve tutoring quality.
            </p>
          </div>
        </div>

        {completedSessions.length === 0 ? (
          <div className="bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-8 text-center">
            <p className="text-sm text-black/40 italic">No completed sessions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedSessions.map((sess) => (
              <SessionCard
                key={sess.id}
                session={sess}
                onFeedback={handleSubmitFeedback}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reschedule Modal */}
      {rescheduleOpen && rescheduleSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRescheduleOpen(false)} />
          <div className="relative max-w-xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-dark-blue">Reschedule Session</h3>
              <button onClick={() => setRescheduleOpen(false)} className="text-sm text-black/50 hover:text-black" aria-label="Close">✕</button>
            </div>

            <p className="text-sm text-black/60 mt-2">
              Current: <b>{format(parseUTC(rescheduleSession.start_time), 'EEE · MMM dd, HH:mm')} - {format(parseUTC(rescheduleSession.end_time), 'HH:mm')}</b>
            </p>

            <div className="mt-4">
              <p className="block text-[0.8rem] text-black/60">Available slots from {rescheduleSession.tutor_name}</p>
              <div className="mt-2 grid gap-2 max-h-60 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <label 
                    key={slot.id} 
                    className={`flex items-center gap-3 p-2 rounded-md border cursor-pointer ${
                      selectedSlot?.id === slot.id 
                        ? 'border-light-heavy-blue bg-light-heavy-blue/10' 
                        : 'border-black/10 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slot"
                      checked={selectedSlot?.id === slot.id}
                      onChange={() => setSelectedSlot(slot)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-black/80">
                      {format(parseUTC(slot.start_time), 'EEE · MMM dd, HH:mm')} - {format(parseUTC(slot.end_time), 'HH:mm')}
                      <span className="text-xs text-black/50 ml-2">({slot.allowed_modes.join(', ')})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-[0.8rem] text-black/60 mb-1">Reason for rescheduling (required)</label>
              <textarea
                value={rescheduleMessage}
                onChange={(e) => setRescheduleMessage(e.target.value)}
                placeholder="Please explain why you need to reschedule..."
                className="w-full border border-black/10 rounded-md p-2 text-sm"
                rows={3}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setRescheduleOpen(false)} className="rounded-md border px-4 py-2 text-sm bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={saveReschedule} className="rounded-md bg-light-heavy-blue text-white px-4 py-2 text-sm hover:bg-light-blue">Send Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Modal */}
      {proposalModalOpen && proposalSession && proposalSession.proposal && (
        <NegotiationModal
          session={proposalSession}
          onClose={() => {
            setProposalModalOpen(false);
            setProposalSession(null);
          }}
          onAccept={handleAcceptProposal}
          onReject={handleRejectProposal}
        />
      )}

      {/* Session Summary Modal */}
      {modalOpen && modalSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full shadow-lg border border-black/5 overflow-y-auto max-h-[90vh] mt-10">
            <div className="flex items-center justify-between p-4 border-b border-black/5">
              <div>
                <h3 className="text-lg font-semibold text-dark-blue">Session Summary</h3>
                <p className="text-xs text-black/60">
                  {format(parseUTC(modalSession.start_time), 'EEE · MMM dd, HH:mm')} - {format(parseUTC(modalSession.end_time), 'HH:mm')}
                </p>
              </div>
              <button onClick={closeModal} className="text-sm text-black/50 hover:text-black/80 border rounded-full w-8 h-8">✕</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-black/60">Tutor</p>
                  <p className="text-sm text-dark-blue font-semibold">{modalSession.tutor_name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-black/60">Course</p>
                  <p className="text-sm text-dark-blue font-semibold">{modalSession.course_code} - {modalSession.course_name}</p>
                </div>
                <div>
                  <p className="text-[11px] text-black/60">Mode</p>
                  <p className="text-sm text-dark-blue font-semibold">{getModeLabel(modalSession.mode)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-black/60">Location</p>
                  <p className="text-sm text-dark-blue font-semibold">{modalSession.location || 'Not specified'}</p>
                </div>
              </div>

              {modalSession.note && (
                <div>
                  <p className="text-[11px] text-black/60">Your Request</p>
                  <p className="text-sm text-black/80">{modalSession.note}</p>
                </div>
              )}

              <section className="bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-4">
                <h4 className="text-sm font-semibold text-dark-blue">Session Complete</h4>
                <p className="mt-2 text-sm text-black/80">
                  This session has been completed. You can submit feedback to help improve tutoring quality.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModalOpen && feedbackSessionId && (
        <FeedbackModal
          sessionId={feedbackSessionId}
          onClose={closeFeedbackModal}
          onSaved={handleFeedbackSaved}
        />
      )}
    </div>
  );
}
