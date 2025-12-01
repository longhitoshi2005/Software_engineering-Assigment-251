"use client";

import { format } from "date-fns";
import { parseUTC } from "@/lib/dateUtils";

type Session = {
  id: string;
  tutor_id: string;
  tutor_name: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  start_time: string;
  end_time: string;
  mode: string;
  location: string | null;
  status: string;
  note?: string | null;
  session_request_type?: string;
  max_capacity?: number;
  is_public?: boolean;
  current_capacity?: number;
  proposal?: {
    new_start_time?: string;
    new_end_time?: string;
    new_mode?: string;
    new_location?: string;
    tutor_message: string;
    new_max_capacity?: number;
    new_is_public?: boolean;
  } | null;
};

interface NegotiationModalProps {
  session: Session;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

export default function NegotiationModal({
  session,
  onClose,
  onAccept,
  onReject,
}: NegotiationModalProps) {
  if (!session.proposal) return null;

  const getModeLabel = (mode: string) => {
    const modeMap: Record<string, string> = {
      ONLINE: "Online",
      CAMPUS_1: "Campus 1",
      CAMPUS_2: "Campus 2",
    };
    return modeMap[mode] || mode;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-blue">
            Resolve Tutor&apos;s Counter-Offer
          </h3>
          <button
            onClick={onClose}
            className="text-sm text-black/50 hover:text-black"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-semibold text-dark-blue mb-2">
            Tutor&apos;s Message:
          </p>
          <p className="text-sm text-black/70">{session.proposal.tutor_message}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Original Request */}
          <div className="border border-black/10 rounded-lg p-4 bg-gray-50">
            <p className="text-xs text-black/50 font-semibold mb-3">
              Your Original Request
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-[0.7rem] text-black/50">Time</p>
                <p className="text-sm font-medium">
                  {format(parseUTC(session.start_time), "MMM dd, HH:mm")} -{" "}
                  {format(parseUTC(session.end_time), "HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-[0.7rem] text-black/50">Mode</p>
                <p className="text-sm font-medium">{getModeLabel(session.mode)}</p>
              </div>
              {session.location && (
                <div>
                  <p className="text-[0.7rem] text-black/50">Location</p>
                  <p className="text-sm font-medium">{session.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Proposed Changes */}
          <div className="border border-blue-500 rounded-lg p-4 bg-blue-50">
            <p className="text-xs text-blue-600 font-semibold mb-3">
              Tutor&apos;s Proposal
            </p>
            <div className="space-y-2">
              {session.proposal.new_start_time && (
                <div>
                  <p className="text-[0.7rem] text-blue-600">Time</p>
                  <p className="text-sm font-medium">
                    {format(parseUTC(session.proposal.new_start_time), "MMM dd, HH:mm")} -{" "}
                    {format(parseUTC(session.proposal.new_end_time!), "HH:mm")}
                  </p>
                </div>
              )}
              {session.proposal.new_mode && (
                <div>
                  <p className="text-[0.7rem] text-blue-600">Mode</p>
                  <p className="text-sm font-medium">
                    {getModeLabel(session.proposal.new_mode)}
                  </p>
                </div>
              )}
              {session.proposal.new_location && (
                <div>
                  <p className="text-[0.7rem] text-blue-600">Location</p>
                  <p className="text-sm font-medium">{session.proposal.new_location}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onReject}
            className="rounded-md border border-red-200 text-red-600 px-4 py-2 text-sm hover:bg-red-50"
          >
            Reject (Cancel Session)
          </button>
          <button
            onClick={onAccept}
            className="rounded-md bg-light-heavy-blue text-white px-4 py-2 text-sm hover:bg-light-blue"
          >
            Accept Changes
          </button>
        </div>
      </div>
    </div>
  );
}
