// Mapping of coord routes to allowed roles for soft-guarding.
import { Role } from '@/app/lib/role';

export const COORD_PERMISSION_OVERRIDES: Record<string, Role[]> = {
  '/coord/rbac': [Role.ProgramAdmin],
  '/coord/integrations': [Role.ProgramAdmin],
  '/coord/system-tasks': [Role.ProgramAdmin],
  '/coord/audit-logs': [Role.ProgramAdmin],

  '/coord/feedback-dashboard': [Role.DepartmentChair, Role.ProgramAdmin],

  // export jobs management is considered a ProgramAdmin responsibility
  '/coord/export-jobs': [Role.ProgramAdmin],
};

export default COORD_PERMISSION_OVERRIDES;
