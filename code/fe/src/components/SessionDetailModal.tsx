"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { parseUTC } from "@/lib/dateUtils";
import { BASE_API_URL } from "@/config/env";

interface Student {
  id: string;
  student_id: string;
  full_name: string;
  status: string;
}

interface Session {
  id: string;
  course_code: string;
  course_name: string;
  start_time: string;
  end_time: string;
  mode: string;
  location?: string;
  session_request_type: string;
  students: Student[];
  max_capacity: number;
  status: string;
  note?: string;
}

interface SessionDetailModalProps {
  session: Session;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLocation: string) => Promise<void>;
}

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onSave,
}: SessionDetailModalProps) {
  const [location, setLocation] = useState(session.location || "");
  const [isEditable, setIsEditable] = useState(false);
  const [isParticipationEditable, setIsParticipationEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if session can still be edited (before start time)
  useEffect(() => {
    const checkEditability = () => {
      const now = new Date();
      const startTime = parseUTC(session.start_time);
      setIsEditable(now < startTime);
      
      // Participation can be edited from 30 min before to 1 day after start
      const thirtyMinBefore = new Date(startTime.getTime() - 30 * 60 * 1000);
      const oneDayAfter = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);
      setIsParticipationEditable(now >= thirtyMinBefore && now <= oneDayAfter);
    };

    checkEditability();
    // Update editability every minute
    const interval = setInterval(checkEditability, 60000);
    return () => clearInterval(interval);
  }, [session.start_time]);

  const handleSave = async () => {
    if (!isEditable) return;
    
    setIsSaving(true);
    try {
      await onSave(location);
      onClose();
    } catch (error) {
      console.error("Failed to save session:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocation(session.location || "");
    onClose();
  };

  const handleParticipationChange = async (studentId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `${BASE_API_URL}/sessions/${session.id}/students/${studentId}/participation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update participation");
      }

      // Refresh the page or update local state
      window.location.reload();
    } catch (err) {
      console.error("Error updating participation:", err);
      alert(err instanceof Error ? err.message : "Failed to update participation status");
    }
  };

  const getModeLabel = (mode: string) => {
    const labels: { [key: string]: string } = {
      ONLINE: "Online",
      CAMPUS_1: "Campus 1",
      CAMPUS_2: "Campus 2",
    };
    return labels[mode] || mode;
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ONE_ON_ONE: "1-on-1",
      PRIVATE_GROUP: "Private Group",
      PUBLIC_GROUP: "Public Group",
    };
    return labels[type] || type;
  };

  // For completed sessions, show all students. For active sessions, filter out cancelled ones
  const activeStudents = session.status === "COMPLETED" 
    ? (session.students || [])
    : (session.students?.filter((s) => s.status !== "CANCELLED") || []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {session.course_code}: {session.course_name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {format(parseUTC(session.start_time), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Session Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <p className="mt-1 text-gray-900">
                {format(parseUTC(session.start_time), "HH:mm")} -{" "}
                {format(parseUTC(session.end_time), "HH:mm")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <p className="mt-1 text-gray-900">
                {getTypeLabel(session.session_request_type)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mode
              </label>
              <p className="mt-1 text-gray-900">{getModeLabel(session.mode)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <p className="mt-1 text-gray-900">
                {activeStudents.length} / {session.max_capacity}
              </p>
            </div>
          </div>

          {/* Location Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location {!isEditable && <span className="text-gray-400">(Read-only)</span>}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={!isEditable}
              className={`w-full px-3 py-2 border rounded-md ${
                isEditable
                  ? "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
              }`}
              placeholder={session.mode === "ONLINE" ? "Meeting link (e.g., Zoom, Google Meet)" : "Room number or building"}
            />
          </div>

          {/* Student Note (if any) */}
          {session.note && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student&apos;s Note
              </label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                {session.note}
              </p>
            </div>
          )}

          {/* Student List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Students ({activeStudents.length})
            </label>
            <div className="border border-gray-200 rounded-md divide-y">
              {activeStudents.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  No students enrolled yet
                </div>
              ) : (
                activeStudents.map((student) => (
                  <div
                    key={student.id}
                    className="px-4 py-3 flex justify-between items-center hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {student.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {student.student_id}
                      </p>
                    </div>
                    {isParticipationEditable ? (
                      <select
                        value={student.status}
                        onChange={(e) => handleParticipationChange(student.id, e.target.value)}
                        className="px-2 py-1 text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="ATTENDED">Attended</option>
                        <option value="ABSENT">Absent</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          student.status === "ATTENDED"
                            ? "bg-green-100 text-green-800"
                            : student.status === "ABSENT"
                            ? "bg-red-100 text-red-800"
                            : student.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {student.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* File Attachments Section - Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Session Materials
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                {isEditable
                  ? "File upload feature coming soon"
                  : "No materials attached"}
              </p>
            </div>
          </div>

          {/* Edit Lock Notice */}
          {!isEditable && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-yellow-700">
                  This session has already started. Changes are no longer allowed.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
