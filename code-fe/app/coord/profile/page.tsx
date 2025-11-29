"use client";

import { useState } from "react";
import Image from "next/image";
import { swalSuccess } from "@/lib/swal";

export default function CoordProfilePage() {
  // Read-only system information (synced from HCMUT_DATACORE in production)
  const mock_systemInfo = {
    fullName: "Tran Thi B",
    staffId: "C-2024001",
    email: "b.tran@hcmut.edu.vn",
    role: "Coordinator",
    department: "Center for Tutoring Services",
    program: "",
  };

  // Editable personal fields (keep an `initialForm` so we can detect changes)
  const mock_initialForm = {
    phone: "+84 912 345 678",
    personalEmail: "b.tran.personal@gmail.com",
    shortIntro: "Coordinator focused on ensuring high-quality tutoring and smooth operations.",
  };

  const [form, setForm] = useState(mock_initialForm);

  const [imageError, setImageError] = useState(false);
  const mock_googleAvatarUrl = `https://www.google.com/s2/photos/profile/${encodeURIComponent(
    mock_systemInfo.email
  )}?sz=200`;

  const onChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // In a real app this would call an API; show success toast for demo
    await swalSuccess("Profile saved successfully", "Your changes have been saved");
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">My Profile</h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">Coordinator account and personal information.</p>
      </header>

      <div className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6">
        <form onSubmit={onSave} className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">Account Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="flex items-start md:items-center">
                <div className="flex flex-col items-center md:items-start gap-3">
                  <div className="w-28 h-28 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-xl overflow-hidden border-2 border-white shadow">
                    {!imageError ? (
                      <Image
                        src={mock_googleAvatarUrl}
                        alt="Google profile photo"
                        className="w-28 h-28 object-cover"
                        width={112}
                        height={112}
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span>
                        {mock_systemInfo.fullName
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-dark-blue">Full name</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.fullName}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-dark-blue">Staff ID</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.staffId}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm md:col-span-2">
                    <span className="font-semibold text-dark-blue">Program</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.program || "-"}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-dark-blue">Email (HCMUT)</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.email}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-dark-blue">Department</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.department}
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold text-dark-blue">Role</span>
                    <input
                      disabled
                      className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                      value={mock_systemInfo.role}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="flex items-center justify-between text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              <span>Personal Information</span>
              <div>
                {/** Disable save unless at least one field changed from initial */}
                {(() => {
                  const isPristine =
                    form.phone === mock_initialForm.phone &&
                    form.personalEmail === mock_initialForm.personalEmail &&
                    form.shortIntro === mock_initialForm.shortIntro;

                  return (
                    <button
                      type="submit"
                      disabled={isPristine}
                      className={`whitespace-nowrap text-sm font-semibold rounded-lg px-5 py-2 transition ${
                        isPristine
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-light-heavy-blue text-white hover:bg-[#00539a]"
                      }`}
                    >
                      Save changes
                    </button>
                  );
                })()}
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
        </form>
      </div>
    </div>
  );
}
