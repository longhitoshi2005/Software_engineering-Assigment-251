"use client";

import { TUTOR_DASH_FEEDBACKS } from "@/lib/mocks";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type FeedbackItem = {
  id: string;
  student: string;
  subject: string;
  rating: number;    // 1..5
  comment: string;
  date: string;      // chuỗi mock sẵn để tránh hydration mismatch
};

export default function TutorFeedbackDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const list = (TUTOR_DASH_FEEDBACKS as FeedbackItem[]) ?? [];
  const idx  = list.findIndex((f) => String(f.id) === String(id));
  const item = idx >= 0 ? list[idx] : undefined;

  // --- UI helpers ---
  const Stars = ({ n }: { n: number }) => (
    <span aria-label={`${n} out of 5 stars`} title={`${n}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (i < n ? "★" : "☆"))}
    </span>
  );

  const sentimentOf = (rating: number) =>
    rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";

  const SentimentBadge = ({ rating }: { rating: number }) => {
    const s = sentimentOf(rating);
    const cls =
      s === "positive"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
        : s === "negative"
        ? "bg-red-50 text-red-700 border border-red-200"
        : "bg-amber-50 text-amber-700 border border-amber-200";
    const text = s === "positive" ? "Positive" : s === "negative" ? "Negative" : "Neutral";
    return (
      <span className={`px-2 py-[3px] rounded-md text-[0.7rem] font-semibold ${cls}`}>
        {text}
      </span>
    );
  };

  if (!item) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto bg-white border border-black/5 rounded-xl p-6">
          <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Feedback not found</h1>
          <p className="text-sm text-black/60 mt-2">
            ID: <code>{id}</code>
          </p>
          <div className="mt-4 flex gap-2">
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

  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-xs text-black/60">
          <Link href="/tutor/dashboard" className="hover:underline">
            Tutor Dashboard
          </Link>{" "}
          / <span className="text-black/70">Feedback</span> /{" "}
          <span className="text-black/80 font-medium">{item.id}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
              Feedback Detail
            </h1>
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

        {/* Summary Card */}
        <section className="bg-white border border-black/5 rounded-xl p-6 space-y-4">
          {/* Top row: title + rating */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm text-black/60">Feedback ID</div>
              <div className="text-base font-semibold text-dark-blue">{item.id}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-black/60">Rating</div>
              <div className="text-base font-bold text-dark-blue flex items-center gap-2 justify-end">
                <Stars n={Number(item.rating) || 0} />
                <span className="text-sm text-black/70">({item.rating}/5)</span>
                <SentimentBadge rating={Number(item.rating) || 0} />
              </div>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="text-sm text-black/60">Student</div>
              <div className="text-base font-medium">{item.student}</div>
            </div>
            <div>
              <div className="text-sm text-black/60">Subject</div>
              <div className="text-base font-medium">{item.subject}</div>
            </div>
            <div>
              <div className="text-sm text-black/60">Date</div>
              <div className="text-base font-medium">{item.date}</div>
            </div>
          </div>

          {/* Comment */}
          <div className="pt-2">
            <div className="text-sm text-black/60 mb-1">Comment</div>
            <div className="text-[0.95rem] text-black/80 leading-relaxed bg-soft-white-blue/40 border border-soft-white-blue rounded-lg p-3">
              {item.comment}
            </div>
          </div>
        </section>

        {/* Related navigation */}
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
