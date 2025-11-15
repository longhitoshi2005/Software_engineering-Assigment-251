interface RoleConfig {
  name: string;
  permissions: string[];
}

export const ROLES_CONFIG: RoleConfig[] = [
  { 
    name: "Admin", 
    permissions: ["*"] 
  },
  { 
    name: "Coordinator", 
    permissions: ["assign:create", "assign:read", "assign:review"] 
  },
  { 
    name: "Tutor", 
    permissions: ["session:manage", "availability:update"] 
  },
  { 
    name: "Student", 
    permissions: ["request:create", "session:view"] 
  },
  { 
    name: "StudentAffairs", 
    permissions: ["reports:view", "eligibility:compute"] 
  },
  { 
    name: "ProgramAdmin", 
    permissions: ["exports:create", "audit:read"] 
  },
  { 
    name: "DepartmentChair", 
    permissions: ["reports:view", "dept:export"] 
  }
];