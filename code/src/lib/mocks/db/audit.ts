// lib/mocks/db/audit.ts

export type AuditRecord = {
  id: string;
  actorId: string;
  actorRole: string;
  eventType: string;
  resource: string;
  details?: any;
  createdAt: string; // stored as ISO string
};

export let AUDIT_LOGS: AuditRecord[] = [
  {
    id: "L-0001",
    actorId: "system",
    actorRole: "SYSTEM",
    eventType: "SYSTEM_START",
    resource: "System",
    details: { msg: "System boot" },
    createdAt: new Date("2025-11-28T08:00:00Z").toISOString(),
  },
  {
    id: "L-0002",
    actorId: "admin01",
    actorRole: "PROGRAM_ADMIN",
    eventType: "EXPORT",
    resource: "DepartmentalReport",
    details: { format: "PDF", jobId: "E-201" },
    createdAt: new Date("2025-10-21T21:15:00Z").toISOString(),
  },
  {
    id: "L-0003",
    actorId: "coord01",
    actorRole: "COORDINATOR",
    eventType: "ROLE_CHANGE",
    resource: "User:2352525",
    details: { added: ["TUTOR"], removed: [] },
    createdAt: new Date("2025-10-22T09:30:00Z").toISOString(),
  },
  {
    id: "L-0004",
    actorId: "datacore",
    actorRole: "DATACORE",
    eventType: "SYNC",
    resource: "DataCore",
    details: { status: "OK", synced: 120 },
    createdAt: new Date("2025-11-29T01:05:00Z").toISOString(),
  },
];
