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

export * from "./db/threads";
export { ForumService } from "@/lib/services/forum.service";

export { MOCK_THREADS as mockThreads, mockReplies } from "./db/threads";