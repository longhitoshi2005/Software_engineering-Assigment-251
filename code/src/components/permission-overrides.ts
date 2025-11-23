// Mapping of coord routes to allowed roles for soft-guarding.
import { Role } from '@/lib/role';

export const COORD_PERMISSION_OVERRIDES: Record<string, Role[]> = {
  '/coord/rbac': [Role.PROGRAM_ADMIN],
  '/coord/integrations': [Role.PROGRAM_ADMIN],
  '/coord/system-tasks': [Role.PROGRAM_ADMIN],
  '/coord/audit-logs': [Role.PROGRAM_ADMIN],

  '/coord/feedback-dashboard': [Role.DEPARTMENT_CHAIR, Role.PROGRAM_ADMIN],

  // export jobs management is considered a ProgramAdmin responsibility
  '/coord/export-jobs': [Role.PROGRAM_ADMIN],
};

export default COORD_PERMISSION_OVERRIDES;
