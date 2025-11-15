import { Injectable } from '@nestjs/common';
import { TUTORS, AUDIT_LOGS } from '../mocks/data.mock';

@Injectable()
export class AdminService {
  async createTutors(tutors: any[]) {
    // pretend to create tutors - count
    const created = tutors.length;
    // append to mock TUTORS (shallow)
    tutors.forEach((t) => TUTORS.push(t));

    AUDIT_LOGS.push({
      id: `audit-${Date.now()}`,
      actorId: 'system',
      actorRole: 'admin',
      action: 'bulk_create_tutors',
      resource: 'Tutor',
      details: { created },
      createdAt: new Date().toISOString(),
    });

    return Promise.resolve({ created });
  }

  async getAuditLogs(since?: string, actorId?: string) {
    const logs = AUDIT_LOGS.filter((l) => {
      if (since && new Date(l.createdAt) < new Date(since)) return false;
      if (actorId && l.actorId !== actorId) return false;
      return true;
    });
    return Promise.resolve(logs);
  }
}
