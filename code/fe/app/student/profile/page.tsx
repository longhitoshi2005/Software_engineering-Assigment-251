"use client";

import { useState } from "react";
import Image from "next/image";
import { swalSuccess } from "@/app/lib/swal";

export default function StudentProfilePage() {
  // Non-editable fields (from system/DATACORE)
  const systemInfo = {
    fullName: "Nguyen Van A",
    studentId: "2353xxxx",
    program: "Computer Engineering (OISP)",
    email: "2353xxxx@hcmut.edu.vn",
    department: "Computer Science & Engineering",
  };

  // Editable fields
  const [form, setForm] = useState({
    phone: "+84 901 234 567",
    personalEmail: "a.nguyenvan@gmail.com",
    shortIntro: "Computer Science student passionate about web development and AI.",
  });

  // Show-only avatar: fetched from Google profile (by email). Fallback to initials on error.
  const [imageError, setImageError] = useState(false);
  const googleAvatarUrl = `https://www.google.com/s2/photos/profile/${encodeURIComponent(
    systemInfo.email
  )}?sz=200`;


  const onChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async (e?: React.FormEvent) => {
    // Prevent default form submission (which causes a page reload)
    e?.preventDefault();
    await swalSuccess("Profile saved successfully", "Your changes have been saved");
  };


  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          My Profile
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Manage your personal information.
        </p>
      </header>

      {/* Profile Form */}
      <div className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6">
        <form onSubmit={onSave} className="space-y-8">
          {/* Account Information (two-column layout) */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left: Profile photo (view-only, from Google) */}
              <div className="flex items-start md:items-center">
                <div className="flex flex-col items-center md:items-start gap-3">
                  <div className="w-28 h-28 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-xl overflow-hidden border-2 border-white shadow">
                    {!imageError ? (
                      // use Next Image for optimization; fallback handled via state
                      <Image
                        src={googleAvatarUrl}
                        alt="Google profile photo"
                        className="w-28 h-28 object-cover"
                        width={112}
                        height={112}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span>
                        {systemInfo.fullName
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: information grid (2 columns, 3 rows) */}
              <div className="md:col-span-2">
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
                    <span className="font-semibold text-dark-blue">Student ID</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={systemInfo.studentId}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm md:col-span-2">
                    <span className="font-semibold text-dark-blue">Program</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={systemInfo.program}
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
                </div>
              </div>
            </div>
          </div>
          {/* Editable Section */}
            <div>
            <h2 className="flex items-center justify-between text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              <span>Personal Information</span>
              <div>
              <button
                type="submit"
                disabled={
                form.phone === "+84 901 234 567" &&
                form.personalEmail === "a.nguyenvan@gmail.com" &&
                form.shortIntro ===
                  "Computer Science student passionate about web development and AI."
                }
                className={`whitespace-nowrap text-sm font-semibold rounded-lg px-5 py-2 transition ${
                form.phone === "+84 901 234 567" &&
                form.personalEmail === "a.nguyenvan@gmail.com" &&
                form.shortIntro ===
                  "Computer Science student passionate about web development and AI."
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-light-heavy-blue text-white hover:bg-[#00539a]"
                }`}
              >
                Save changes
              </button>
              </div>
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
                placeholder="Tell us about yourself..."
                value={form.shortIntro}
                onChange={(e) => onChange("shortIntro", e.target.value)}
              />
              </label>
            </div>
            </div>

          {/* Account Statistics */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Session Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-soft-white-blue rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-dark-blue">12</p>
                <p className="text-xs text-black/60 uppercase tracking-wide">Sessions Booked</p>
              </div>
              <div className="bg-soft-white-blue rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-dark-blue">8</p>
                <p className="text-xs text-black/60 uppercase tracking-wide">Sessions Completed</p>
              </div>
              <div className="bg-soft-white-blue rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-dark-blue">4.8</p>
                <p className="text-xs text-black/60 uppercase tracking-wide">Average Rating</p>
              </div>
              <div className="bg-soft-white-blue rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-dark-blue">67%</p>
                <p className="text-xs text-black/60 uppercase tracking-wide">Attendance Rate</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}