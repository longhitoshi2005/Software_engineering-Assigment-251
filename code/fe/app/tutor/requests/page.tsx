"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestCard from "@/components/TutorReviewRequest";
import { BASE_API_URL } from "@/config/env";

// --- Mini Data Interface ---
interface SessionMiniData {
    id: string;
    student_id: string;
    student_name: string;
    course_code: string;
    course_name: string;
    start_time: string;
    end_time: string;
    status: string;
    session_request_type?: string;
    mode: string;
}

export default function TutorRequestsPage() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<SessionMiniData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingConflicts, setRejectingConflicts] = useState(false);
  
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/sessions/?role=tutor`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const sessions: SessionMiniData[] = await response.json();
      const pending = sessions.filter(s => s.status === "WAITING_FOR_TUTOR" || s.status === "WAITING_FOR_STUDENT");
      setPendingRequests(pending);

    } catch (error) {
      console.error("Error loading sessions:", error);
      alert("Failed to load session requests");
    } finally {
      setLoading(false);
    }
  };

  const rejectConflictingRequests = async () => {
    if (!confirm("This will reject all session requests that conflict with your confirmed sessions. Continue?")) {
      return;
    }

    setRejectingConflicts(true);
    let rejectedCount = 0;
    let failedCount = 0;

    try {
      // Get all sessions (including confirmed ones)
      const response = await fetch(`${BASE_API_URL}/sessions/?role=tutor`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load sessions");

      const allSessions: SessionMiniData[] = await response.json();
      
      // Get confirmed sessions (these are the busy slots)
      const confirmedSessions = allSessions.filter(s => s.status === "CONFIRMED");

      // Get available slots
      const availabilityResponse = await fetch(`${BASE_API_URL}/availability/me`, {
        credentials: "include",
      });
      
      let availableSlots: any[] = [];
      if (availabilityResponse.ok) {
        availableSlots = await availabilityResponse.json();
      }

      // For each pending request, check if it conflicts with confirmed sessions or lacks availability
      for (const request of pendingRequests) {
        const requestStart = new Date(request.start_time).getTime();
        const requestEnd = new Date(request.end_time).getTime();

        // Check if request overlaps with any confirmed session
        const hasConflict = confirmedSessions.some((confirmed) => {
          const confirmedStart = new Date(confirmed.start_time).getTime();
          const confirmedEnd = new Date(confirmed.end_time).getTime();
          
          // Check for overlap: request starts before confirmed ends AND request ends after confirmed starts
          return (requestStart < confirmedEnd && requestEnd > confirmedStart);
        });

        // Check if there's an available slot that covers this request
        const hasAvailableSlot = availableSlots.some((slot) => {
          if (slot.is_booked) return false; // Skip booked slots
          
          const slotStart = new Date(slot.start_time).getTime();
          const slotEnd = new Date(slot.end_time).getTime();
          
          // Check if slot fully covers the request time
          return (slotStart <= requestStart && slotEnd >= requestEnd);
        });

        // Reject if there's a conflict OR no available slot
        if (hasConflict || !hasAvailableSlot) {
          const reason = hasConflict 
            ? "I'm no longer available at the requested time slot (conflict with confirmed session)"
            : "I'm no longer available at the requested time slot (availability removed)";
          
          try {
            const rejectResponse = await fetch(`${BASE_API_URL}/sessions/${request.id}/reject`, {
              method: "PUT",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reason }),
            });

            if (rejectResponse.ok) {
              rejectedCount++;
            } else {
              failedCount++;
            }
          } catch (error) {
            console.error(`Failed to reject session ${request.id}:`, error);
            failedCount++;
          }
        }
      }

      alert(`Rejected ${rejectedCount} conflicting request(s). ${failedCount > 0 ? `Failed: ${failedCount}` : ''}`);
      loadSessions(); // Reload the list

    } catch (error) {
      console.error("Error rejecting conflicts:", error);
      alert("Failed to check for conflicts");
    } finally {
      setRejectingConflicts(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center py-10">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Incoming Session Requests
          </h1>
          <p className="text-sm text-black/70 mt-1 max-w-2xl">
            Review and take action on student booking requests
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={rejectConflictingRequests}
            disabled={rejectingConflicts || pendingRequests.length === 0}
            className="rounded-md bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-4 py-1.5 text-sm text-white transition"
          >
            {rejectingConflicts ? "Processing..." : "Clear Conflicting Requests"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm text-dark-blue hover:bg-white transition"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        {pendingRequests.length === 0 ? (
          <div className="bg-white rounded-lg border border-black/5 p-8 text-center">
             <p className="text-sm text-black/40 italic">No pending requests right now.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingRequests.map((sessionMiniData) => (
              <RequestCard 
                key={sessionMiniData.id}
                sessionMiniData={sessionMiniData}
                onActionComplete={loadSessions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}