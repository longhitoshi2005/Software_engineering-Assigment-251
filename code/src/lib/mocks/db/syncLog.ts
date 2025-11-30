// lib/mocks/db/syncLog.ts

export type SyncActor = "system" | "admin";
export type SyncScope = "users" | "roles" | "profiles" | "all";
export type SyncStatus = "OK" | "PARTIAL" | "FAILED";

export interface SyncLog {
  id: string;
  at: string; // display string
  actor: SyncActor;
  scope: SyncScope;
  status: SyncStatus;
  details?: string;
}

/**
 * MOCK DATABASE — lưu trong RAM
 */
export let syncLogs: SyncLog[] = [
  {
    id: "L-210",
    at: "2025-11-02 08:05",
    actor: "system",
    scope: "roles",
    status: "OK",
    details: "84 roles updated",
  },
  {
    id: "L-209",
    at: "2025-11-01 21:15",
    actor: "admin",
    scope: "users",
    status: "PARTIAL",
    details: "timeout at page 7/10",
  },
  {
    id: "L-208",
    at: "2025-11-01 07:00",
    actor: "system",
    scope: "all",
    status: "OK",
    details: "full sync",
  },
  {
    id: "L-207",
    at: "2025-10-31 21:00",
    actor: "system",
    scope: "roles",
    status: "FAILED",
    details: "SSO token expired",
  },
];

/**
 * Helper: generate new log ID
 */
export function nextLogId(): string {
  const latest = syncLogs[0]?.id ?? "L-200";
  const num = Number(latest.replace("L-", ""));
  return `L-${num + 1}`;
}

/**
 * Add new sync log
 */
export function addSyncLog(log: Omit<SyncLog, "id" | "at">) {
  const now = new Date().toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  syncLogs.unshift({
    id: nextLogId(),
    at: now.replace(",", ""),
    ...log,
  });
}
