import { Injectable, ForbiddenException } from '@nestjs/common';
import { AUDIT_LOGS } from '../mocks/data.mock';

@Injectable()
export class ExportsService {
  async createExportJob(payload: any, actor: any) {
    // basic RBAC rules for mock:
    // - department-level reportType require departmentChair or admin
    // - 'studentAffairs' reports require studentAffairs or admin
    // - other broad exports require admin or programAdmin
    const reportType = payload.reportType || '';
    const role = actor?.role;

    const departmentTypes = ['department'];
    const studentAffairsTypes = ['participation', 'eligibility'];

    const isDept = departmentTypes.includes(reportType);
    const isSA = studentAffairsTypes.includes(reportType);

    if (isDept && !(role === 'departmentChair' || role === 'admin')) {
      throw new ForbiddenException('Insufficient role for department export');
    }

    if (isSA && !(role === 'studentAffairs' || role === 'admin')) {
      throw new ForbiddenException(
        'Insufficient role for student affairs export',
      );
    }

    if (!isDept && !isSA && !(role === 'admin' || role === 'programAdmin')) {
      throw new ForbiddenException('Insufficient role for this export');
    }

    const job = {
      jobId: `job-${Date.now()}`,
      status: 'queued',
      url: null,
    };

    AUDIT_LOGS.push({
      id: `audit-${Date.now()}`,
      actorId: actor?.sub || 'unknown',
      actorRole: role,
      action: 'create_export',
      resource: 'ExportJob',
      details: { payload },
      createdAt: new Date().toISOString(),
    });

    return Promise.resolve(job);
  }
}
