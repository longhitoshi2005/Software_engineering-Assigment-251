import { Role } from '../../schemas';

export const ADMIN_ROLES = [Role.ADMIN];
export const STAFF_ROLES = [Role.ADMIN, Role.COORDINATOR];
export const TEACHING_ROLES = [Role.ADMIN, Role.COORDINATOR, Role.TUTOR];
