"use client";

import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const router = useRouter();

  // mock tạm – sau nối API thì thay
  const nextSession = {
    time: "Wed · 14:00 – 15:30",
    room: "B4-205 / Online",
    tutor: "Tutor Thao",
    course: "CO1001 – Programming Fundamentals",
  };

  const pendingFeedbackCount = 1;
  const unreadNotiCount = 2;

  return (
    <div className="min-h-screen bg-soft-white-blue font-sans text-black">
      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        {/* greeting */}
        <h1 className="text-2xl font-semibold text-dark-blue mb-4">
          Welcome back,&nbsp;
          <span className="text-light-heavy-blue">Student!</span>
        </h1>

        {/* ===== SESSION OVERVIEW (mới thêm) ===== */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-black/10 mb-8">
          <h2 className="text-dark-blue font-semibold text-lg mb-3">
            Session overview
          </h2>

          <div className="grid md:grid-cols-3 gap-4 text-sm text-black/80">
            {/* next session */}
            <div className="bg-soft-white-blue/60 p-3 rounded-lg border border-black/5">
              <p className="text-xs text-black/60 mb-1">Next session</p>
              <p className="font-semibold text-dark-blue leading-tight">
                {nextSession.time}
              </p>
              <p className="text-xs text-black/50">
                {nextSession.tutor} · {nextSession.room}
              </p>
              <p className="text-xs text-black/40 mt-1">
                {nextSession.course}
              </p>
            </div>

            {/* pending feedback */}
            <div className="bg-soft-white-blue/60 p-3 rounded-lg border border-black/5 flex flex-col">
              <p className="text-xs text-black/60 mb-1">Pending feedback</p>
              <p className="font-semibold text-dark-blue leading-tight">
                {pendingFeedbackCount > 0
                  ? `${pendingFeedbackCount} session awaiting`
                  : "No pending feedback"}
              </p>
              <button
                onClick={() => router.push("/student/feedback")}
                className="text-xs font-medium text-light-light-blue hover:underline mt-2 w-fit"
              >
                Submit now →
              </button>
            </div>

            {/* notifications */}
            <div className="bg-soft-white-blue/60 p-3 rounded-lg border border-black/5 flex flex-col">
              <p className="text-xs text-black/60 mb-1">Notifications</p>
              <p className="font-semibold text-dark-blue leading-tight">
                {unreadNotiCount} unread
              </p>
              <p className="text-xs text-black/50">
                Reminder · System update · Tutor replies
              </p>
              <button
                onClick={() => router.push("/student/notifications")}
                className="text-xs font-medium text-light-light-blue hover:underline mt-2 w-fit"
              >
                View all →
              </button>
            </div>
          </div>
        </div>

        {/* ===== 3 QUICK CARDS (giữ layout cũ của bạn) ===== */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* card 1 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-black/10 hover:shadow-md transition">
            <h2 className="text-dark-blue font-semibold text-sm mb-1">
              Upcoming Session
            </h2>
            <p className="text-sm text-black/70">
              {nextSession.course} · {nextSession.time}
            </p>
            <button
              onClick={() => router.push("/student/my-session")}
              className="mt-3 text-sm font-semibold text-light-light-blue hover:underline"
            >
              View details →
            </button>
          </div>

          {/* card 2 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-black/10 hover:shadow-md transition">
            <h2 className="text-dark-blue font-semibold text-sm mb-1">
              AI Smart Match
            </h2>
            <p className="text-sm text-black/70">
              We found 3 tutors who fit your learning pattern!
            </p>
            <button
              onClick={() => router.push("/student/ai-tools")}
              className="mt-3 text-sm font-semibold text-light-light-blue hover:underline"
            >
              Try now →
            </button>
          </div>

          {/* card 3 */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-black/10 hover:shadow-md transition">
            <h2 className="text-dark-blue font-semibold text-sm mb-1">
              Feedback Summary
            </h2>
            <p className="text-sm text-black/70">Your average: 4.8 / 5</p>
            <button
              onClick={() => router.push("/student/feedback-summary")}
              className="mt-3 text-sm font-semibold text-light-light-blue hover:underline"
            >
              View reports →
            </button>
          </div>
        </div>

        {/* ===== AI + RESOURCES ===== */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {/* AI block */}
          <div className="bg-dark-blue/90 text-white rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-2">
              AI-Powered Learning Assistant
            </h2>
            <p className="text-sm text-white/80 mb-4">
              Generate custom quizzes, get study tips, or find the best tutors
              with our AI integration.
            </p>
            <button
              onClick={() => router.push("/student/ai-tools")}
              className="bg-light-light-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-light-heavy-blue transition"
            >
              Explore AI Tools
            </button>
          </div>

          {/* Resources */}
          <div className="bg-white rounded-xl p-6 border border-black/10 shadow-sm">
            <h2 className="text-lg font-semibold text-dark-blue mb-2">
              Resource Library
            </h2>
            <p className="text-sm text-black/70 mb-3">
              Access HCMUT materials, notes, and past-year exams.
            </p>
            <ul className="list-disc list-inside text-sm text-black/80 space-y-1">
              <li>Advanced Mathematics Practice Set</li>
              <li>Physics Review Notes (2024)</li>
              <li>Intro to Machine Learning – Lecture Slides</li>
            </ul>
            <button
              onClick={() => router.push("/student/library")}
              className="mt-4 text-sm font-semibold text-light-light-blue hover:underline"
            >
              View all resources →
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-xs text-black/60 py-8">
        © 2025 Tutor Support System · Ho Chi Minh City University of Technology (HCMUT)
      </footer>
    </div>
  );
}
