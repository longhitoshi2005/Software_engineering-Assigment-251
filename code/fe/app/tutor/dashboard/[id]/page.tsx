"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type FeedbackItem = {
  id: string;
  sessionId?: string | null;
  studentName: string;
  courseCode: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const DATE_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

const formatDateTime = (iso: string) => {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return dt.toLocaleString(undefined, DATE_FORMAT);
};

const sentimentOf = (rating: number) =>
  rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";

const Stars = ({ rating }: { rating: number }) => (
  <span aria-label={`${rating} out of 5 stars`} title={`${rating}/5`}>
    {Array.from({ length: 5 }).map((_, i) => (i < rating ? "★" : "☆"))}
  </span>
);

const SentimentBadge = ({ rating }: { rating: number }) => {
  const sentiment = sentimentOf(rating);
  const text = sentiment === "positive" ? "Positive" : sentiment === "negative" ? "Negative" : "Neutral";
  const className =
    sentiment === "positive"
      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
      : sentiment === "negative"
      ? "bg-red-50 text-red-700 border border-red-200"
      : "bg-amber-50 text-amber-700 border border-amber-200";
  return (
    <span className={`px-2 py-[3px] rounded-md text-[0.7rem] font-semibold ${className}`}>
      {text}
    </span>
  );
};

export default function TutorFeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const apiKey = process.env.NEXT_PUBLIC_TUTOR_API_KEY ?? "";
  const baseHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    if (apiKey) headers["x-api-key"] = apiKey;
    return headers;
  }, [apiKey]);

  const [feedback, setFeedback] = useState<FeedbackItem | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    const detailPromise = fetch(`/api/tutor/feedbacks/${id}`, {
      headers: { ...baseHeaders },
    });

    const listPromise = fetch(`/api/tutor/feedbacks`, {
      headers: { ...baseHeaders },
    }).catch(() => null);

    try {
      const [detailRes, listRes] = await Promise.all([detailPromise, listPromise]);

      const detailJson = await detailRes.json();
      if (!detailRes.ok || !detailJson?.success) {
        throw new Error(detailJson?.error || "Feedback not found");
      }
      const detailData: FeedbackItem = detailJson.data;
      setFeedback(detailData);

      if (listRes && listRes.ok) {
        const listJson = await listRes.json();
        if (listJson?.success && Array.isArray(listJson.data)) {
          const listData: FeedbackItem[] = listJson.data;
          if (!listData.find((item: FeedbackItem) => item.id === detailData.id)) {
            listData.push(detailData);
          }
          setFeedbacks(listData);
        }
      } else {
        setFeedbacks([detailData]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load feedback";
      setError(message);
      setFeedback(null);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  }, [id, baseHeaders]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentIndex = useMemo(() => feedbacks.findIndex((f) => f.id === id), [feedbacks, id]);
  const prev = currentIndex > 0 ? feedbacks[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < feedbacks.length - 1 ? feedbacks[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-black/5 rounded-xl p-6 text-sm text-black/60">
          Loading feedback…
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-black/5 rounded-xl p-6 space-y-3">
          <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Feedback not available</h1>
          <p className="text-sm text-black/60">
            {error ? error : "The requested feedback could not be found."}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-soft-white-blue transition"
            >
              ← Go Back
            </button>
            <Link
              href="/tutor/dashboard"
              className="rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-3 py-1.5 hover:bg-light-blue transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <nav className="text-xs text-black/60">
          <Link href="/tutor/dashboard" className="hover:underline">
            Tutor Dashboard
          </Link>{" "}/ <span className="text-black/70">Feedback</span> /{" "}
          <span className="text-black/80 font-medium">{feedback.id}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">Feedback Detail</h1>
            <p className="text-sm text-black/60">
              View student feedback, rating breakdown, and related information.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-soft-white-blue transition"
            >
              ← Back
            </button>
          </div>
        </div>

        <section className="bg-white border border-black/5 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm text-black/60">Feedback ID</div>
              <div className="text-base font-semibold text-dark-blue">{feedback.id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-black/60">Rating</div>
              <div className="text-base font-bold text-dark-blue flex items-center gap-2 justify-end">
                <Stars rating={Number(feedback.rating) || 0} />
                <span className="text-sm text-black/70">({feedback.rating}/5)</span>
                <SentimentBadge rating={Number(feedback.rating) || 0} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="text-sm text-black/60">Student</div>
              <div className="text-base font-medium">{feedback.studentName}</div>
            </div>
            <div>
              <div className="text-sm text-black/60">Course</div>
              <div className="text-base font-medium">{feedback.courseCode}</div>
            </div>
            <div>
              <div className="text-sm text-black/60">Received</div>
              <div className="text-base font-medium">{formatDateTime(feedback.createdAt)}</div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-sm text-black/60 mb-1">Comment</div>
            <div className="text-[0.95rem] text-black/80 leading-relaxed bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-3">
              {feedback.comment}
            </div>
          </div>
        </section>

        <section className="bg-white border border-black/5 rounded-xl p-4 flex items-center justify-between">
          <div className="text-sm text-black/60">Browse feedback</div>
          <div className="flex gap-2">
            <Link
              href={prev ? `/tutor/dashboard/${prev.id}` : "#"}
              aria-disabled={!prev}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                prev ? "hover:bg-soft-white-blue" : "opacity-50 cursor-not-allowed"
              }`}
            >
              ← Previous
            </Link>
            <Link
              href={next ? `/tutor/dashboard/${next.id}` : "#"}
              aria-disabled={!next}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                next ? "hover:bg-soft-white-blue" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Next →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
