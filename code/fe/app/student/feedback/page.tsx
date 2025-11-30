"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { swalConfirm, swalSuccess } from "@/lib/swal";

type FeedbackSession = {
  id: string;
  datetime: string;
  course: string;
  tutorName: string;
  focus?: string;
};

function SubmitFeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = async () => {
    // If we have unsaved changes, warn the user first
    const initial = initialRef.current;
    const dirty = !!(
      initial && (
        initial.overall !== overall ||
        initial.clarity !== clarity ||
        initial.helpedMost !== helpedMost ||
        initial.improve !== improve
      )
    );

    if (dirty) {
      const leave = await swalConfirm(
        "You have unsaved changes on this feedback form.",
        "Leave this page and discard changes?",
        { confirmText: "Leave", cancelText: "Stay" }
      );
      if (!leave) return; // stay on page
    }

    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/student/feedback-summary");
    }
  };

  // Mock session data - in production, get from URL params or API
  const [session, setSession] = useState<FeedbackSession | null>(null);
  const [overall, setOverall] = useState("5 - Extremely helpful");
  const [clarity, setClarity] = useState("Very clear");
  const [helpedMost, setHelpedMost] = useState("");
  const [improve, setImprove] = useState("");

  // Keep a snapshot of the initial form values after session loads so we can
  // detect unsaved changes (dirty state) when the user attempts to navigate away.
  const initialRef = useRef<{
    overall: string;
    clarity: string;
    helpedMost: string;
    improve: string;
  } | null>(null);

  useEffect(() => {
    // In production, fetch session data or check URL params
    const mockSession: FeedbackSession = {
      id: searchParams.get("sessionId") || "SESS-2025-10-27-1400",
      datetime: searchParams.get("datetime") || "Mon · Oct 27 · 09:00 – 10:30 · C2-301",
      course: searchParams.get("course") || "Calculus I (MA1001)",
      tutorName: searchParams.get("tutor") || "Pham Q. T.",
      focus: searchParams.get("focus") || "Midterm-style timed drills",
    };
    setSession(mockSession);
  }, [searchParams]);

  // When session becomes available, capture the current form defaults as the
  // baseline (not-yet-edited) values. This allows detecting edits later.
  useEffect(() => {
    if (session) {
      initialRef.current = {
        overall,
        clarity,
        helpedMost,
        improve,
      };
    }
    // We only want to capture once when session is set, so intentionally
    // ignore dependencies on form fields here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Redirect if no session
  useEffect(() => {
    if (session === null) {
      // Give it a moment to load
      const timer = setTimeout(() => {
        if (!session) {
          router.replace("/student/my-sessions");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  const handleSaveDraft = async () => {
    // TODO: call API to save draft
    await swalSuccess("Draft saved");
    router.push("/student/feedback-summary");
  };

  const handleSubmit = async () => {
    // TODO: call API to submit
    await swalSuccess("Feedback submitted");
    router.push("/student/feedback-summary");
  };

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-blue font-semibold mb-2">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* HEADER */}
      <div>
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-light-heavy-blue hover:underline inline-flex items-center gap-1 mb-2"
          >
            ← Back to feedback summary
          </button>
        </div>
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Submit Feedback
          </h1>
          <p className="text-sm text-black/70 mt-1">
            This feedback will be linked to your tutoring session and used for
            quality improvement. Only aggregated results are shared with
            departments.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex gap-2 justify-end">
            <span className="px-2 py-1 rounded-md text-[0.68rem] font-semibold bg-light-heavy-blue text-white">
              Active
            </span>
            <span className="px-2 py-1 rounded-md text-[0.68rem] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Deadline: in 18h
            </span>
          </div>
          <p className="text-[0.7rem] text-black/50">
            Session ID: <b>#{session.id}</b>
            <br />
            You can edit within 24h after submission.
          </p>
        </div>
      </header>

      {/* MAIN CARD */}
      <main className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-6 mb-10">
        {/* Session summary */}
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-base md:text-lg font-semibold text-dark-blue">
              Session Summary
            </h2>
            <p className="text-[0.68rem] text-black/50">
              UC.04 Submit Session Feedback · FR-FBK.01
            </p>
          </div>
          <div className="bg-soft-white-blue/60 border border-soft-white-blue rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-semibold text-dark-blue">
                {session.datetime}
              </p>
              <span className="inline-flex items-center rounded-md bg-light-light-blue/10 text-light-light-blue text-[0.65rem] font-semibold px-2 py-[3px] border border-light-light-blue/40">
                {session.course}
              </span>
            </div>
            <p className="text-[0.7rem] text-black/70">
              Tutor: <b>{session.tutorName}</b>
              {session.focus ? (
                <>
                  {" "}
                  · Focus: <span className="text-black/60">{session.focus}</span>
                </>
              ) : null}
            </p>
            <p className="text-[0.68rem] text-black/50">
              Your goal (from booking): &quot;I keep getting segmentation faults and I
              don&apos;t understand stack frames.&quot;
            </p>
          </div>
        </div>

        {/* FORM */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* overall */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-dark-blue mb-1 flex items-center justify-between gap-2">
              Overall helpfulness
              <span className="text-[0.65rem] font-normal text-black/50">
                1 = not helpful, 5 = extremely helpful
              </span>
            </label>
            <select
              value={overall}
              onChange={(e) => setOverall(e.target.value)}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/60"
            >
              <option>5 - Extremely helpful</option>
              <option>4 - Helpful</option>
              <option>3 - Average</option>
              <option>2 - Not very helpful</option>
              <option>1 - Not helpful at all</option>
            </select>
            <p className="text-[0.65rem] text-black/50 mt-1">
              This is used in tutor quality reports.
            </p>
          </div>

          {/* clarity */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-dark-blue mb-1 flex items-center justify-between gap-2">
              Clarity of explanation
              <span className="text-[0.65rem] font-normal text-black/50">
                Did you understand the concepts better?
              </span>
            </label>
            <select
              value={clarity}
              onChange={(e) => setClarity(e.target.value)}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/60"
            >
              <option>Very clear</option>
              <option>Mostly clear</option>
              <option>Somewhat unclear</option>
              <option>Confusing</option>
            </select>
            <p className="text-[0.65rem] text-black/50 mt-1">
              Low clarity flags coordinator to support the tutor.
            </p>
          </div>

          {/* helped most */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-dark-blue mb-1">
              What helped you the most?
            </label>
            <textarea
              value={helpedMost}
              onChange={(e) => setHelpedMost(e.target.value)}
              rows={3}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/60 resize-y"
              placeholder="Example: They made me trace pointer values step by step and explain out loud, which made it click."
            />
            <p className="text-[0.65rem] text-black/50 mt-1">
              We may quote this (anonymized) to improve tutor training.
            </p>
          </div>

          {/* improve */}
          <div className="flex flex-col md:col-span-2">
            <label className="text-xs font-semibold text-dark-blue mb-1 flex items-center justify-between gap-2">
              Anything we should improve for next time?
              <span className="text-[0.65rem] font-normal text-black/50">
                Optional
              </span>
            </label>
            <textarea
              value={improve}
              onChange={(e) => setImprove(e.target.value)}
              rows={3}
              className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/60 resize-y"
              placeholder="Example: I wish we had 15 more minutes to finish the last recursion question."
            />
            <p className="text-[0.65rem] text-black/50 mt-1">
              If you report serious issues (behavior, respect, safety),
              coordinators will be alerted.
            </p>
          </div>
        </form>

        {/* action bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-black/5">
          <div className="text-[0.65rem] text-black/50 max-w-lg">
            • <b>Save Draft</b>: You can come back and finish before the deadline (AF3). <br />
            • <b>Submit Feedback</b>: Locks in your response. You can still edit it for 24h (AF5). <br />
            • If you do nothing before the deadline, this session will be marked{" "}
            <b>&quot;Feedback Skipped&quot;</b>.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="rounded-md border border-light-heavy-blue/80 text-light-heavy-blue bg-white px-4 py-2 text-sm font-semibold hover:bg-soft-white-blue/60 transition"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-light-heavy-blue text-white px-4 py-2 text-sm font-semibold hover:bg-light-blue transition"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SubmitFeedbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmitFeedbackContent />
    </Suspense>
  );
}
