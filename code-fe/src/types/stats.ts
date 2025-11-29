export type TutorStat = { name: string; faculty: string; active: number; max: number; utilization: number };
export type PerformanceMetric = { metric: string; value: string; trend: string; change: string };
export type WorkloadRow = { coordinator: string; assignedSessions: number; resolvedConflicts: number; pendingRequests: number; avgResponseTime: string };
