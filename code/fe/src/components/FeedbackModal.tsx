"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { swalError, swalSuccess } from "@/lib/swal";
import { BASE_API_URL } from "@/config/env";

type FeedbackModalProps = {
  sessionId: string;
  onClose: () => void;
  onSaved?: () => void;
};

type FeedbackData = {
  id: string;
  session: {
    id: string;
    tutor_name: string;
    course_code: string;
    course_name: string;
    start_time: string;
    end_time: string;
    mode: string;
    location: string | null;
  };
  rating: number | null;
  comment: string | null;
  status: "PENDING" | "SUBMITTED" | "SKIPPED";
  feedback_deadline: string;
  created_at: string;
  updated_at: string;
  can_edit: boolean;
};

export default function FeedbackModal({ sessionId, onClose, onSaved }: FeedbackModalProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  
  // Form state
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/feedback/session/${sessionId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 404) {
          await swalError("Feedback not found", "This session may not be completed yet.");
          onClose();
          return;
        }
        throw new Error("Failed to load feedback");
      }

      const data: FeedbackData = await response.json();
      setFeedback(data);
      setRating(data.rating || 0);
      setComment(data.comment || "");
    } catch (error) {
      console.error("Error loading feedback:", error);
      await swalError("Failed to load feedback", "Please try again later.");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const handleSave = async () => {
    if (!feedback) return;
    
    if (rating === 0) {
      await swalError("Rating required", "Please select a rating (1-5 stars).");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${BASE_API_URL}/feedback/session/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rating,
          comment: comment || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to save feedback");
      }

      await swalSuccess("Feedback saved", "Your feedback has been submitted successfully.");
      onSaved?.();
      onClose();
    } catch (error: any) {
      console.error("Error saving feedback:", error);
      await swalError("Failed to save feedback", error.message || "Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const getModeLabel = (mode: string) => {
    if (mode === "ONLINE") return "Online";
    if (mode === "CAMPUS_1") return "Campus 1";
    if (mode === "CAMPUS_2") return "Campus 2";
    return mode;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) return null;

  const isSkipped = feedback.status === "SKIPPED";
  const canEdit = feedback.can_edit && !isSkipped;
  const deadlinePassed = new Date(feedback.feedback_deadline) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-dark-blue">
              {canEdit ? "Submit Feedback" : "View Feedback"}
            </h2>
            <p className="text-sm text-black/60 mt-1">
              {format(parseISO(feedback.session.start_time), "MMMM dd, yyyy 'at' hh:mm a")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xl text-black/50 hover:text-black transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-soft-white-blue/30 rounded-lg">
          <div>
            <p className="text-xs text-black/60">Course</p>
            <p className="font-semibold text-dark-blue">
              {feedback.session.course_code} - {feedback.session.course_name}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60">Tutor</p>
            <p className="font-semibold text-dark-blue">{feedback.session.tutor_name}</p>
          </div>
          <div>
            <p className="text-xs text-black/60">Mode & Location</p>
            <p className="text-sm text-black/80">
              {getModeLabel(feedback.session.mode)} • {feedback.session.location || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-xs text-black/60">Feedback Deadline</p>
            <p className={`text-sm font-medium ${deadlinePassed ? "text-red-600" : "text-green-600"}`}>
              {format(parseISO(feedback.feedback_deadline), "MMM dd, yyyy hh:mm a")}
              {deadlinePassed && " (Expired)"}
            </p>
          </div>
        </div>

        {/* Skipped Message */}
        {isSkipped && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This feedback was automatically marked as skipped because the deadline passed without submission.
            </p>
          </div>
        )}

        {/* Rating */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-blue mb-2">
            Rating {canEdit && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={!canEdit}
                onClick={() => canEdit && setRating(star)}
                className={`text-4xl transition ${
                  canEdit ? "hover:scale-110 cursor-pointer" : "cursor-default"
                } ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              >
                ★
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-lg font-semibold text-dark-blue">{rating}.0 / 5.0</span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-dark-blue mb-2">
            Comment (Optional)
          </label>
          {canEdit ? (
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this tutoring session..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          ) : (
            <p className="text-sm text-black/80 p-3 bg-gray-50 rounded-lg">
              {feedback.comment || "No comment provided"}
            </p>
          )}
        </div>

        {/* Status Info */}
        {!canEdit && !isSkipped && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              ℹ️ This feedback has been submitted and can no longer be edited.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-black/70 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
          >
            {canEdit ? "Cancel" : "Close"}
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={saving || rating === 0}
              className="px-4 py-2 text-sm font-medium text-black/70 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? "Saving..." : "Save Feedback"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
