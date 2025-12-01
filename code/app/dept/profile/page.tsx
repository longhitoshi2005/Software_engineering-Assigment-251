"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { swalSuccess } from "@/lib/swal";

type DeptProfile = {
  fullName: string;
  staffId: string;
  email: string;
  role: string;
  department: string;

  officePhone: string;
  contactEmail: string;
  chairIntro: string;
};

export default function DeptProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DeptProfile | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const onChange = (k: string, v: any) => {
    setProfile((prev: any) => {
      if (!prev) return prev;
      return { ...prev, [k]: v };
    });
  };

  // -----------------------------
  // Load profile
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dept/profile");

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        const finalData = data.personal
          ? { ...data.system, ...data.personal }
          : data;

        setProfile(finalData);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // -----------------------------
  // Save profile
  // -----------------------------
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const payload = {
      officePhone: profile.officePhone,
      contactEmail: profile.contactEmail,
      chairIntro: profile.chairIntro,
    };

    try {
      const res = await fetch("/api/dept/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        swalSuccess("Saved", "Department profile updated.");
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  // -----------------------------
  // UI states
  // -----------------------------
  if (loading)
    return <div className="p-10 text-center text-gray-600">Loading…</div>;

  if (!profile)
    return (
      <div className="p-10 text-center text-red-500">
        Error loading profile.
      </div>
    );

  const emailForAvatar = profile.email || "default";
  const avatarURL = `https://www.google.com/s2/photos/profile/${encodeURIComponent(
    emailForAvatar
  )}?sz=200`;

  return (
    <div className="flex flex-col gap-6 px-5 py-6">
      {/* Header */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-xl font-semibold text-dark-blue">Department Profile</h1>
        <p className="text-sm text-black/70 mt-1">
          Department Chair information and contact details.
        </p>
      </section>

      {/* Form */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-6">
        <form onSubmit={onSave} className="space-y-10">
          {/* ================= SYSTEM INFO ================= */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Department Information (System-managed)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full bg-light-heavy-blue text-white flex items-center justify-center text-xl font-semibold overflow-hidden">
                  {!avatarError ? (
                    <Image
                      src={avatarURL}
                      width={112}
                      height={112}
                      alt="Avatar"
                      className="object-cover"
                      onError={() => setAvatarError(true)}
                      unoptimized
                    />
                  ) : (
                    <span>
                      {(profile.fullName || "User")
                        .split(" ")
                        .map((x) => x[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Locked fields */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldLocked label="Full Name" value={profile.fullName} />
                <FieldLocked label="Staff ID" value={profile.staffId} />
                <FieldLocked label="Email" value={profile.email} />
                <FieldLocked label="Department" value={profile.department} />
                <FieldLocked label="Role" value={profile.role} />
              </div>
            </div>
          </div>

          {/* ================= EDITABLE INFO ================= */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-green-200">
              Contact & Introduction
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FieldEditable
                label="Office Phone"
                value={profile.officePhone || ""}
                onChange={(v: any) => onChange("officePhone", v)}
              />

              <FieldEditable
                label="Contact Email"
                type="email"
                value={profile.contactEmail || ""}
                onChange={(v: any) => onChange("contactEmail", v)}
              />

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">
                  Chair Introduction
                </span>
                <textarea
                  rows={3}
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none"
                  value={profile.chairIntro || ""}
                  onChange={(e) => onChange("chairIntro", e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-5 py-2 hover:bg-[#00539a] transition">
              Save changes
            </button>
          </div>
        </form>
      </section>

      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <p className="text-xl font-semibold text-green-700 text-center">
              Changes saved!
            </p>
            <p className="text-sm text-gray-600 text-center">
              Department profile updated successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- COMPONENTS ---------- */
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

function FieldEditable({ label, value, onChange, type }: any) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-dark-blue">{label}</span>
      <input
        type={type || "text"}
        className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
