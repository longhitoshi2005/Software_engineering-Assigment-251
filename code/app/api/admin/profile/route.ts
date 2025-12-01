import { NextResponse } from "next/server";

/**
 * Mock system-managed info (không cho chỉnh)
 */
const systemInfo = {
  fullName: "Pham Quang Huy",
  staffId: "A-10293",
  email: "huy.pq@hcmut.edu.vn",
  department: "IT Services / Datacore Integration",
  role: "System Admin",
  scopes: [
    "users.read",
    "users.write",
    "roles.manage",
    "dept.read",
    "dept.write",
    "reports.export",
    "system.audit",
    "system.config",
  ],
};

/**
 * Mock editable profile (server memory only)
 */
let editableProfile = {
  phone: "+84 908 123 456",
  personalEmail: "admin.huy@gmail.com",
  shortIntro:
    "System administrator for TSS — focusing on SSO, DATACORE sync and audit compliance.",
  twoFAEnabled: true,
  recoveryEmail: "recovery.huy@gmail.com",
  notifySystemHealth: true,
  notifyExportJobs: true,
  notifyAuditAlerts: true,
  timezone: "Asia/Ho_Chi_Minh",
  defaultLanding: "/admin/dashboard",
  showMaintenanceBanner: false,
};

/**
 * GET — trả full merged profile
 */
export async function GET() {
  return NextResponse.json({
    ...systemInfo,
    ...editableProfile,
  });
}

/**
 * PUT — cập nhật profile editable
 */
export async function PUT(req: Request) {
  const body = await req.json();

  // merge vào editableProfile
  editableProfile = {
    ...editableProfile,
    ...body,
  };

  return NextResponse.json({
    success: true,
    updated: editableProfile,
  });
}
