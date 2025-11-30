"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Role } from "@/lib/role";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend logout API to clear cookie
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear user session
      localStorage.removeItem("userEmail");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      // Redirect to login
      router.push("/auth/login");
    }
  };

  return (
    <ProtectedRoute requiredRoles={[Role.TUTOR]}>
      <TutorLayoutContent pathname={pathname} handleLogout={handleLogout}>
        {children}
      </TutorLayoutContent>
    </ProtectedRoute>
  );
}

function TutorLayoutContent({
  children,
  pathname,
  handleLogout,
}: {
  children: React.ReactNode;
  pathname: string;
  handleLogout: () => void;
}) {

  const navSections = [
    {
      label: "Dashboard",
      basePath: "/tutor/dashboard",
      children: [
        { label: "Overview", path: "/tutor/dashboard" },
        { label: "Sessions Today", path: "/tutor/sessions-today" },
      ],
    },
    {
      label: "Teaching",
      basePath: "/tutor/availability",
      children: [
        { label: "Availability", path: "/tutor/availability" },
        { label: "Requests", path: "/tutor/requests" },
      ],
    },
    {
      label: "Feedback",
      basePath: "/tutor/feedback-from-students",
      children: [
        { label: "From Students", path: "/tutor/feedback-from-students" },
        { label: "Progress Log", path: "/tutor/progress-log" },
      ],
    },
    {
      label: "Profile",
      basePath: "/tutor/profile",
      children: [
        { label: "My Profile", path: "/tutor/profile" },
        { label: "Logout", path: "/auth/login" },
      ],
    },
  ];

  const activeParent = navSections.find((group) =>
    group.children.some((child) => pathname === child.path)
  );

  return (
    <ProtectedRoute requiredRoles={[Role.TUTOR]}>
      <div className="min-h-screen flex flex-col bg-soft-white-blue">
      <nav className="w-full bg-dark-blue h-[60px] flex items-center justify-between px-6 md:px-10">
        <div
          className="flex items-center gap-3 cursor-pointer"
        >
          <Link href="/tutor/dashboard">
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
              tutor
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 h-full mr-8">
          {navSections.map((group) => {
            const isActive = activeParent?.label === group.label;
            return (
              <div
                key={group.label}
                className="relative group h-full flex items-center"
              >
                <Link
                  href={group.basePath}
                  className={`h-full inline-flex items-center text-sm transition-colors ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {group.label}
                </Link>

                {isActive && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-white rounded-full"></div>
                )}

                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-0
                             hidden group-hover:block
                             bg-white text-dark-blue min-w-[200px]
                             rounded-md shadow-lg border border-black/10 py-2 z-50"
                >
                  <div className="absolute -top-2 left-0 w-full h-3"></div>

                  {group.children.map((child) => {
                    const isChildActive = pathname === child.path;
                    const isLogout = child.label === "Logout";
                    
                    if (isLogout) {
                      return (
                        <button
                          key={child.label}
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm whitespace-nowrap transition text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue"
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

      <main className="w-full">{children}</main>
    </div>
    </ProtectedRoute>
  );
}