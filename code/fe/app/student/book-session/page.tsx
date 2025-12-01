"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { LocationMode, LocationModeLabels } from "@/types/location";
import { TutorSearchResult } from "@/types/tutorSearch";
import { BookingRequest, SessionRequestType } from "@/types/session";
import { AvailabilitySlot } from "@/types/availability";
import { formatDate, formatTime, formatTimeRange } from "@/lib/dateUtils";
import { BASE_API_URL } from "@/config/env";

// Constants
const MINIMUM_DURATION_MINUTES = 30;
const SLIDER_STEP_MINUTES = 15;

function BookSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorId = searchParams.get("tutorId");

  // Data states
  const [tutor, setTutor] = useState<TutorSearchResult | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Slot-based selection
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 0]); // Minutes from slot start
  const [manualStartTime, setManualStartTime] = useState("");
  const [manualEndTime, setManualEndTime] = useState("");
  const [timeInputError, setTimeInputError] = useState("");

  // Form states
  const [courseCode, setCourseCode] = useState("");
  const [mode, setMode] = useState<LocationMode>(LocationMode.ONLINE);
  const [sessionType, setSessionType] = useState<SessionRequestType>(SessionRequestType.ONE_ON_ONE);
  const [invitedEmails, setInvitedEmails] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(1);
  const [note, setNote] = useState("");

  // Load tutor data and availability on mount
  useEffect(() => {
    if (!tutorId) {
      router.push("/student/find-tutor");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch current user info
        const userRes = await fetch(`${BASE_API_URL}/users/me`, {
          credentials: "include",
        });

        if (!userRes.ok) throw new Error("Failed to load user information");

        const userData = await userRes.json();
        setCurrentUser(userData);

        // Fetch tutor info
        const tutorRes = await fetch(`${BASE_API_URL}/tutors/${tutorId}`, {
          credentials: "include",
        });

        if (!tutorRes.ok) throw new Error("Failed to load tutor");

        const tutorData = await tutorRes.json();
        setTutor(tutorData);

        // Fetch available slots
        const slotsRes = await fetch(`${BASE_API_URL}/availability/${tutorId}`, {
          credentials: "include",
        });

        if (!slotsRes.ok) throw new Error("Failed to load availability");

        const slotsData: AvailabilitySlot[] = await slotsRes.json();
        
        // Filter only unbooked slots and sort by start time
        const unbooked = slotsData
          .filter(slot => !slot.is_booked)
          .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        
        setAvailableSlots(unbooked);

        // Auto-select tutor's first subject
        if (tutorData.subjects && tutorData.subjects.length > 0) {
          setCourseCode(tutorData.subjects[0].course_code);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load information. Please try again.",
        });
        router.push("/student/find-tutor");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [tutorId, router]);

  // Handle slot selection
  const handleSlotSelect = (slotId: string) => {
    const slot = availableSlots.find(s => s.id === slotId);
    if (!slot) return;

    setSelectedSlot(slot);

    // Calculate slot duration in minutes
    const slotStart = new Date(slot.start_time + 'Z');
    const slotEnd = new Date(slot.end_time + 'Z');
    const durationMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);

    // Set slider to full slot range initially
    setSliderRange([0, durationMinutes]);

    // Set manual time inputs
    const formatTimeForInput = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    setManualStartTime(formatTimeForInput(slotStart));
    setManualEndTime(formatTimeForInput(slotEnd));
    setTimeInputError("");

    // Update mode to match slot's allowed modes
    if (slot.allowed_modes && slot.allowed_modes.length > 0) {
      setMode(slot.allowed_modes[0]);
    }
  };

  // Handle slider change with minimum duration enforcement
  const handleSliderChange = (value: number | number[]) => {
    if (!Array.isArray(value) || value.length !== 2 || !selectedSlot) return;

    const [start, end] = value;
    const duration = end - start;

    // Enforce minimum duration
    if (duration < MINIMUM_DURATION_MINUTES) {
      return; // Reject the change
    }

    setSliderRange([start, end]);

    // Update manual time inputs to match slider
    const slotStart = new Date(selectedSlot.start_time + 'Z');
    const actualStart = new Date(slotStart.getTime() + start * 60 * 1000);
    const actualEnd = new Date(slotStart.getTime() + end * 60 * 1000);

    const formatTimeForInput = (date: Date) => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    setManualStartTime(formatTimeForInput(actualStart));
    setManualEndTime(formatTimeForInput(actualEnd));
    setTimeInputError("");
  };

  // Handle manual time input changes
  const handleManualTimeChange = (type: 'start' | 'end', value: string) => {
    if (!selectedSlot) return;

    const slotStart = new Date(selectedSlot.start_time + 'Z');
    const slotEnd = new Date(selectedSlot.end_time + 'Z');

    try {
      // Parse the input time
      const [hours, minutes] = value.split(':').map(Number);
      const inputDate = new Date(slotStart);
      inputDate.setHours(hours, minutes, 0, 0);

      // Auto-correct if out of bounds
      if (type === 'start') {
        if (inputDate < slotStart) {
          // Set to slot start
          const formatTimeForInput = (date: Date) => {
            const h = String(date.getHours()).padStart(2, '0');
            const m = String(date.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
          };
          setManualStartTime(formatTimeForInput(slotStart));
          return;
        }
        setManualStartTime(value);
      } else {
        if (inputDate > slotEnd) {
          // Set to slot end
          const formatTimeForInput = (date: Date) => {
            const h = String(date.getHours()).padStart(2, '0');
            const m = String(date.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
          };
          setManualEndTime(formatTimeForInput(slotEnd));
          return;
        }
        setManualEndTime(value);
      }

      // Validate and update slider if both times are valid
      const startTime = type === 'start' ? value : manualStartTime;
      const endTime = type === 'end' ? value : manualEndTime;

      if (!startTime || !endTime) return;

      // Parse both times
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      const manualStart = new Date(slotStart);
      manualStart.setHours(startHours, startMinutes, 0, 0);

      const manualEnd = new Date(slotStart);
      manualEnd.setHours(endHours, endMinutes, 0, 0);

      const durationMinutes = (manualEnd.getTime() - manualStart.getTime()) / (1000 * 60);

      if (durationMinutes < MINIMUM_DURATION_MINUTES) {
        setTimeInputError(`Duration must be at least ${MINIMUM_DURATION_MINUTES} minutes`);
        return;
      }

      // Valid - update slider
      const startOffset = (manualStart.getTime() - slotStart.getTime()) / (1000 * 60);
      const endOffset = (manualEnd.getTime() - slotStart.getTime()) / (1000 * 60);

      setSliderRange([startOffset, endOffset]);
      setTimeInputError("");
    } catch {
      setTimeInputError("Invalid time format");
    }
  };

  // Calculate actual start/end times from slider
  const getActualTimes = (): { start: Date; end: Date } | null => {
    if (!selectedSlot) return null;

    const slotStart = new Date(selectedSlot.start_time + 'Z');
    const [startOffset, endOffset] = sliderRange;

    const actualStart = new Date(slotStart.getTime() + startOffset * 60 * 1000);
    const actualEnd = new Date(slotStart.getTime() + endOffset * 60 * 1000);

    return { start: actualStart, end: actualEnd };
  };

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

    if (!selectedSlot) {
      await Swal.fire("Error", "Please select an available time slot", "error");
      return;
    }

    const actualTimes = getActualTimes();
    if (!actualTimes) {
      await Swal.fire("Error", "Invalid time selection", "error");
      return;
    }

    // Validate private group emails
    if (sessionType === SessionRequestType.PRIVATE_GROUP && !invitedEmails.trim()) {
      await Swal.fire("Error", "Please provide invited emails for private group session", "error");
      return;
    }

    // Build booking request
    const bookingRequest: BookingRequest = {
      tutor_id: tutorId!,
      course_code: courseCode,
      start_time: actualTimes.start.toISOString(),
      end_time: actualTimes.end.toISOString(),
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
      const response = await fetch(`${BASE_API_URL}/sessions/`, {
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
    } catch (error: unknown) {
      console.error("Error submitting booking:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not submit booking request.";
      await Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: errorMessage,
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
                value={currentUser ? `${currentUser.display_name || currentUser.full_name || 'N/A'} · ${currentUser.student_id || 'N/A'}` : 'Loading...'}
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

            {/* SLOT SELECTION */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Available Time Slot *
              </label>
              <select
                value={selectedSlot?.id || ""}
                onChange={(e) => handleSlotSelect(e.target.value)}
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                required
              >
                <option value="">Select an available time slot</option>
                {availableSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {formatTimeRange(slot.start_time, slot.end_time)} 
                    {slot.allowed_modes && slot.allowed_modes.length > 0 && 
                      ` (${slot.allowed_modes.map(m => LocationModeLabels[m]).join(', ')})`
                    }
                  </option>
                ))}
              </select>
              {availableSlots.length === 0 && (
                <p className="text-[11px] text-red-500 mt-1">
                  No available slots. This tutor may not have set their availability yet.
                </p>
              )}
              {availableSlots.length > 0 && (
                <p className="text-[11px] text-black/45 mt-1">
                  Select from tutor&apos;s available time slots
                </p>
              )}
            </div>

            {/* TIME RANGE SLIDER */}
            {selectedSlot && (() => {
              const slotStart = new Date(selectedSlot.start_time + 'Z');
              const slotEnd = new Date(selectedSlot.end_time + 'Z');
              const maxMinutes = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60);

              return (
                <div className="bg-soft-white-blue/40 rounded-lg p-4 border border-soft-white-blue">
                  <label className="text-xs font-semibold text-dark-blue block mb-3">
                    Fine-tune Your Time Range *
                  </label>
                  
                  {/* Time Display */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-black/50 mb-1">START</p>
                      <input
                        type="time"
                        value={manualStartTime}
                        onChange={(e) => handleManualTimeChange('start', e.target.value)}
                        className="font-semibold text-dark-blue bg-transparent border border-soft-white-blue rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-light-light-blue"
                      />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-[10px] text-black/50 mb-1">DURATION</p>
                      <p className="font-semibold text-light-heavy-blue">
                        {sliderRange[1] - sliderRange[0]} min
                      </p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-[10px] text-black/50 mb-1">END</p>
                      <input
                        type="time"
                        value={manualEndTime}
                        onChange={(e) => handleManualTimeChange('end', e.target.value)}
                        className="font-semibold text-dark-blue bg-transparent border border-soft-white-blue rounded px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-light-light-blue"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {timeInputError && (
                    <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {timeInputError}
                    </div>
                  )}

                  {/* Slider */}
                  <div className="px-2 py-6">
                    <Slider
                      range
                      min={0}
                      max={maxMinutes}
                      step={SLIDER_STEP_MINUTES}
                      value={sliderRange}
                      onChange={handleSliderChange}
                      allowCross={false}
                      styles={{
                        track: {
                          backgroundColor: '#4A90E2',
                        },
                        handle: {
                          borderColor: '#4A90E2',
                          backgroundColor: '#fff',
                        },
                        rail: {
                          backgroundColor: '#e0e7ff',
                        },
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-black/45 mt-2">
                    Minimum duration: {MINIMUM_DURATION_MINUTES} minutes • Step: {SLIDER_STEP_MINUTES} minutes
                  </p>
                </div>
              );
            })()}

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
                disabled={!selectedSlot}
              >
                {selectedSlot && selectedSlot.allowed_modes && selectedSlot.allowed_modes.length > 0 ? (
                  selectedSlot.allowed_modes.map((allowedMode) => (
                    <option key={allowedMode} value={allowedMode}>
                      {LocationModeLabels[allowedMode]}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={LocationMode.ONLINE}>{LocationModeLabels[LocationMode.ONLINE]}</option>
                    <option value={LocationMode.CAMPUS_1}>{LocationModeLabels[LocationMode.CAMPUS_1]}</option>
                    <option value={LocationMode.CAMPUS_2}>{LocationModeLabels[LocationMode.CAMPUS_2]}</option>
                  </>
                )}
              </select>
              <p className="text-[11px] text-black/45 mt-1">
                {selectedSlot && selectedSlot.allowed_modes && selectedSlot.allowed_modes.length > 0 
                  ? "Only modes allowed by the selected time slot" 
                  : "Meeting link/room will be provided by tutor after confirmation"}
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
                  min="2"
                  value={maxCapacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 2;
                    setMaxCapacity(Math.max(val, 2));
                  }}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                  required
                />
                <p className="text-[11px] text-black/45 mt-1">
                  Number of students who can join this public group session (minimum 2)
                </p>
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
                {selectedSlot && getActualTimes() ? (
                  <>
                    {formatDate(selectedSlot.start_time)}<br />
                    {formatTime(getActualTimes()!.start.toISOString())} - {formatTime(getActualTimes()!.end.toISOString())}
                    <span className="text-xs text-black/50 block mt-1">
                      ({sliderRange[1] - sliderRange[0]} minutes)
                    </span>
                  </>
                ) : (
                  <span className="text-black/30">Not selected</span>
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
              <li>Select from tutor&apos;s available time slots</li>
              <li>Use the slider to fine-tune your preferred time within the slot</li>
              <li>Minimum {MINIMUM_DURATION_MINUTES} minutes session duration required</li>
              <li>Tutor will review and confirm/reject/negotiate your request</li>
              <li>Meeting location will be provided after confirmation</li>
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
