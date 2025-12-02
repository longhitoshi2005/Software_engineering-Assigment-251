export type SystemTask = { id: number; name: string; status: string; progress: number; lastRun: string; nextRun: string };
export type AuditLog = { id: string; actorId: string; actorRole?: string; action: string; resource?: string; details: Record<string, any> | string; createdAt: string };
