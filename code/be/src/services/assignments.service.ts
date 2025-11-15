import { Injectable, ForbiddenException } from '@nestjs/common';
import { MANUAL_ASSIGNMENTS, AUDIT_LOGS } from '../mocks/data.mock';

@Injectable()
export class AssignmentsService {
  async createAssignment(payload: any, actor: any) {
    if (!actor || !actor.sub) {
      throw new ForbiddenException('Missing actor');
    }

    const assignment = {
      id: `ma-${Date.now()}`,
      studentId: payload.studentId,
      tutorId: payload.tutorId,
      coordinatorId: actor.sub,
      reason: payload.reason,
      suggestionContext: payload.suggestionContext || null,
      createdAt: new Date().toISOString(),
    };

    MANUAL_ASSIGNMENTS.push(assignment);

    AUDIT_LOGS.push({
      id: `audit-${Date.now()}`,
      actorId: actor.sub,
      actorRole: actor.role,
      action: 'create_manual_assignment',
      resource: 'ManualAssignment',
      details: { assignment },
      createdAt: new Date().toISOString(),
    });

    return Promise.resolve(assignment);
  }

  async getById(id: string) {
    const a = MANUAL_ASSIGNMENTS.find((x) => x.id === id);
    return Promise.resolve(a || null);
  }
}
