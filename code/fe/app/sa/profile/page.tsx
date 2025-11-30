"use client";

import React, { useEffect, useState } from "react";

type SAProfile = {
  fullName: string;
  staffId: string;
  email: string;
  department: string;
  role: string;
  scopes: string[];

  phone: string;
  personalEmail: string;
  shortIntro: string;

  twoFAEnabled: boolean;
  recoveryEmail: string;

  notifyParticipation: boolean;
  notifyCredits: boolean;
  notifyEscalations: boolean;

  timezone: string;
  defaultLanding: string;

  showMaintenanceBanner: boolean;
};

export default function SAProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SAProfile | null>(null);
  const [success, setSuccess] = useState(false);

  const onChange = (k: string, v: any) =>
    setProfile((prev: any) => ({ ...prev, [k]: v }));

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/sa/profile");
      const data = await res.json();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/sa/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    });

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  }

  if (loading || !profile)
    return (
      <div className="p-10 text-center text-gray-600">
        Loading profile…
      </div>
    );

  return (
    <div className="flex flex-col gap-6 px-5 py-6">

      {/* HEADER */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-xl font-semibold text-dark-blue">My Profile</h1>
        <p className="text-sm text-black/70 mt-1">
          Manage your SA account details, security settings, and notification preferences.
        </p>
      </section>

      {/* FORM */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-6">
        <form onSubmit={onSave} className="space-y-10">

          {/* SYSTEM-MANAGED */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Account Information (System-managed)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <FieldLocked label="Full name" value={profile.fullName} />
              <FieldLocked label="Staff ID" value={profile.staffId} />
              <FieldLocked label="Email (HCMUT)" value={profile.email} />
              <FieldLocked label="Department" value={profile.department} />
              <FieldLocked label="Role" value={profile.role} />

              <div className="md:col-span-2 text-sm">
                <span className="font-semibold text-dark-blue">Scopes</span>
                <div className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-3 mt-1">
                  <div className="flex flex-wrap gap-2">
                    {profile.scopes.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-white text-dark-blue border border-soft-white-blue text-xs"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className="text-[0.7rem] text-black/50 mt-2">
                    Assigned automatically by RBAC. Contact admin to request changes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-green-200">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditable
                label="Phone"
                value={profile.phone}
                onChange={(v) => onChange("phone", v)}
              />
              <FieldEditable
                label="Personal Email"
                type="email"
                value={profile.personalEmail}
                onChange={(v) => onChange("personalEmail", v)}
              />

              {/* INTRO / ABOUT */}
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">
                  Short Introduction
                </span>
                <textarea
                  rows={3}
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none"
                  value={profile.shortIntro}
                  onChange={(e) => onChange("shortIntro", e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* SECURITY */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-amber-200">
              Security
            </h2>

            <ToggleBox
              label="Two-factor authentication"
              description="Recommended for all SA accounts."
              checked={profile.twoFAEnabled}
              onChange={(v) => onChange("twoFAEnabled", v)}
            />

            <FieldEditable
              label="Recovery Email"
              type="email"
              value={profile.recoveryEmail}
              onChange={(v) => onChange("recoveryEmail", v)}
              hint="Used for account recovery and security alerts."
            />
          </div>

          {/* NOTIFICATIONS */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-blue-200">
              Notifications
            </h2>

            <ToggleBox
              label="Participation updates"
              description="Notify when participation reports change."
              checked={profile.notifyParticipation}
              onChange={(v) => onChange("notifyParticipation", v)}
            />

            <ToggleBox
              label="Credit approvals"
              description="Notify when training credits are issued."
              checked={profile.notifyCredits}
              onChange={(v) => onChange("notifyCredits", v)}
            />

            <ToggleBox
              label="Escalation alerts"
              description="Notify for tutoring-related escalation cases."
              checked={profile.notifyEscalations}
              onChange={(v) => onChange("notifyEscalations", v)}
            />
          </div>

          {/* PREFERENCES */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-purple-200">
              Preferences
            </h2>

            <FieldSelect
              label="Timezone"
              value={profile.timezone}
              onChange={(v) => onChange("timezone", v)}
              options={[
                ["Asia/Ho_Chi_Minh", "Asia/Ho_Chi_Minh (UTC+7)"],
                ["UTC", "UTC"],
                ["Asia/Bangkok", "Asia/Bangkok (UTC+7)"],
                ["Asia/Singapore", "Asia/Singapore (UTC+8)"],
              ]}
            />

            <FieldEditable
              label="Default Landing Page"
              value={profile.defaultLanding}
              onChange={(v) => onChange("defaultLanding", v)}
              hint="Page after login, e.g., /sa/dashboard"
            />
          </div>

          {/* SAVE BUTTON */}
          <div className="flex justify-end">
            <button className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-5 py-2 hover:bg-[#00539a] transition">
              Save changes
            </button>
          </div>
        </form>
      </section>

      {/* SUCCESS POPUP */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <p className="text-xl font-semibold text-green-700 text-center">
              Profile saved!
            </p>
            <p className="text-sm text-gray-600 text-center">
              Your changes have been updated successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function FieldLocked({ label, value }: any) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-dark-blue">{label}</span>
      <input
        disabled
        className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
        value={value}
      />
    </label>
  );
}

function FieldEditable({ label, value, onChange, type, hint }: any) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-dark-blue">{label}</span>
      <input
        type={type || "text"}
        className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="text-[0.7rem] text-black/50">{hint}</span>}
    </label>
  );
}

function FieldSelect({ label, value, onChange, options }: any) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-dark-blue">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2"
      >
        {options.map(([val, label]: any) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleBox({ label, description, checked, onChange }: any) {
  return (
    <div className="rounded-lg border border-soft-white-blue bg-soft-white-blue p-3 flex items-center justify-between mb-3">
      <div className="text-sm">
        <div className="font-semibold text-dark-blue">{label}</div>
        <div className="text-[0.8rem] text-black/60">{description}</div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}
