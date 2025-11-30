// lib/mocks/db/rbac.ts

export type RBACSource = "DATACORE" | "Local Override" | "Local";

export interface RBACUser {
  id: string;
  name: string;
  email: string;
  roles: string[];
  source: RBACSource;
}

/**
 * MOCK DATABASE — lưu RAM
 */
export let rbacUsers: RBACUser[] = [
  {
    id: "2352525",
    name: "2352525 – Khanh",
    email: "2352525@hcmut.edu.vn",
    roles: ["Student"],
    source: "DATACORE",
  },
  {
    id: "coord01",
    name: "coord01 – Student Affairs",
    email: "coord01@hcmut.edu.vn",
    roles: ["Coordinator", "StudentAffairs"],
    source: "Local Override",
  },
  {
    id: "admin",
    name: "admin",
    email: "admin@hcmut.edu.vn",
    roles: ["ProgramAdmin"],
    source: "Local",
  },
  {
    id: "2353001",
    name: "2353001 – Minh",
    email: "2353001@hcmut.edu.vn",
    roles: ["Student", "Tutor"],
    source: "Local Override",
  },
  {
    id: "dept01",
    name: "dept01 – CS Dept Chair",
    email: "dept01@hcmut.edu.vn",
    roles: ["DepartmentChair"],
    source: "DATACORE",
  },
];

/**
 * Add a role to a user
 */
export function assignRole(userId: string, role: string) {
  rbacUsers = rbacUsers.map((u) =>
    u.id === userId
      ? {
          ...u,
          roles: Array.from(new Set([...u.roles, role])),
          source: "Local Override",
        }
      : u
  );
}

/**
 * Remove a role from a user
 */
export function removeRole(userId: string, role: string) {
  rbacUsers = rbacUsers.map((u) =>
    u.id === userId
      ? {
          ...u,
          roles: u.roles.filter((r) => r !== role),
          source: u.roles.length <= 1 ? "DATACORE" : "Local Override",
        }
      : u
  );
}

/**
 * Mock role sync from DATACORE (no real changes)
 */
export function syncRolesFromDatacore() {
  return {
    syncedAt: new Date().toISOString(),
    updated: 0,
  };
}
