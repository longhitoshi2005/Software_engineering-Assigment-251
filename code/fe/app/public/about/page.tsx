"use client";

import Link from "next/link";

const About: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Back to landing */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-light-heavy-blue hover:underline"
        >
          ← Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border border-soft-white-blue bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-light-light-blue/10" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-soft-white-blue" />
        </div>

        <div className="relative p-6 md:p-8">
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            About Us – Tutor Support System (HCMUT)
          </h1>
          <p className="mt-2 text-sm text-black/70 leading-relaxed max-w-3xl">
            Tutor Support System là nền tảng hỗ trợ học thuật dành cho sinh viên HCMUT:
            tìm tutor phù hợp, đặt lịch hỗ trợ, theo dõi tiến độ và phản hồi chất lượng.
            Hệ thống tích hợp an toàn với HCMUT_SSO, DATACORE và thư viện để đảm bảo
            trải nghiệm đồng nhất trong hệ sinh thái nhà trường.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/student/find-tutor"
              className="rounded-lg bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-[#00539a] transition"
            >
              Find a Tutor
            </Link>
            <Link
              href="/student/book-session"
              className="rounded-lg bg-white text-dark-blue text-sm font-semibold px-4 py-2 border border-soft-white-blue hover:bg-soft-white-blue/70 transition"
            >
              Book a Session
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Sign in securely",
            desc:
              "Đăng nhập bằng HCMUT_SSO. Tài khoản và vai trò đồng bộ từ DATACORE.",
            icon: "🔐",
          },
          {
            title: "Match & schedule",
            desc:
              "Chọn tutor thủ công hoặc dùng Smart Match. Đặt lịch theo slot khả dụng.",
            icon: "🗓️",
          },
          {
            title: "Learn & improve",
            desc:
              "Nhận tài liệu, tham gia session, ghi nhận tiến độ và gửi phản hồi sau buổi học.",
            icon: "📈",
          },
        ].map((item) => (
          <article
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
          </article>
        ))}
      </section>

      {/* Roles */}
      <section className="rounded-lg border border-soft-white-blue bg-white p-5">
        <h2 className="text-base font-semibold text-dark-blue">Who uses the system?</h2>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-soft-white-blue p-4">
            <h3 className="text-sm font-semibold text-dark-blue">Students</h3>
            <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
              <li>Tìm tutor, đặt lịch, theo dõi buổi học.</li>
              <li>Nhận gợi ý học cá nhân hoá (AI Personalized).</li>
              <li>Gửi feedback sau session, tham gia Forum/Q&A.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-soft-white-blue p-4">
            <h3 className="text-sm font-semibold text-dark-blue">Tutors</h3>
            <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
              <li>Quản lý lịch rảnh, nhận yêu cầu hỗ trợ.</li>
              <li>Ghi chép tiến độ (Progress Log) theo từng student.</li>
              <li>Xem feedback, cải thiện chất lượng giảng dạy.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-soft-white-blue p-4">
            <h3 className="text-sm font-semibold text-dark-blue">Coordinators</h3>
            <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
              <li>Điều phối tutor, xử lý xung đột/overbook.</li>
              <li>Cấu hình Matching Rules, xem Matching Suggestions.</li>
              <li>Báo cáo Workload/Utilization, theo dõi vấn đề feedback.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-soft-white-blue p-4">
            <h3 className="text-sm font-semibold text-dark-blue">Departments / Admin</h3>
            <ul className="mt-1 text-sm text-black/70 list-disc list-inside space-y-1">
              <li>Departmental & Participation reports.</li>
              <li>SSO/Library health, notifications log, export jobs.</li>
              <li>RBAC & audit logs đảm bảo tuân thủ.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="rounded-lg border border-soft-white-blue bg-white p-5">
        <h2 className="text-base font-semibold text-dark-blue">Integrations</h2>
        <div className="mt-3 grid md:grid-cols-3 gap-4">
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
              className="rounded-lg border border-soft-white-blue p-4"
            >
              <div className="text-sm font-semibold text-dark-blue">{i.name}</div>
              <div className="text-sm text-black/70 mt-1">{i.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats (mock) */}
      <section className="rounded-lg border border-soft-white-blue bg-white p-5">
        <h2 className="text-base font-semibold text-dark-blue">Impact (mock)</h2>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Active tutors", value: "128" },
            { label: "Sessions / term", value: "3,240" },
            { label: "Avg. rating", value: "4.7/5" },
            { label: "Programs covered", value: "14" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-soft-white-blue bg-soft-white-blue/50 p-4"
            >
              <div className="text-lg font-semibold text-dark-blue">{s.value}</div>
              <div className="text-xs text-black/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="rounded-lg bg-white text-dark-blue text-sm font-semibold px-4 py-2 border border-soft-white-blue hover:bg-soft-white-blue/70 transition"
        >
          ← Back to Home
        </Link>
        <Link
          href="/student/find-tutor"
          className="rounded-lg bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-[#00539a] transition"
        >
          Start Finding Tutors
        </Link>
      </section>
    </div>
  );
};

export default About;
