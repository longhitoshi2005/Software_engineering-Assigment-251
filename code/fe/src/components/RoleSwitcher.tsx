"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role, setClientRole } from "@/lib/role";
import api from "@/lib/api";

interface RoleSwitcherProps {
  currentRole: Role;
}

const roleLabels: Record<Role, string> = {
  [Role.STUDENT]: "Student",
  [Role.TUTOR]: "Tutor",
  [Role.DEPARTMENT_CHAIR]: "Department Chair",
  [Role.COORDINATOR]: "Coordinator",
  [Role.STUDENT_AFFAIRS]: "Student Affairs",
  [Role.PROGRAM_ADMIN]: "Program Admin",
};

const roleRoutes: Record<Role, string> = {
  [Role.STUDENT]: "/student/find-tutor",
  [Role.TUTOR]: "/tutor/dashboard",
  [Role.DEPARTMENT_CHAIR]: "/dept",
  [Role.COORDINATOR]: "/coord",
  [Role.STUDENT_AFFAIRS]: "/sa",
  [Role.PROGRAM_ADMIN]: "/admin",
};

// Map backend role names to frontend Role enum
const backendToFrontendRole: Record<string, Role> = {
  "STUDENT": Role.STUDENT,
  "TUTOR": Role.TUTOR,
  "DEPT_CHAIR": Role.DEPARTMENT_CHAIR,
  "COORD": Role.COORDINATOR,
  "STAFF_SA": Role.STUDENT_AFFAIRS,
  "ADMIN": Role.PROGRAM_ADMIN,
};

export default function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const router = useRouter();
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const userInfo = await api.get("/users/me");
        if (userInfo.roles && Array.isArray(userInfo.roles)) {
          // Map backend roles to frontend Role enum
          const mappedRoles = userInfo.roles
            .map((backendRole: string) => backendToFrontendRole[backendRole])
            .filter((role): role is Role => role !== undefined);
          setAvailableRoles(mappedRoles);
        }
      } catch (error) {
        console.error("Failed to fetch user roles:", error);
      }
    };

    fetchUserRoles();
  }, []);

  const handleRoleSwitch = (newRole: Role) => {
    if (newRole === currentRole) {
      setShowRoleMenu(false);
      return;
    }

    // Update role in localStorage
    setClientRole(newRole);
    localStorage.setItem("userRole", newRole);

    // Navigate to the new role's default page
    const targetRoute = roleRoutes[newRole];
    if (targetRoute) {
      router.push(targetRoute);
    }

    setShowRoleMenu(false);
  };

  // Don't show if user has only one role
  if (availableRoles.length <= 1) {
    return null;
  }

  return (
    <div 
      className="relative group/roles"
      onMouseEnter={() => setShowRoleMenu(true)}
      onMouseLeave={() => setShowRoleMenu(false)}
    >
      <button
        className="block w-full text-left px-4 py-2 text-sm whitespace-nowrap transition text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue"
      >
        Switch Profile
      </button>

      {/* Role submenu */}
      {showRoleMenu && (
        <div
          className="absolute top-0 bg-white text-dark-blue min-w-44 rounded-md shadow-lg border border-black/10 py-2 z-50"
          onMouseEnter={() => setShowRoleMenu(true)}
          onMouseLeave={() => setShowRoleMenu(false)}
        >
          <div className="px-3 py-1 text-xs font-semibold text-dark-blue/60 border-b border-black/10 mb-1">
            Switch to:
          </div>
          {availableRoles.map((role) => {
            const isCurrent = role === currentRole;
            return (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                disabled={isCurrent}
                className={`block w-full text-left px-4 py-2 text-sm whitespace-nowrap transition ${
                  isCurrent
                    ? "text-dark-blue/40 bg-gray-100 cursor-not-allowed"
                    : "text-dark-blue/80 hover:text-dark-blue hover:bg-soft-white-blue cursor-pointer"
                }`}
              >
                {roleLabels[role]}
                {isCurrent && (
                  <span className="ml-2 text-xs text-dark-blue/30">(current)</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
