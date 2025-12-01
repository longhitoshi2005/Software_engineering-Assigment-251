"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function DeptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // mock clear session
    try {
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userRole");
    } catch {}
    router.push("/auth/login");
  };

  // ===== NAV MODEL (đã bổ sung đầy đủ) =====
 const navSections = [
  {
    label: "Dashboard",
    basePath: "/dept",
    children: [
      { label: "Overview", path: "/dept" },
    ],
  },
  {
    label: "Operations",
    basePath: "/dept/matching",
    children: [
      { label: "Matching Oversight", path: "/dept/matching" },
      { label: "Sessions", path: "/dept/sessions" },
      { label: "Progress Logs", path: "/dept/progress" },
      { label: "Manual Match", path: "/dept/manual-match" },
    ],
  },
  {
    label: "Analytics",
    basePath: "/dept/feedback",
    children: [
      { label: "Feedback Analytics", path: "/dept/feedback" },
    ],
  },
  {
    label: "Reports",
    basePath: "/dept/reports",
    children: [
      { label: "Departmental", path: "/dept/reports/departmental" },
      { label: "Participation", path: "/dept/reports/participation" },
      { label: "Workload", path: "/dept/reports/workload" },
      { label: "Export Center", path: "/dept/exports" },
    ],
  },
  {
    label: "Profile",
    basePath: "/dept/profile",
    children: [
      { label: "My profile", path: "/dept/profile" },
      { label: "Logout", path: "/auth/login" },
    ],
  },
];


  // active nếu current path bắt đầu bằng basePath hoặc bằng path của bất kỳ child
  const isGroupActive = (groupPath: string, children: { path: string }[]) =>
    pathname === groupPath ||
    pathname.startsWith(groupPath + "/") ||
    children.some((c) => pathname === c.path || pathname.startsWith(c.path + "/"));

  return (
    <div className="min-h-screen bg-soft-white-blue">
      {/* TOP NAV */}
      <nav className="w-full bg-dark-blue h-[60px] flex items-center justify-between px-6 md:px-10">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dept">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1">
              <Image
                src="/logo-hcmut.png"
                alt="HCMUT logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
          </Link>
          <div className="leading-tight">
            <span className="text-white font-bold tracking-tight text-lg leading-none block">
              TUTOR SUPPORT SYSTEM
            </span>
            <span className="text-white/50 text-[0.6rem] uppercase tracking-wide">
              department
            </span>
          </div>
        </div>

        {/* Desktop Menus */}
        <div className="hidden md:flex items-center gap-6 h-full mr-1">
          {navSections.map((group) => {
            const active = isGroupActive(group.basePath, group.children);
            return (
              <div
                key={group.label}
                className="relative group h-full flex items-center"
              >
                {/* Parent link (không chuyển trang, chỉ để hover) */}
                <Link
                  href={group.basePath}
                  className={`h-full inline-flex items-center text-sm transition-colors ${
                    active ? "text-white font-semibold" : "text-white/80 hover:text-white"
                  }`}
                >
                  {group.label}
                </Link>

                {/* underline khi active */}
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-white rounded-full" />
                )}

                {/* Dropdown */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-0
                             hidden group-hover:block
                             bg-white text-dark-blue min-w-[220px]
                             rounded-md shadow-lg border border-black/10 py-2 z-50"
                >
                  {/* hover zone buffer */}
                  <div className="absolute -top-2 left-0 w-full h-3" />

                  {group.children.map((child) => {
                    const isLogout = child.label === "Logout";
                    const childActive =
                      pathname === child.path || pathname.startsWith(child.path + "/");

                    if (isLogout) {
                      return (
                        <button
                          key={child.label}
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm whitespace-nowrap transition text-red-600/80 hover:text-red-700 hover:bg-soft-white-blue"
                        >
                          {child.label}
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-4 py-2 text-sm whitespace-nowrap transition ${
                          childActive
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

      {/* PAGE CONTENT */}
      <main className="w-full">{children}</main>
    </div>
  );
}