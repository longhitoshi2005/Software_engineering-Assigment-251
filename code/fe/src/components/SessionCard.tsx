"use client";

import React from "react";
import { format } from "date-fns";
import { parseUTC } from "@/lib/dateUtils";

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
  current_capacity?: number;
  feedback_status?: "PENDING" | "SUBMITTED" | "SKIPPED" | null;
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

interface SessionCardProps {
  session: Session;
  onCancel?: (session: Session) => void;
  onReschedule?: (session: Session) => void;
  onFeedback?: (session: Session) => void;
  onSolve?: (session: Session) => void;
}

export default function SessionCard({
  session,
  onCancel,
  onReschedule,
  onFeedback,
  onSolve,
}: SessionCardProps) {
  const getStatusTag = (status: SessionStatus) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Confirmed
          </span>
        );
      case "WAITING_FOR_TUTOR":
        return (
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Awaiting Tutor
          </span>
        );
      case "WAITING_FOR_STUDENT":
        return (
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Awaiting Student
          </span>
        );
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-light-heavy-blue text-white border border-light-heavy-blue">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeTag = (type?: string) => {
    if (!type) return null;
    return type === "ONE_ON_ONE" ? (
      <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
        One-on-One
      </span>
    ) : (
      <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
        {session.is_public ? "Public Group" : "Private Group"}
      </span>
    );
  };

  const getModeTag = (mode: string) => {
    const modeMap: Record<string, string> = {
      ONLINE: "Online",
      CAMPUS_1: "Campus 1",
      CAMPUS_2: "Campus 2",
    };
    return (
      <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
        {modeMap[mode] || mode}
      </span>
    );
  };

  const getCourseTag = (courseCode: string, courseName: string) => {
    return (
      <span className="px-2 py-0.5 rounded text-[0.65rem] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
        {courseCode} - {courseName}
      </span>
    );
  };

  const currentCapacity = session.current_capacity || 1;
  const maxCapacity = session.max_capacity || 1;

  // Determine which actions to show
  const showCancel = session.status === "CONFIRMED" || session.status === "WAITING_FOR_TUTOR";
  const showReschedule = session.status === "CONFIRMED" && session.session_request_type === "ONE_ON_ONE";
  // Only show feedback button if session is completed AND feedback not submitted yet
  const showFeedback = session.status === "COMPLETED" && (!session.feedback_status || session.feedback_status === "PENDING");
  const showSolve = session.status === "WAITING_FOR_STUDENT";
  
  // Feedback is clickable if already submitted or skipped
  const feedbackClickable = session.status === "COMPLETED" && (session.feedback_status === "SUBMITTED" || session.feedback_status === "SKIPPED");
  
  const getFeedbackDisplay = () => {
    if (session.status !== "COMPLETED") return <span className="text-black/50">None</span>;
    
    if (session.feedback_status === "SUBMITTED") {
      return (
        <button
          onClick={() => onFeedback?.(session)}
          className="text-green-600 font-medium hover:underline cursor-pointer"
        >
          ✓ Submitted
        </button>
      );
    }
    
    if (session.feedback_status === "SKIPPED") {
      return (
        <button
          onClick={() => onFeedback?.(session)}
          className="text-red-500 font-medium hover:underline cursor-pointer"
        >
          ⚠ Skipped
        </button>
      );
    }
    
    if (session.feedback_status === "PENDING") {
      return <span className="text-amber-600 font-medium">⏳ Pending</span>;
    }
    
    return <span className="text-black/50">None</span>;
  };

  return (
    <article className="bg-soft-white-blue/50 border border-soft-white-blue rounded-lg p-4 flex flex-row gap-4 items-start w-full">
      {/* Column 1: Information */}
      <div className="space-y-2 flex-1 min-w-0">
        {/* Topic if available */}
        {session.topic && (
          <div className="font-semibold text-dark-blue text-sm">
            {session.topic}
          </div>
        )}
        
        {/* Line 1: Time, Course, Type, Mode, Status */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-dark-blue">
            {format(parseUTC(session.start_time), "EEE · MMM dd, HH:mm")} -{" "}
            {format(parseUTC(session.end_time), "HH:mm")}
          </span>
          <span className="text-black/30">·</span>
          {getCourseTag(session.course_code, session.course_name)}
          {getTypeTag(session.session_request_type)}
          {getModeTag(session.mode)}
          {getStatusTag(session.status)}
        </div>

        {/* Line 2: Tutor, Attachments, Feedback, Location, Capacity */}
        <div className="flex flex-wrap items-center gap-2 text-[0.75rem] text-black/70">
          <span className="font-medium">{session.tutor_name}</span>
          <span className="text-black/30">|</span>
          <span className="text-black/50"> None</span> {/* Attachments placeholder */}
          <span className="text-black/30">|</span>
          {getFeedbackDisplay()}
          <span className="text-black/30">|</span>
          <span className="text-black/50">{session.location || "None"}</span>
          <span className="text-black/30">|</span>
          <span className="font-medium text-dark-blue">
            {currentCapacity}/{maxCapacity}
          </span>
        </div>
      </div>

      {/* Column 2: Action Buttons */}
      <div className="ml-auto flex flex-row w-40 gap-2 flex-shrink-0">
        {showSolve && onSolve && (
          <button
            onClick={() => onSolve(session)}
            className="w-full h-10 rounded-md bg-blue-500 text-white text-sm font-semibold px-3 py-2 hover:bg-blue-600 transition whitespace-nowrap"
          >
            Solve
          </button>
        )}
        {showFeedback && onFeedback && (
          <button
            onClick={() => onFeedback(session)}
            className="w-full h-[40px] rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-3 py-2 hover:bg-light-blue transition whitespace-nowrap"
          >
            Feedback
          </button>
        )}
        {showReschedule && onReschedule && (
          <button
            onClick={() => onReschedule(session)}
            className="flex-1 h-10 rounded-md bg-white text-amber-700 text-sm font-semibold border border-amber-200 px-3 py-2 hover:bg-amber-50 transition whitespace-nowrap"
          >
            Reschedule
          </button>
        )}
        {showCancel && onCancel && (
          <button
            onClick={() => onCancel(session)}
            className="flex-1 h-10 rounded-md bg-white text-red-500 text-sm font-semibold border border-red-200 px-3 py-2 hover:bg-red-50 transition whitespace-nowrap"
          >
            {session.is_public ? "Leave" : "Cancel"}
          </button>
        )}
      </div>
    </article>
  );
}