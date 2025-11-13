export enum Role {
  ProgramAdmin = "ProgramAdmin",
  DepartmentChair = "DepartmentChair",
  StudentAffairs = "StudentAffairs",
  Coordinator = "Coordinator",
  Tutor = "Tutor",
  Student = "Student",
}

export function isRole(v: string | null): v is Role {
  if (!v) return false;
  return Object.values(Role).includes(v as Role);
}

export function getClientRole(): Role | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromLS = localStorage.getItem('userRole');
    if (fromLS && isRole(fromLS)) return fromLS as Role;
    // fallback to a global sentinel if app injects it
    const gl = (window as any).__USER_ROLE__;
    if (gl && isRole(gl)) return gl as Role;
    return null;
  } catch (e) {
    return null;
  }
}

export function hasRole(...allowed: Role[]) {
  const role = getClientRole();
  if (!role) return false;
  return allowed.includes(role);
}

export function setClientRole(role: Role) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('userRole', role);
  } catch (e) {}
}
