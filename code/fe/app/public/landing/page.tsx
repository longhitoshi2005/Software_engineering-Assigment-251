"use client";

import Link from "next/link";
import Image from "next/image";

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* === TOPBAR (copy từ Login) === */}
      <header className="h-18 md:h-20 bg-dark-blue flex items-center justify-between px-5 md:px-10">
        {/* Logo + brand */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 p-1 rounded-xl bg-white text-dark-blue flex items-center justify-center font-bold text-xs">
            <Image
              src="/logo-hcmut.png"
              alt="HCMUT logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-white font-bold text-sm md:text-base">
              TUTOR SUPPORT SYSTEM
            </div>
            <div className="text-white/60 text-[0.7rem]">
              Ho Chi Minh City University of Technology (HCMUT)
            </div>
          </div>
        </div>

        {/* Nav (ẩn trên mobile) */}
        <nav className="hidden lg:flex gap-6 text-white/90 text-sm font-medium">
          <Link href="/auth/login" className="hover:text-white transition">Login</Link>
        </nav>
      </header>

      {/* === MAIN (nội dung landing) === */}
      <main className="flex-1 flex justify-center px-4 md:px-10 py-10">
        <div className="w-full max-w-6xl grid md:grid-cols-[1.05fr_0.95fr] gap-6">
          {/* LEFT: Hero / actions */}
          <section className="bg-white border border-dark-blue/10 rounded-xl shadow-sm p-5 md:p-6">
            <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
              Get the help you need, when you need it.
            </h1>
            <p className="text-sm text-black/70 mt-2">
              Find a tutor, book a session, and track your learning progress — all integrated with HCMUT_SSO and DATACORE.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/find-tutor"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-light-heavy-blue text-white font-semibold hover:bg-[#00539a] transition text-sm"
              >
                Find a Tutor
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-dark-blue border border-soft-white-blue hover:bg-soft-white-blue/70 transition text-sm font-semibold"
              >
                Book a Session
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-light-heavy-blue border border-light-heavy-blue hover:bg-light-light-blue/10 transition text-sm font-semibold"
              >
                Sign in with HCMUT SSO
              </Link>
            </div>

            <div className="border-b border-black/10 my-5" />

            {/* How it works */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: "🔐", title: "Sign in", text: "Use your HCMUT account via SSO." },
                { icon: "🎯", title: "Smart match", text: "Pick a tutor or let the system suggest." },
                { icon: "📅", title: "Book & track", text: "Schedule sessions and view progress." },
              ].map((it) => (
                <div key={it.title} className="bg-soft-white-blue rounded-lg p-4">
                  <div className="text-2xl mb-1">{it.icon}</div>
                  <div className="text-sm font-semibold text-dark-blue">{it.title}</div>
                  <div className="text-xs text-black/70 mt-1">{it.text}</div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: Info (đồng bộ tone với Login) */}
          <aside className="bg-dark-blue text-white rounded-xl p-5 md:p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base md:text-lg font-semibold mb-2">What you can do</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-white/90">
                <li>Browse approved tutors by subject & department</li>
                <li>Smart matching based on availability and course needs</li>
                <li>Book, reschedule, and receive reminders</li>
                <li>View feedback and progress across sessions</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold mb-2">Integration</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                Securely integrated with HCMUT_SSO, DATACORE and Library. Single sign-on lets you access services with one login.
              </p>
              <p className="text-sm text-white/90 leading-relaxed mt-2">
                Please exit your browser after using authenticated services for security.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold mb-2">Technical support</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                E-mail:{" "}
                <a href="mailto:support@hcmut.edu.vn" className="underline text-light-light-blue">
                  support@hcmut.edu.vn
                </a>
                <br />
                Tel: (84-8) 38647256 - 7204
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* === ABOUT US SECTION === */}
      <section id="about" className="bg-soft-white-blue/30 px-4 md:px-10 py-10">
        <div className="w-full max-w-6xl mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-dark-blue text-center mb-6">
            About Us – Tutor Support System
          </h2>
          <p className="text-sm text-black/70 leading-relaxed max-w-3xl mx-auto text-center mb-8">
            Tutor Support System is an academic support platform for HCMUT students:
            find suitable tutors, schedule support sessions, track progress and provide quality feedback.
            The system securely integrates with HCMUT_SSO, DATACORE and library to ensure
            a unified experience within the university ecosystem.
          </p>

          {/* How it works detailed */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                title: "Sign in securely",
                desc: "Login with HCMUT_SSO. Account and role synchronized from DATACORE.",
                icon: "🔐",
              },
              {
                title: "Match & schedule",
                desc: "Choose tutor manually or use Smart Match. Book by available time slots.",
                icon: "🗓️",
              },
              {
                title: "Learn & improve",
                desc: "Receive materials, join sessions, track progress and submit feedback after each session.",
                icon: "📈",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-lg border border-soft-white-blue bg-white p-5"
              >
                <div className="text-2xl">{item.icon}</div>
                <h3 className="mt-2 text-sm font-semibold text-dark-blue">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-black/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Roles */}
          <div className="rounded-lg border border-soft-white-blue bg-white p-5 mb-8">
            <h3 className="text-base font-semibold text-dark-blue mb-4">Who uses the system?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-soft-white-blue p-4">
                <h4 className="text-sm font-semibold text-dark-blue">Students</h4>
                <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>Find tutors, book sessions, track learning progress.</li>
                  <li>Receive personalized learning suggestions (AI Personalized).</li>
                  <li>Submit feedback after sessions, join Forum/Q&A.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-soft-white-blue p-4">
                <h4 className="text-sm font-semibold text-dark-blue">Tutors</h4>
                <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>Manage availability, accept support requests.</li>
                  <li>Record progress logs for each student.</li>
                  <li>Review feedback, improve teaching quality.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-soft-white-blue p-4">
                <h4 className="text-sm font-semibold text-dark-blue">Coordinators</h4>
                <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>Điều phối tutor, xử lý xung đột/overbook.</li>
                  <li>Cấu hình Matching Rules, xem Matching Suggestions.</li>
                  <li>Báo cáo Workload/Utilization, theo dõi vấn đề feedback.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-soft-white-blue p-4">
                <h4 className="text-sm font-semibold text-dark-blue">Departments / Admin</h4>
                <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
                  <li>Departmental & Participation reports.</li>
                  <li>SSO/Library health, notifications log, export jobs.</li>
                  <li>RBAC & audit logs đảm bảo tuân thủ.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Integrations & Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-soft-white-blue bg-white p-5">
              <h3 className="text-base font-semibold text-dark-blue mb-3">Integrations</h3>
              <div className="grid gap-3">
                {[
                  {
                    name: "HCMUT_SSO",
                    note: "Đăng nhập 1 lần, bảo mật tập trung.",
                  },
                  {
                    name: "DATACORE",
                    note: "Đồng bộ vai trò, khoa/chương trình.",
                  },
                  {
                    name: "Library",
                    note: "Tài liệu học tập, quyền truy cập theo chính sách.",
                  },
                ].map((i) => (
                  <div
                    key={i.name}
                    className="rounded-lg border border-soft-white-blue p-3"
                  >
                    <div className="text-sm font-semibold text-dark-blue">{i.name}</div>
                    <div className="text-xs text-black/70 mt-1">{i.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-soft-white-blue bg-white p-5">
              <h3 className="text-base font-semibold text-dark-blue mb-3">Impact (mock)</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Active tutors", value: "128" },
                  { label: "Sessions / term", value: "3,240" },
                  { label: "Avg. rating", value: "4.7/5" },
                  { label: "Programs covered", value: "14" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-soft-white-blue bg-soft-white-blue/50 p-3"
                  >
                    <div className="text-lg font-semibold text-dark-blue">{s.value}</div>
                    <div className="text-xs text-black/60 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER (copy từ Login) === */}
      <footer className="bg-dark-blue text-white px-5 md:px-10 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-semibold mb-2">Tutor Support System</h3>
          <p className="text-sm text-white/80">
            Academic support network for HCMUT students.
          </p>
          <p className="text-sm text-white/80">
            Find tutors, book sessions, and get guided learning.
          </p>
          <p className="text-sm text-white/70 mt-2">
            Securely integrated with HCMUT_SSO and DATACORE.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <div className="flex flex-col gap-1 text-sm text-white/80">
            <Link href="/find-tutor" className="hover:text-white">Find a Tutor</Link>
            <Link href="/book" className="hover:text-white">Book a Session</Link>
            <Link href="/student/my-sessions" className="hover:text-white">Your Dashboard</Link>
            <Link href="/student/submit-feedback" className="hover:text-white">Submit Feedback</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Support</h3>
          <div className="flex flex-col gap-1 text-sm text-white/80">
            <Link href="/dept/academic-affairs" className="hover:text-white">Academic Affairs</Link>
            <Link href="/student-affairs" className="hover:text-white">Student Affairs</Link>
            <Link href="/library" className="hover:text-white">Library Resources</Link>
            <Link href="/report-issue" className="hover:text-white">Report an Issue</Link>
          </div>
        </div>
      </footer>

      <div className="bg-dark-blue border-t border-white/10 text-center text-white/60 text-xs py-3">
        © {new Date().getFullYear()} Tutor Support System – Ho Chi Minh City University of Technology (HCMUT)
      </div>
    </div>
  );
};

export default Landing;
