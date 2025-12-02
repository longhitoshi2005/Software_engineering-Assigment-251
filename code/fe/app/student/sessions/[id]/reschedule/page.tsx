"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { swalError, swalSuccess } from '@/lib/swal';

type SessionData = {
  sessionId: string;
  tutorName: string;
  course: string;
  currentSlot: string;
};

export default function RescheduleSessionPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [newSlot, setNewSlot] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    // In production, fetch session data using params.id
    // For now, use mock data
    const mockData: SessionData = {
      sessionId: params.id as string,
      tutorName: searchParams.get("tutor") || "Nguyen T. A.",
      course: searchParams.get("course") || "Programming Fundamentals (CO1001)",
      currentSlot: searchParams.get("slot") || "Wed · 14:00 – 15:30 · Room B4-205 / Online",
    };
    setSessionData(mockData);
  }, [params.id, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSlot) {
      await swalError("Please select a new time slot");
      return;
    }

    // TODO: call backend to reschedule
    await swalSuccess("Request submitted","Tutor will see your rescheduled request");
    router.push("/student/my-sessions");
  };

  const handleCancel = () => {
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
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center px-4 py-6">
      <div className="max-w-3xl w-full bg-white rounded-xl border border-black/10 p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-dark-blue mb-2">
          Reschedule session
        </h1>
        <p className="text-sm text-black/60 mb-6">
          {sessionData.tutorName} · {sessionData.course} · current: {sessionData.currentSlot}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-blue mb-1">
              New time slot
            </label>
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-light-blue bg-soft-white-blue/40"
              required
            >
              <option value="">Select a new slot</option>
              <option>Wed · 16:00 – 17:30 · Online</option>
              <option>Thu · 09:00 – 10:30 · B4-205</option>
              <option>Fri · 14:00 – 15:30 · Online</option>
            </select>
            <p className="text-[0.7rem] text-black/50 mt-1">
              Only free slots from this tutor are shown. (FR-SCH.01)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-blue mb-1">
              Note to tutor (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-black/10 rounded-md px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-light-light-blue"
              placeholder="Example: I have exam in the morning, can we move to Thu 9:00?"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-[0.7rem] text-amber-800">
              You can reschedule up to <b>2h before the original start time</b>. (FR-SCH.03)
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5">
            <p className="text-[0.7rem] text-black/50 max-w-sm">
              The tutor will be notified and the new slot will be held for you.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-md bg-white border border-black/10 text-sm font-medium hover:bg-soft-white-blue transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-light-heavy-blue text-white text-sm font-semibold hover:bg-light-blue transition"
              >
                Confirm reschedule
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
