"use client";

import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay, parseISO } from "date-fns";
import TutorSessionCard from "@/components/TutorSessionCard";
import SessionDetailModal from "@/components/SessionDetailModal";
import TutorSessionCalendar from "@/components/TutorSessionCalendar";
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

type SortOption = "time" | "course" | "students" | "type";

export default function TutorSessionsTodayPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("time");

  // Fetch tutor sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${BASE_API_URL}/sessions/?role=tutor`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // Filter sessions by selected date
  const filteredSessions = sessions.filter((session) => {
    const sessionDate = parseISO(session.start_time);
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    return sessionDate >= dayStart && sessionDate <= dayEnd;
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case "time":
        return (
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
      case "course":
        return a.course_code.localeCompare(b.course_code);
      case "students":
        const aCount = a.students.filter((s) => s.status !== "CANCELLED").length;
        const bCount = b.students.filter((s) => s.status !== "CANCELLED").length;
        return bCount - aCount;
      case "type":
        return a.session_request_type.localeCompare(b.session_request_type);
      default:
        return 0;
    }
  });

  // Handle session location update
  const handleSaveSession = async (updatedLocation: string) => {
    if (!selectedSession) return;

    try {
      const response = await fetch(
        `${BASE_API_URL}/sessions/${selectedSession.id}/location`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ location: updatedLocation }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update session");
      }

      // Update local state
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedSession.id ? { ...s, location: updatedLocation } : s
        )
      );

      // Update selected session for modal
      setSelectedSession({ ...selectedSession, location: updatedLocation });
    } catch (err) {
      console.error("Error updating session:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading sessions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Your Sessions</h1>
        <p className="text-gray-600 mt-1">
          Manage and prepare for your upcoming sessions
        </p>
      </header>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column - Calendar (sticky on large screens) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <TutorSessionCalendar
              sessions={sessions}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {sortedSessions.length}{" "}
                {sortedSessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Session list */}
        <div className="lg:col-span-3">
          {/* Sort controls */}
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="time">Time</option>
              <option value="course">Course</option>
              <option value="students">Number of Students</option>
              <option value="type">Session Type</option>
            </select>
          </div>

          {/* Session list */}
          <div className="space-y-3">
            {sortedSessions.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No sessions on this day
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a different date from the calendar to view sessions.
                </p>
              </div>
            ) : (
              sortedSessions.map((session) => (
                <TutorSessionCard
                  key={session.id}
                  session={session}
                  onClick={() => setSelectedSession(session)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          onSave={handleSaveSession}
        />
      )}
    </div>
  );
}