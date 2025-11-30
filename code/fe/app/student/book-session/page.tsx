"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { LocationMode, LocationModeLabels } from "@/types/location";
import { TutorSearchResult } from "@/types/tutorSearch";
import { BookingRequest, SessionRequestType } from "@/types/session";

function BookSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");

  // Data states
  const [tutor, setTutor] = useState<TutorSearchResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states - Manual date/time entry
  const [courseCode, setCourseCode] = useState("");
  const [requestDate, setRequestDate] = useState(""); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(""); // HH:MM
  const [endTime, setEndTime] = useState(""); // HH:MM
  const [mode, setMode] = useState<LocationMode>(LocationMode.ONLINE);
  const [sessionType, setSessionType] = useState<SessionRequestType>(SessionRequestType.ONE_ON_ONE);
  const [invitedEmails, setInvitedEmails] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [note, setNote] = useState("");

  // Load tutor data on mount
  useEffect(() => {
    if (!tutorId) {
      router.push("/student/find-tutor");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const tutorRes = await fetch(`http://localhost:8000/tutors/${tutorId}`, {
          credentials: "include",
        });

        if (!tutorRes.ok) throw new Error("Failed to load tutor");

        const tutorData = await tutorRes.json();
        setTutor(tutorData);

        // Set today as default date
        const today = new Date().toISOString().split('T')[0];
        setRequestDate(today);

        // Auto-select tutor's first subject
        if (tutorData.subjects && tutorData.subjects.length > 0) {
          setCourseCode(tutorData.subjects[0].course_code);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load tutor information. Please try again.",
        });
        router.push("/student/find-tutor");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tutorId, router]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/student/find-tutor");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!courseCode) {
      await Swal.fire("Error", "Please select a subject", "error");
      return;
    }

    if (!requestDate || !startTime || !endTime) {
      await Swal.fire("Error", "Please fill in date and time", "error");
      return;
    }

    // Validate time range
    if (startTime >= endTime) {
      await Swal.fire("Error", "End time must be after start time", "error");
      return;
    }

    // Validate private group emails
    if (sessionType === SessionRequestType.PRIVATE_GROUP && !invitedEmails.trim()) {
      await Swal.fire("Error", "Please provide invited emails for private group session", "error");
      return;
    }

    // Build ISO datetime strings
    const start_time = `${requestDate}T${startTime}:00`;
    const end_time = `${requestDate}T${endTime}:00`;

    // Build booking request (no location - tutor will provide)
    const bookingRequest: BookingRequest = {
      tutor_id: tutorId!,
      course_code: courseCode,
      start_time,
      end_time,
      mode,
      session_request_type: sessionType,
    };

    // Optional fields
    if (note) bookingRequest.note = note;
    if (sessionType === SessionRequestType.PRIVATE_GROUP) {
      bookingRequest.invited_emails = invitedEmails.split(',').map(e => e.trim()).filter(e => e);
    }
    if (sessionType === SessionRequestType.PUBLIC_GROUP) {
      bookingRequest.requested_max_capacity = maxCapacity;
    }

    try {
      const response = await fetch("http://localhost:8000/sessions/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create booking");
      }

      await Swal.fire({
        icon: "success",
        title: "Booking Submitted",
        text: "Your session request has been sent to the tutor for review.",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/student/my-sessions");
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      await Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: error.message || "Could not submit booking request. Please check if your requested time falls within tutor's availability.",
      });
    }
  };

  if (loading || !tutor) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-light-blue mb-3"></div>
          <p className="text-dark-blue font-semibold mb-2">Loading session details...</p>
          <p className="text-sm text-black/60">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      {/* PAGE HEADER */}
      <header className="mb-5">
        <div className="mb-3">
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-light-heavy-blue hover:underline inline-flex items-center gap-1"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Book a Session
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Request a tutoring session. Backend will verify if your requested time matches tutor availability.
        </p>
      </header>

      {/* LAYOUT 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {/* LEFT: FORM */}
        <section className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6">
          {/* HEADER */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-dark-blue">
                Session Details
              </h2>
              <span className="text-[11px] font-medium text-black/50">
                UC-03b · FR-SCH.02
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1">
              Enter your preferred date and time. Backend will check against tutor availability.
            </p>
          </div>

          {/* TUTOR SUMMARY */}
          <div className="bg-soft-white-blue/70 border border-soft-white-blue rounded-lg p-3 mb-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-dark-blue">
                  {tutor.display_name}
                </p>
                {tutor.subjects && tutor.subjects.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {tutor.subjects.map((subject) => (
                      <p key={subject.course_code} className="text-xs text-black/60">
                        {subject.course_code} - {subject.course_name}
                      </p>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-black/50 mt-1">
                  {tutor.academic_major || 'Department not specified'}
                </p>
              </div>
              <span className="inline-flex items-center rounded-md bg-light-light-blue/10 text-light-light-blue text-[11px] font-semibold px-2 py-[3px] border border-light-light-blue/50">
                Tutor selected
              </span>
            </div>
            {tutor.bio && (
              <p className="text-[11px] text-black/60 mt-2 italic">
                &quot;{tutor.bio}&quot;
              </p>
            )}
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STUDENT INFO */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Student Name / ID
              </label>
              <input
                readOnly
                value="Nguyen M. Q. Khanh · 2352525"
                className="w-full rounded-md border border-black/5 bg-soft-white-blue/60 px-3 py-2 text-sm text-black/80 outline-none focus:ring-2 focus:ring-light-light-blue/70"
              />
              <p className="text-[11px] text-black/45 mt-1">
                Synced from HCMUT_DATACORE. You can&apos;t edit this here.
              </p>
            </div>

            {/* SUBJECT */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Subject/Course *
              </label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                required
              >
                <option value="">Select course</option>
                {tutor.subjects?.map((subject) => (
                  <option key={subject.course_code} value={subject.course_code}>
                    {subject.course_code} - {subject.course_name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-black/45 mt-1">
                Only subjects this tutor teaches
              </p>
            </div>

            {/* DATE AND TIME */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                  required
                />
              </div>
            </div>
            <p className="text-[11px] text-black/45 -mt-2">
              Backend will check if this time matches tutor availability
            </p>

            {/* LOCATION MODE */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Location Mode *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as LocationMode)}
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                required
              >
                <option value={LocationMode.ONLINE}>{LocationModeLabels[LocationMode.ONLINE]}</option>
                <option value={LocationMode.CAMPUS_1}>{LocationModeLabels[LocationMode.CAMPUS_1]}</option>
                <option value={LocationMode.CAMPUS_2}>{LocationModeLabels[LocationMode.CAMPUS_2]}</option>
              </select>
              <p className="text-[11px] text-black/45 mt-1">
                Meeting link/room will be provided by tutor after confirmation
              </p>
            </div>

            {/* SESSION TYPE */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Session Type *
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as SessionRequestType)}
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
              >
                <option value={SessionRequestType.ONE_ON_ONE}>One-on-One</option>
                <option value={SessionRequestType.PRIVATE_GROUP}>Private Group (Invite Friends)</option>
                <option value={SessionRequestType.PUBLIC_GROUP}>Public Group (Open to Others)</option>
              </select>
            </div>

            {/* CONDITIONAL: PRIVATE GROUP - INVITED EMAILS */}
            {sessionType === SessionRequestType.PRIVATE_GROUP && (
              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Invite Friends (Emails, comma-separated) *
                </label>
                <textarea
                  value={invitedEmails}
                  onChange={(e) => setInvitedEmails(e.target.value)}
                  rows={2}
                  placeholder="friend1@hcmut.edu.vn, friend2@hcmut.edu.vn"
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70 resize-y"
                  required
                />
              </div>
            )}

            {/* CONDITIONAL: PUBLIC GROUP - MAX CAPACITY */}
            {sessionType === SessionRequestType.PUBLIC_GROUP && (
              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Requested Max Capacity *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(parseInt(e.target.value) || 1)}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                />
              </div>
            )}

            {/* NOTE */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                What do you want to work on?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Example: I need help with recursion and pointer debugging from lab 03..."
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70 resize-y"
              />
              <p className="text-[11px] text-black/45 mt-1">
                Tutor will see this message before confirming.
              </p>
            </div>

            {/* CONFIRM BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-black/5">
              <p className="text-[11px] text-black/55 max-w-[360px]">
                By clicking &quot;Request Session&quot;, your request will be sent to the tutor for review.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-light-blue transition"
              >
                Request Session
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: SUMMARY / POLICY */}
        <aside className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-dark-blue">
                Booking Summary
              </h3>
              <p className="text-[11px] text-black/45">
                Draft · Not submitted
              </p>
            </div>
            <span className="text-[11px] text-black/45">FR-SCH.02</span>
          </div>

          <div className="bg-soft-white-blue/40 rounded-lg p-3 space-y-3 border border-soft-white-blue">
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Tutor</p>
              <p className="text-sm text-black/80">
                {tutor.display_name}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Subject</p>
              <p className="text-sm text-black/80">
                {courseCode ? (
                  tutor.subjects?.find(s => s.course_code === courseCode)?.course_name || courseCode
                ) : (
                  <span className="text-black/30">Not selected</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Requested Time</p>
              <p className="text-sm text-black/80">
                {requestDate && startTime && endTime ? (
                  <>
                    {new Date(requestDate).toLocaleDateString()}<br />
                    {startTime} - {endTime}
                  </>
                ) : (
                  <span className="text-black/30">Not specified</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Mode</p>
              <p className="text-sm text-black/80">{LocationModeLabels[mode]}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Session Type</p>
              <p className="text-sm text-black/80">
                {sessionType === SessionRequestType.ONE_ON_ONE && "One-on-One"}
                {sessionType === SessionRequestType.PRIVATE_GROUP && "Private Group"}
                {sessionType === SessionRequestType.PUBLIC_GROUP && "Public Group"}
              </p>
            </div>
            {note && (
              <div>
                <p className="text-[11px] font-semibold text-dark-blue">Your Note</p>
                <p className="text-sm text-black/80">
                  {note.substring(0, 100)}
                  {note.length > 100 && "..."}
                </p>
              </div>
            )}
          </div>

          <div className="bg-soft-white-blue/10 rounded-lg p-3 border border-dashed border-black/10">
            <p className="text-[11px] font-semibold text-dark-blue mb-1">
              How it works
            </p>
            <ul className="text-[11px] text-black/55 space-y-1 list-disc list-inside">
              <li>You enter preferred date/time</li>
              <li>Backend checks if it matches tutor availability</li>
              <li>Tutor reviews and confirms/rejects your request</li>
              <li>Meeting location will be provided by tutor after confirmation</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BookSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookSessionContent />
    </Suspense>
  );
}
