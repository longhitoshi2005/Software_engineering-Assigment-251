export enum Role {
  PROGRAM_ADMIN = "PROGRAM_ADMIN",
  DEPARTMENT_CHAIR = "DEPARTMENT_CHAIR",
  STUDENT_AFFAIRS = "STUDENT_AFFAIRS",
  COORDINATOR = "COORDINATOR",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
}

export function isRole(v: string | null): v is Role {
  if (!v) return false;
  return Object.values(Role).includes(v as Role);
}

export function getClientRole(): Role | null {
  // Single-role: prefer `userRole` key in localStorage.
  if (typeof window === "undefined") return null;
  try {
    const single = localStorage.getItem("userRole");
    if (single && isRole(single)) return single as Role;
    return null;
  } catch (e) {
    return null;
  }
}

export function hasRole(...allowed: Role[]) {
  // Single-role check
  const current = getClientRole();
  if (!current) return false;
  return allowed.includes(current);
}

export function setClientRole(role: Role) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('userRole', role);
  } catch (e) {}
}
// NOTE: Multi-role helpers were removed. This module exposes a strict
// single-role API: `getClientRole()` and `setClientRole()`.
// Callers that previously expected multiple roles should explicitly wrap
// the single role returned by `getClientRole()` into an array at the
// callsite when needed for API payload compatibility.
