// Centralized mocks for migrate app (coord area and shared)
// Export types and constant mock datasets so no file defines its own mocks.
import type { Thread, Reply } from "@/types/forum";
// Import types into local scope and re-export them from centralized `src/types` for backward compatibility
import type { Integration } from "@/types/integrations";
import type { RoleDef } from "@/types/roles";
import type { SystemTask, AuditLog } from "@/types/systemTasks";
import type { ManualAssignment } from "@/types/assignments";
import type { TutorStat, PerformanceMetric, WorkloadRow } from "@/types/stats";
import type { ExportJob } from "@/types/exportJobs";
import type { PendingMatch } from "@/types/pendingAssign";
import type { Conflict, ConflictRequest } from "@/types/conflicts";
import type { Student } from "@/types/students";
import type { LibraryResource } from "@/types/library";
import type { Tutor } from "@/types/tutors";

export type { Integration } from "@/types/integrations";
export type { RoleDef } from "@/types/roles";
export type { SystemTask, AuditLog } from "@/types/systemTasks";
export type { ManualAssignment } from "@/types/assignments";
export type { TutorStat, PerformanceMetric, WorkloadRow } from "@/types/stats";
export type { ExportJob } from "@/types/exportJobs";
export type { PendingMatch } from "@/types/pendingAssign";
export type { Conflict, ConflictRequest } from "@/types/conflicts";
export type { Student } from "@/types/students";
export type { LibraryResource } from "@/types/library";
export type { Tutor } from "@/types/tutors";

export const INTEGRATIONS: Integration[] = [
  { id: 1, name: "Google Calendar", description: "Sync sessions with Google Calendar", status: "connected", lastSync: "2024-01-15 08:00:00" },
  { id: 2, name: "Zoom", description: "Create and manage video sessions", status: "connected", lastSync: "2024-01-15 09:30:00" },
  { id: 3, name: "Slack", description: "Send notifications to coordinators", status: "disconnected", lastSync: "Never" },
  { id: 4, name: "Microsoft Teams", description: "Integration with Teams for meetings", status: "pending", lastSync: "Setup required" },
];

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

export const SYSTEM_TASKS: SystemTask[] = [
  { id: 1, name: "Auto-assign pending requests", status: "running", progress: 65, lastRun: "2024-01-15 08:00:00", nextRun: "2024-01-15 16:00:00" },
  { id: 2, name: "Generate weekly reports", status: "completed", progress: 100, lastRun: "2024-01-14 23:00:00", nextRun: "2024-01-21 23:00:00" },
  { id: 3, name: "Clean up old sessions", status: "pending", progress: 0, lastRun: "2024-01-10 02:00:00", nextRun: "2024-01-16 02:00:00" },
  { id: 4, name: "Update tutor availability", status: "failed", progress: 0, lastRun: "2024-01-15 06:00:00", nextRun: "2024-01-15 12:00:00" },
];

export const AUDIT_LOGS: AuditLog[] = [
  { id: "log-1", actorId: "coord1", actorRole: "Coordinator", action: "Assigned tutor to student", resource: "ManualAssignment", details: { tutor: "TUT-101", student: "s-101" }, createdAt: "2024-01-15T10:30:00.000Z" },
  { id: "log-2", actorId: "coord1", actorRole: "Coordinator", action: "Resolved conflict", resource: "Conflict", details: { conflictId: "conf-1", resolvedWith: "reschedule" }, createdAt: "2024-01-15T09:15:00.000Z" },
  { id: "log-3", actorId: "coord2", actorRole: "Coordinator", action: "Manual match created", resource: "ManualAssignment", details: { note: "advanced Physics" }, createdAt: "2024-01-14T16:45:00.000Z" },
  { id: "log-4", actorId: "coord1", actorRole: "Coordinator", action: "Report generated", resource: "Report", details: { report: "workload_jan_2024" }, createdAt: "2024-01-14T14:20:00.000Z" },
];

export const ASSIGNMENTS: ManualAssignment[] = [];

export const TUTOR_STATS: TutorStat[] = [
  { name: "Nguyen T. A.", faculty: "CSE", active: 8, max: 10, utilization: 80 },
  { name: "Pham Q. T.", faculty: "Math", active: 6, max: 8, utilization: 75 },
  { name: "Truong Q. T.", faculty: "EE", active: 11, max: 10, utilization: 110 },
];

// Re-export modularized mock datasets from the `db/` folder.
export * from "./db/integrations";
export * from "./db/roles";
export * from "./db/systemTasks";
export * from "./db/assignments";
export * from "./db/stats";
export * from "./db/exportJobs";
export * from "./db/pendingAssign";
export * from "./db/conflicts";
export * from "./db/students";
export * from "./db/library";
export * from "./db/sessions";
export * from "./db/tutors";

// Thread mocks moved to dedicated DB module for separation of concerns
export * from "./db/threads";
// Export service wrapper for components that want API-like calls
export { ForumService } from "@/lib/services/forum.service";

// Provide legacy-friendly aliases expected by some pages
export { MOCK_THREADS as mockThreads, mockReplies } from "./db/threads";