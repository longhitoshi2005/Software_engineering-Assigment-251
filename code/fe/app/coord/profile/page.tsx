"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { swalSuccess } from "@/lib/swal";

type CoordProfile = {
  fullName: string;
  staffId: string;
  email: string;
  role: string;
  department: string;
  program: string;

  phone: string;
  personalEmail: string;
  shortIntro: string;
};

export default function CoordProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoordProfile | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Helper để update state an toàn
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
        const res = await fetch("/api/coord/profile");
        
        if (!res.ok) {
          throw new Error(`API Error: ${res.status}`);
        }

        const data = await res.json();
        // Xử lý logic gộp dữ liệu system và personal
        const finalData = data.personal ? { ...data.system, ...data.personal } : data;
        setProfile(finalData);
        
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Có thể setProfile một giá trị default rỗng để tránh crash nếu muốn
      } finally {
        // Luôn tắt loading dù thành công hay thất bại
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

    try {
      const payload = {
        phone: profile.phone,
        personalEmail: profile.personalEmail,
        shortIntro: profile.shortIntro,
      };

      const res = await fetch("/api/coord/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }, // Thêm header này
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2500);
        swalSuccess("Saved", "Your profile has been updated.");
      }
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-600">
        Loading profile...
      </div>
    );

  // Nếu loading xong mà không có profile (do lỗi API)
  if (!profile) {
    return (
      <div className="p-10 text-center text-red-500">
        Error loading profile data. Please try again later.
      </div>
    );
  }

  // Avatar Logic
  // Fallback an toàn nếu email không tồn tại
  const emailForAvatar = profile.email || "default";
  const avatarURL = `https://www.google.com/s2/photos/profile/${encodeURIComponent(
    emailForAvatar
  )}?sz=200`;

  return (
    <div className="flex flex-col gap-6 px-5 py-6">

      {/* HEADER */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-xl font-semibold text-dark-blue">My Profile</h1>
        <p className="text-sm text-black/70 mt-1">
          Coordinator account information and personal preferences.
        </p>
      </section>

      {/* FORM CARD */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-6">
        <form onSubmit={onSave} className="space-y-10">

          {/* ================= ACCOUNT INFO ================= */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Account Information (System-managed)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-28 h-28 rounded-full bg-light-heavy-blue text-white flex items-center justify-center text-2xl font-semibold overflow-hidden relative">
                  {!avatarError ? (
                    <Image
                      src={avatarURL}
                      width={112}
                      height={112}
                      alt="Avatar"
                      className="object-cover"
                      onError={() => setAvatarError(true)}
                      unoptimized // Thêm dòng này nếu bạn lười config domain trong next.config.js
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

              {/* Locked fields - Thêm fallback || "-" */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldLocked label="Full name" value={profile.fullName || "-"} />
                <FieldLocked label="Staff ID" value={profile.staffId || "-"} />
                <FieldLocked label="Email (HCMUT)" value={profile.email || "-"} />
                <FieldLocked label="Department" value={profile.department || "-"} />
                <FieldLocked label="Role" value={profile.role || "-"} />

                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                  <span className="font-semibold text-dark-blue">Program</span>
                  <input
                    disabled
                    className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                    value={profile.program || "-"}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ================= PERSONAL INFO ================= */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-green-200">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QUAN TRỌNG: Thêm || "" để tránh lỗi uncontrolled input */}
              <FieldEditable
                label="Phone"
                value={profile.phone || ""} 
                onChange={(v: any) => onChange("phone", v)}
              />
              <FieldEditable
                label="Personal Email"
                type="email"
                value={profile.personalEmail || ""}
                onChange={(v: any) => onChange("personalEmail", v)}
              />

              {/* Short Intro */}
              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Short Introduction</span>
                <textarea
                  rows={3}
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none"
                  value={profile.shortIntro || ""}
                  onChange={(e) => onChange("shortIntro", e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* SAVE */}
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

/* ---------- COMPONENTS ---------- */
function FieldLocked({ label, value }: any) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-semibold text-dark-blue">{label}</span>
      <input
        disabled
        readOnly
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