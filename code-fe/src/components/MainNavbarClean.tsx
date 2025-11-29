"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getClientRole, Role } from "@/lib/role";

export default function DynamicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Prefer stored `userRole` but fall back quickly to inferring role from the
  // URL so the navbar shows appropriate links immediately on navigation.
  const inferRoleFromPath = (): Role | null => {
    if (pathname.startsWith("/tutor")) return Role.TUTOR;
    if (pathname.startsWith("/coord")) return Role.COORDINATOR;
    if (pathname.startsWith("/admin")) return Role.PROGRAM_ADMIN;
    if (pathname.startsWith("/dept")) return Role.DEPARTMENT_CHAIR;
    if (pathname.startsWith("/sa")) return Role.STUDENT_AFFAIRS;
    if (pathname.startsWith("/student")) return Role.STUDENT;
    return null;
  };

  const [role, setRole] = useState<Role | null>(() => inferRoleFromPath());

  useEffect(() => {
    try {
      const stored = getClientRole();
      if (stored) setRole(stored);
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
    } catch (e) {}
    router.push("/auth/login");
  };

  const navGroups: Array<any> = [];

  if (role === Role.STUDENT) {
    navGroups.push({
      label: "Student Dashboard",
      basePath: "/student/find-tutor",
      children: [
        { label: "Find Tutor", path: "/student/find-tutor" },
        { label: "My Sessions", path: "/student/my-sessions" },
      ],
    });

    navGroups.push({
      label: "Feedback",
      basePath: "/student/feedback",
      children: [
        { label: "Submit Feedback", path: "/student/feedback" },
        { label: "Feedback Summary", path: "/student/feedback-summary" },
      ],
    });

    navGroups.push({
      label: "AI Tools",
      basePath: "/student/ai-tools",
      children: [
        { label: "AI Quiz Generator", path: "/student/ai-quiz" },
        { label: "My Questions", path: "/student/ai-quiz-my-questions" },
      ],
    });
  }

  if (role === Role.TUTOR) {
    navGroups.push({
      label: "Tutor Dashboard",
      basePath: "/tutor/dashboard",
      children: [
        { label: "Overview", path: "/tutor/dashboard" },
        { label: "Sessions Today", path: "/tutor/sessions-today" },
      ],
    });

    navGroups.push({
      label: "Teaching",
      basePath: "/tutor/availability",
      children: [
        { label: "Availability", path: "/tutor/availability" },
        { label: "Requests", path: "/tutor/requests" },
      ],
    });

    navGroups.push({
      label: "Tutor Feedback",
      basePath: "/tutor/feedback-from-students",
      children: [
        { label: "From Students", path: "/tutor/feedback-from-students" },
        { label: "Progress Log", path: "/tutor/progress-log" },
      ],
    });
  }

  if (role === Role.PROGRAM_ADMIN) {
    navGroups.push({
      label: "Admin Dashboard",
      basePath: "/admin/dashboard",
      children: [
        { label: "Overview", path: "/admin/dashboard" },
        { label: "Exports", path: "/admin/exports" },
        { label: "Integrations", path: "/admin/integrations" },
        { label: "Audit", path: "/admin/audit" },
      ],
    });
  }

  if (role === Role.COORDINATOR || role === Role.PROGRAM_ADMIN) {
    navGroups.push({
      label: "Coord Dashboard",
      basePath: "/coord/dashboard",
      children: [
        { label: "Overview", path: "/coord/dashboard" },
        { label: "Student Requests", path: "/coord/student-requests" },
        { label: "Conflicts", path: "/coord/conflicts" },
        { label: "Pending Assignments", path: "/coord/pending-assign" },
        { label: "Manual Match", path: "/coord/manual-match" },
      ],
    });
  }

  if (role === Role.DEPARTMENT_CHAIR) {
    navGroups.push({
      label: "Department",
      basePath: "/dept/reports",
      children: [
        { label: "Reports", path: "/dept/reports" },
        { label: "Feedback Trends", path: "/dept/reports/feedback-trends" },
      ],
    });
  }

  if (role === Role.STUDENT_AFFAIRS) {
    navGroups.push({
      label: "Student Affairs",
      basePath: "/sa/dashboard",
      children: [{ label: "Overview", path: "/sa/dashboard" }],
    });
  }

  // Common profile group
  navGroups.push({
    label: "Profile",
    basePath: "/profile",
    children: [
      { label: "My Profile", path: "/profile" },
      { label: "Logout", path: "/auth/login" },
    ],
  });

  const activeParent = navGroups.find((group) => group.children.some((c: any) => pathname === c.path));

  const homePath = role === Role.TUTOR ? "/tutor/dashboard" : role === Role.PROGRAM_ADMIN ? "/admin/dashboard" : role === Role.COORDINATOR ? "/coord/dashboard" : "/student/find-tutor";

  return (
    <nav className="w-full bg-dark-blue h-[60px] flex items-center justify-between px-6 md:px-10">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(homePath)}>
        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
          <Image src="/logo-hcmut.png" alt="logo" width={36} height={36} className="object-contain" />
        </div>
        <div className="leading-tight">
          <span className="text-white font-bold tracking-tight text-lg leading-none block">TUTOR SUPPORT SYSTEM</span>
          <span className="text-white/50 text-[0.6rem] uppercase tracking-wide">{role ? role.toLowerCase().replaceAll('_',' ') : 'guest'}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 h-full mr-8">
        {navGroups.map((group) => {
          const isActive = activeParent?.label === group.label;
          return (
            <div key={group.label} className="relative group h-full flex items-center">
              <Link href={group.basePath} className={`h-full inline-flex items-center text-sm transition-colors px-3 py-2 ${isActive ? 'text-white font-semibold' : 'text-white/80 hover:text-white'}`}>
                {group.label}
              </Link>

              {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-white rounded-full" />}

              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-0 hidden group-hover:block bg-white text-dark-blue min-w-[200px] rounded-md shadow-lg border border-black/10 py-2 z-50">
                <div className="absolute -top-2 left-0 w-full h-3" />
                {group.children.map((child: any) => {
                  const isChildActive = pathname === child.path;
                  const isLogout = child.label === 'Logout';
                  if (isLogout) {
                    return (
                      <button key={child.label} onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm whitespace-nowrap transition text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue">
                        {child.label}
                      </button>
                    );
                  }
                  return (
                    <Link key={child.path} href={child.path} className={`block px-4 py-2 text-sm whitespace-nowrap transition ${isChildActive ? 'text-dark-blue font-semibold underline underline-offset-4' : 'text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue'}`}>
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
}
