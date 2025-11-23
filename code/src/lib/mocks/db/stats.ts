import type { TutorStat, PerformanceMetric, WorkloadRow } from "@/types/stats";

export const TUTOR_STATS: TutorStat[] = [
  { name: "Nguyen T. A.", faculty: "CSE", active: 8, max: 10, utilization: 80 },
  { name: "Pham Q. T.", faculty: "Math", active: 6, max: 8, utilization: 75 },
  { name: "Truong Q. T.", faculty: "EE", active: 11, max: 10, utilization: 110 },
];

export const PERFORMANCE_METRICS: PerformanceMetric[] = [
  { metric: "Match success rate", value: "94%", trend: "up", change: "+2.1%" },
  { metric: "Average response time", value: "2.3h", trend: "down", change: "-0.4h" },
  { metric: "Student satisfaction", value: "4.6/5", trend: "up", change: "+0.2" },
  { metric: "Tutor utilization", value: "87%", trend: "up", change: "+3.2%" },
  { metric: "Conflict resolution rate", value: "96%", trend: "stable", change: "0.0%" },
];

export const WORKLOAD_DATA: WorkloadRow[] = [
  { coordinator: "Alice Johnson", assignedSessions: 45, resolvedConflicts: 12, pendingRequests: 8, avgResponseTime: "2.3h" },
  { coordinator: "Bob Smith", assignedSessions: 38, resolvedConflicts: 15, pendingRequests: 5, avgResponseTime: "1.8h" },
  { coordinator: "Carol Davis", assignedSessions: 52, resolvedConflicts: 8, pendingRequests: 12, avgResponseTime: "3.1h" },
  { coordinator: "David Wilson", assignedSessions: 41, resolvedConflicts: 10, pendingRequests: 6, avgResponseTime: "2.5h" },
];
