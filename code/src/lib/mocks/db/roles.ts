import type { RoleDef } from "@/types/roles";

export const ROLES: RoleDef[] = [
  { id: 1, name: "Coordinator Lead", description: "Full access to all coordinator functions", permissions: ["assign_tutors", "resolve_conflicts", "generate_reports", "manage_integrations", "audit_logs"], users: 2 },
  { id: 2, name: "Coordinator", description: "Standard coordinator access", permissions: ["assign_tutors", "resolve_conflicts", "generate_reports"], users: 5 },
  { id: 3, name: "Coordinator Assistant", description: "Limited coordinator access", permissions: ["view_reports", "view_sessions"], users: 3 },
];

export const PERMISSIONS = [
  { key: "assign_tutors", label: "Assign tutors to students" },
  { key: "resolve_conflicts", label: "Resolve scheduling conflicts" },
  { key: "generate_reports", label: "Generate workload reports" },
  { key: "manage_integrations", label: "Manage third-party integrations" },
  { key: "audit_logs", label: "View audit logs" },
  { key: "view_reports", label: "View reports" },
  { key: "view_sessions", label: "View session details" },
];
