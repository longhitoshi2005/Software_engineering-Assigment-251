"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const MainNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  // 1) ĐOÁN ROLE TỪ URL
  // /student/... -> student
  // /tutor/...   -> tutor
  // /coord/...   -> coordinator
  // /admin/...   -> admin
  // /sa/...      -> student affairs
  const role: "student" | "tutor" | "coordinator" | "admin" | "department chair" | "student affairs" = pathname.startsWith("/tutor")
    ? "tutor"
    : pathname.startsWith("/coord")
    ? "coordinator"
    : pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/dept")
    ? "department chair"
    : pathname.startsWith("/sa")
    ? "student affairs"
    : "student"; // default

  // 2) CẤU HÌNH MENU THEO ROLE
  const studentNav = [
    {
      label: "Learning",
      basePath: "/student/find-tutor",
      children: [
        { label: "Find Tutor", path: "/student/find-tutor" },
        { label: "My Sessions", path: "/student/my-sessions" },
      ],
    },
    {
      label: "Feedback",
      basePath: "/student/feedback",
      children: [
        { label: "Feedback Summary", path: "/student/feedback-summary" },
      ],
    },
    {
      label: "Community",
      basePath: "/student/forum",
      children: [
        { label: "Forum / Q&A", path: "/student/forum" },
        { label: "Library Resources", path: "/student/library" },
      ],
    },
    {
      label: "AI Tools",
      basePath: "/student/ai-tools",
      children: [
        { label: "Smart Match", path: "/student/ai-tools" },
        { label: "AI Quiz Generator", path: "/student/ai-quiz-generator" },
        { label: "Personalized Learning", path: "/student/ai-personalized" },
      ],
    },
    {
      label: "Profile",
      basePath: "/student/profile",
      children: [
        { label: "My Profile", path: "/student/profile" },
        { label: "System Settings", path: "/student/settings" },
      ],
    },
  ];

  // tutor tập trung vào quản lý dạy
  const tutorNav = [
    {
      label: "Dashboard",
      basePath: "/tutor/dashboard",
      children: [
        { label: "Overview", path: "/tutor/dashboard" },
        { label: "Pending Requests", path: "/tutor/requests" },
      ],
    },
    {
      label: "Teaching",
      basePath: "/tutor/availability",
      children: [
        { label: "Availability Setup", path: "/tutor/availability" },
        { label: "Exceptions / Holidays", path: "/tutor/availability/exceptions" },
        { label: "Session Templates", path: "/tutor/session-templates" },
      ],
    },
    {
      label: "Feedback",
      basePath: "/tutor/feedback",
      children: [
        { label: "Progress Log", path: "/tutor/progress-log"},
        { label: "Recent Feedback", path: "/tutor/feedback-from-students" },
        { label: "Feedback Analytics", path: "/tutor/feedback-analytics" },
      ],
    },
    {
      label: "Resources",
      basePath: "/tutor/resources",
      children: [
        { label: "Shared Materials", path: "/tutor/resources" },
        { label: "Quiz / Question Bank", path: "/tutor/quiz-bank" },
      ],
    },
    {
      label: "Profile",
      basePath: "/tutor/profile",
      children: [
        { label: "My Profile", path: "/tutor/profile" },
        { label: "Settings", path: "/tutor/settings" },
      ],
    },
  ];

  // coordinator: điều phối, phê duyệt, báo cáo khoa/bộ môn
  const coordNav = [
    {
      label: "Operations",
      basePath: "/coord/dashboard",
      children: [
        { label: "Dashboard", path: "/coord/dashboard" },
        { label: "Pending Tutor Assignments", path: "/coord/pending-assign" },
        { label: "Overbook / Conflicts", path: "/coord/conflicts" },
        { label: "Assignments Log", path: "/coord/assignments-log" },
        { label: "Manual Match", path: "/coord/manual-match" },
        { label: "Sessions", path: "/coord/sessions" },
        { label: "System Notices", path: "/coord/system-notices" },
      ],
    },
    {
      label: "Tutors",
      basePath: "/coord/tutors",
      children: [
        { label: "Tutor List", path: "/coord/tutors" },
        { label: "Availability Monitor", path: "/coord/tutors/availability" },
        { label: "Tutor Performance", path: "/coord/tutors/performance" },
      ],
    },
    {
      label: "Students",
      basePath: "/coord/students",
      children: [
        { label: "Requests", path: "/coord/students/requests" },
        { label: "At-risk Students", path: "/coord/students/at-risk" },
        { label: "Feedback Issues", path: "/coord/feedback-issues" },
      ],
    },
    {
      label: "Reports",
      basePath: "/coord/reports",
      children: [
        { label: "Department Report", path: "/coord/reports/dept" },
        { label: "Feedback Summary", path: "/coord/reports/feedback" },
        { label: "Utilization", path: "/coord/reports/utilization" },
        { label: "Workload", path: "/coord/reports/workload" },
        { label: "Matching Analytics", path: "/coord/reports/matching" },
        { label: "Audit Logs", path: "/coord/audit-logs" },
      ],
    },
  ];

  // admin: hệ thống, user, audit
  const adminNav = [
    {
      label: "Dashboard",
      basePath: "/admin/dashboard",
      children: [
        { label: "Admin Dashboard", path: "/admin/dashboard" },
      ],
    },
    {
      label: "Exports",
      basePath: "/admin/exports",
      children: [
        { label: "Exports & Reports", path: "/admin/exports" },
      ],
    },
    {
      label: "Integrations",
      basePath: "/admin/integrations",
      children: [
        { label: "SSO, DATACORE, Library", path: "/admin/integrations" },
      ],
    },
    {
      label: "Audit",
      basePath: "/admin/audit",
      children: [
        { label: "Audit Logs", path: "/admin/audit" },
      ],
    },
    {
      label: "Users & Roles",
      basePath: "/admin/rbac",
      children: [
        { label: "RBAC Management", path: "/admin/rbac" },
      ],
    },
    {
      label: "System Tasks",
      basePath: "/admin/system-tasks",
      children: [
        { label: "Cleanup & Backup", path: "/admin/system-tasks" },
      ],
    },
  ];

  const deptNav = [
  {
    label: "Reports",
    basePath: "/dept/reports",
    children: [
      {
        label: "Departmental Report",
        path: "/dept/reports"
      },
      {
        label: "Participation Report",
        path: "/dept/report-part"
      }
    ]
  }
];

  // Student Affairs: participation, eligibility, export
  const saNav = [
    {
      label: "Dashboard",
      basePath: "/sa/dashboard",
      children: [
        { label: "Overview", path: "/sa/dashboard" },
      ],
    },
    {
      label: "Reports",
      basePath: "/sa/report-participation",
      children: [
        { label: "Participation Report", path: "/sa/report-participation" },
        { label: "Eligibility / Credits", path: "/sa/eligibility" },
      ],
    },
    {
      label: "Export",
      basePath: "/sa/export",
      children: [
        { label: "Export & Logs", path: "/sa/export" },
      ],
    },
  ];

  // chọn menu theo role
  const navGroups =
    role === "tutor"
      ? tutorNav
      : role === "coordinator"
      ? coordNav
      : role === "admin"
      ? adminNav
      : role == "department chair"
      ? deptNav
      : role === "student affairs"
      ? saNav
      : studentNav;

  // xác định parent nào đang active
  const activeParent = navGroups.find((group) =>
    group.children.some((child) => pathname === child.path)
  );

  // logo click → chuyển đúng dashboard theo role
  const handleLogoClick = () => {
    if (role === "tutor") {
      router.push("/tutor/dashboard");
    } else if (role === "coordinator") {
      router.push("/coord/dashboard");
    } else if (role === "admin") {
      router.push("/admin/dashboard");
    } else if (role === "department chair") {
      router.push("/dept/reports");
    } else if (role === "student affairs") {
      router.push("/sa/dashboard");
    } else {
      router.push("/student/find-tutor");
    }
  };

  return (
    <nav className="w-full bg-dark-blue h-[60px] flex items-center justify-between px-6 md:px-10">
      {/* logo bên trái */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={handleLogoClick}
      >
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
          <Image
            src="/logo-hcmut.png"
            alt="HCMUT logo"
            className="w-full h-full object-contain"
            width={40}
            height={40}
          />
        </div>
        <div className="leading-tight">
          <span className="text-white font-bold tracking-tight text-lg leading-none block">
            TUTOR SUPPORT SYSTEM
          </span>
          <span className="text-white/50 text-[0.6rem] uppercase tracking-wide">
            {role}
          </span>
        </div>
      </div>

      {/* menu chính */}
      <div className="hidden md:flex items-center gap-6 h-full mr-8">
        {navGroups.map((group) => {
          const isActive = activeParent?.label === group.label;
          return (
            <div
              key={group.label}
              className="relative group h-full flex items-center"
            >
              {/* parent button */}
              <button
                onClick={() => router.push(group.basePath)}
                className={`h-full inline-flex items-center text-sm transition-colors ${
                  isActive ? "text-white font-semibold" : "text-white/80 hover:text-white"
                }`}
              >
                {group.label}
              </button>

              {/* underline */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-white rounded-full"></div>
              )}

              {/* dropdown */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full mt-0
                           hidden group-hover:block
                           bg-white text-dark-blue min-w-[200px]
                           rounded-md shadow-lg border border-black/10 py-2 z-50"
              >
                {/* cầu nối hover để không bị tắt khi rê xuống */}
                <div className="absolute -top-2 left-0 w-full h-3"></div>

                {group.children.map((child) => {
                  const isChildActive = pathname === child.path;
                  return (
                    <Link
                      key={child.path}
                      href={child.path}
                      className={`block px-4 py-2 text-sm whitespace-nowrap transition ${
                        isChildActive
                          ? "text-dark-blue font-semibold underline underline-offset-4"
                          : "text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue"
                      }`}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default MainNavbar;