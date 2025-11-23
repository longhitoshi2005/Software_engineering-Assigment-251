"use client";

import React, { useState } from "react";

type SystemAdminInfo = {
  fullName: string;
  staffId: string;
  email: string; // HCMUT email
  department: string;
  role: "System Admin" | "Department Admin";
  scopes: string[]; // quyền hệ thống
};

const systemInfo: SystemAdminInfo = {
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

const AdminProfilePage: React.FC = () => {
  // Editable fields
  const [form, setForm] = useState({
    phone: "+84 908 123 456",
    personalEmail: "admin.huy@gmail.com",
    shortIntro:
      "System administrator for TSS — focusing on SSO, DATACORE sync and audit compliance.",
    // Security
    twoFAEnabled: true,
    recoveryEmail: "recovery.huy@gmail.com",
    // Preferences
    notifySystemHealth: true,
    notifyExportJobs: true,
    notifyAuditAlerts: true,
    timezone: "Asia/Ho_Chi_Minh",
    defaultLanding: "/admin/dashboard",
    // System controls (display only toggles – not actually wiring to backend here)
    showMaintenanceBanner: false,
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const onChange = (k: string, v: any) =>
    setForm((s) => ({ ...s, [k]: v }));

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: call API to save changes
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">
          Admin Profile
        </h1>
        <p className="text-sm text-black/70 mt-1">
          Manage your admin account information, security settings, and system notifications.
        </p>
      </section>

      {/* Content */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <form onSubmit={onSave} className="space-y-10">
          {/* Non-editable */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Account Information (System-managed)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Full name</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.fullName}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Staff ID</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.staffId}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Email (HCMUT)</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.email}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Department</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.department}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Role</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.role}
                />
              </label>

              <div className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Scopes</span>
                <div className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 text-black/70 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {systemInfo.scopes.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-white text-dark-blue border border-soft-white-blue text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <p className="text-[0.7rem] text-black/50 mt-2">
                    Managed by RBAC; contact super-admin to request changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal info */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-green-200">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Phone</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Personal Email</span>
                <input
                  type="email"
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  value={form.personalEmail}
                  onChange={(e) => onChange("personalEmail", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Short Introduction</span>
                <textarea
                  rows={3}
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition resize-none"
                  placeholder="Tell others about your responsibilities and focus areas..."
                  value={form.shortIntro}
                  onChange={(e) => onChange("shortIntro", e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Security */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-amber-200">
              Security
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border border-soft-white-blue bg-soft-white-blue px-3 py-2">
                <div className="text-sm">
                  <div className="font-semibold text-dark-blue">Two-factor authentication</div>
                  <div className="text-[0.8rem] text-black/60">
                    Recommended for all admin accounts.
                  </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.twoFAEnabled}
                    onChange={(e) => onChange("twoFAEnabled", e.target.checked)}
                  />
                  <span className="text-dark-blue">Enabled</span>
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Recovery Email</span>
                <input
                  type="email"
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  value={form.recoveryEmail}
                  onChange={(e) => onChange("recoveryEmail", e.target.value)}
                />
                <span className="text-[0.7rem] text-black/50">
                  Used for account recovery and security alerts.
                </span>
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-blue-200">
              Preferences & Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Time zone</span>
                <select
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  value={form.timezone}
                  onChange={(e) => onChange("timezone", e.target.value)}
                >
                  <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Default landing page</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  value={form.defaultLanding}
                  onChange={(e) => onChange("defaultLanding", e.target.value)}
                />
                <span className="text-[0.7rem] text-black/50">
                  Page to open after login (e.g., <code>/admin/dashboard</code>).
                </span>
              </label>

              <div className="rounded-lg border border-soft-white-blue p-3 bg-soft-white-blue flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold text-dark-blue">System health alerts</div>
                  <div className="text-[0.8rem] text-black/60">
                    Notify when SSO/DATACORE/Library status changes.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.notifySystemHealth}
                  onChange={(e) => onChange("notifySystemHealth", e.target.checked)}
                />
              </div>

              <div className="rounded-lg border border-soft-white-blue p-3 bg-soft-white-blue flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-semibold text-dark-blue">Export job updates</div>
                  <div className="text-[0.8rem] text-black/60">
                    Notify when CSV/PDF exports finish or fail.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.notifyExportJobs}
                  onChange={(e) => onChange("notifyExportJobs", e.target.checked)}
                />
              </div>

              <div className="rounded-lg border border-soft-white-blue p-3 bg-soft-white-blue flex items-center justify-between md:col-span-2">
                <div className="text-sm">
                  <div className="font-semibold text-dark-blue">Audit & security alerts</div>
                  <div className="text-[0.8rem] text-black/60">
                    Notify for unusual logins, RBAC changes, and critical actions.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.notifyAuditAlerts}
                  onChange={(e) => onChange("notifyAuditAlerts", e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* System display controls (optional) */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-purple-200">
              System Display Controls (Local)
            </h2>
            <div className="rounded-lg border border-soft-white-blue p-3 bg-soft-white-blue flex items-center justify-between">
              <div className="text-sm">
                <div className="font-semibold text-dark-blue">Show maintenance banner</div>
                <div className="text-[0.8rem] text-black/60">
                  Toggle local maintenance banner (for demo/mock only).
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.showMaintenanceBanner}
                onChange={(e) => onChange("showMaintenanceBanner", e.target.checked)}
              />
            </div>
            {form.showMaintenanceBanner && (
              <div className="mt-3 text-sm rounded-md bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">
                Maintenance window planned: Friday 22:00–23:00 (mock banner).
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-5 py-2 hover:bg-[#00539a] transition"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* Success Popup (text-only for consistency) */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-slideUp">
            <div className="text-center space-y-3">
              <p className="text-xl font-semibold text-green-700">
                Profile saved successfully!
              </p>
              <p className="text-sm text-gray-600">
                Your admin preferences have been updated.
              </p>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-2 px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer mini */}
      <div className="text-center text-[0.65rem] text-black/40 py-4">
        TSS · Admin Profile · RBAC & Audit Ready
      </div>
    </div>
  );
};

export default AdminProfilePage;
