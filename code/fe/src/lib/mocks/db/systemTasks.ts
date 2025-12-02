import type { SystemTask, AuditLog } from "@/types/systemTasks";

export const SYSTEM_TASKS: SystemTask[] = [
  { 
    id: 1,
    name: "Auto-assign pending requests",
    status: "running",
    progress: 65,
    lastRun: "2024-01-15 08:00:00",
    nextRun: "2024-01-15 16:00:00"
  },
  { 
    id: 2,
    name: "Generate weekly reports",
    status: "completed",
    progress: 100,
    lastRun: "2024-01-14 23:00:00",
    nextRun: "2024-01-21 23:00:00"
  },
  { 
    id: 3,
    name: "Clean up old sessions",
    status: "pending", 
    progress: 0, 
    lastRun: "2024-01-10 02:00:00", 
    nextRun: "2024-01-16 02:00:00"
  },
  { 
    id: 4,
    name: "Update tutor availability", 
    status: "failed", 
    progress: 0, 
    lastRun: "2024-01-15 06:00:00", 
    nextRun: "2024-01-15 12:00:00" 
  },
];

export const AUDIT_LOGS: AuditLog[] = [
  { 
    id: "log-1", 
    actorId: "coord1", 
    actorRole: "Coordinator", 
    action: "Assigned tutor to student", 
    resource: "ManualAssignment", 
    details: {
      tutor: "tut-1", 
      student: "s-101" 
    },
    createdAt: "2024-01-15T10:30:00.000Z"
  },
  {
    id: "log-2",
    actorId: "coord1",
    actorRole: "Coordinator",
    action: "Resolved conflict",
    resource: "Conflict",
    details: { 
      conflictId: "conf-1",
      resolvedWith: "reschedule"
    }, 
    createdAt: "2024-01-15T09:15:00.000Z" 
  },
  { 
    id: "log-3",
    actorId: "coord2",
    actorRole: "Coordinator", 
    action: "Manual match created",
    resource: "ManualAssignment",
    details: {
      note: "advanced Physics"
    },
    createdAt: "2024-01-14T16:45:00.000Z" 
  },
  { 
    id: "log-4",
    actorId: "coord1",
    actorRole: "Coordinator", 
    action: "Report generated",
    resource: "Report",
    details: {
      report: "workload_jan_2024" 
    }, 
    createdAt: "2024-01-14T14:20:00.000Z" 
  },
];
