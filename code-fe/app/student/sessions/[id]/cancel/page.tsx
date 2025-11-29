"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { swalSuccess } from '@/lib/swal';

type SessionData = {
  sessionId: string;
  tutorName: string;
  course: string;
  slot: string;
};

export default function CancelSessionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    // In production, fetch session data using params.id
    // For now, use mock data
    const mockData: SessionData = {
      sessionId: params.id as string,
      tutorName: searchParams.get("tutor") || "Nguyen T. A.",
      course: searchParams.get("course") || "Programming Fundamentals (CO1001)",
      slot: searchParams.get("slot") || "Wed · 14:00 – 15:30 · Room B4-205 / Online",
    };
    setSessionData(mockData);
  }, [params.id, searchParams]);

  const handleConfirm = async () => {
    // TODO: call backend to cancel session
    await swalSuccess("Session cancelled successfully!");
    router.push("/student/my-sessions");
  };

  const handleKeepSession = () => {
    router.back();
  };

  if (!sessionData) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-blue font-semibold mb-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-black/10 p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-dark-blue mb-2">
          Cancel session?
        </h1>
        <p className="text-sm text-black/70 mb-3">
          {sessionData.tutorName} · {sessionData.course}
        </p>
        <p className="text-sm text-black/60 mb-4">
          Slot: {sessionData.slot}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-[0.7rem] text-amber-800">
            You can cancel up to <b>2h before start</b>. This will notify the tutor and free the slot for other students. (FR-SCH.03)
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleKeepSession}
            className="px-4 py-2 rounded-md bg-white border border-black/10 text-sm font-medium hover:bg-soft-white-blue transition"
          >
            Keep session
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition"
          >
            Confirm cancel
          </button>
        </div>
      </div>
    </div>
  );
}
