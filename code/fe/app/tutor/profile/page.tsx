"use client";
import React, { useState } from "react";

const TeacherProfile: React.FC = () => {
  // Non-editable fields (from system/DATACORE)
  const systemInfo = {
    fullName: "Dr. Nguyen Van A",
    staffId: "GV-2025-0137",
    title: "Lecturer",
    department: "Computer Science & Engineering",
    faculty: "School of Computer Science & Engineering (CSE)",
    email: "nguyenvana@hcmut.edu.vn",
  };

  // Editable fields
  const [form, setForm] = useState({
    phone: "+84 908 123 456",
    personalEmail: "nguyenvana.personal@gmail.com",
    officeLocation: "B4-205",
    officeHours: "Wed 14:00–16:00; Fri 09:00–11:00",
    shortIntro:
      "Lecturer in Computer Science focusing on Systems and Software Engineering. I mentor final-year projects and coordinate tutoring for CO1001/CO2002.",
    expertise: "Software Engineering, Operating Systems, Databases",
    homepage: "https://faculty.hcmut.edu.vn/nguyenvana",
    googleScholar: "https://scholar.google.com/citations?user=XXXX",
  });

  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const onChange = (k: string, v: string) =>
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
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">My Profile</h1>
        <p className="text-sm text-black/70 mt-1">Update your professional information.</p>
      </section>

      {/* Body */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <form onSubmit={onSave} className="space-y-8">
          {/* Non-editable Section */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
              Account Information
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
                <span className="font-semibold text-dark-blue">Academic Title/Rank</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.title}
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

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Department</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.department}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Faculty</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={systemInfo.faculty}
                />
              </label>
            </div>
          </div>

          {/* Editable Section */}
          <div>
            <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-green-200">
              Professional & Contact
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

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Office Location</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  placeholder="e.g., B4-205"
                  value={form.officeLocation}
                  onChange={(e) => onChange("officeLocation", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Office Hours</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  placeholder="e.g., Wed 14:00–16:00; Fri 09:00–11:00"
                  value={form.officeHours}
                  onChange={(e) => onChange("officeHours", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Short Introduction</span>
                <textarea
                  rows={3}
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition resize-none"
                  placeholder="Introduce your teaching/research interests..."
                  value={form.shortIntro}
                  onChange={(e) => onChange("shortIntro", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm md:col-span-2">
                <span className="font-semibold text-dark-blue">Expertise / Research Areas</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  placeholder="Comma-separated, e.g., Software Engineering, Operating Systems"
                  value={form.expertise}
                  onChange={(e) => onChange("expertise", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Homepage</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  placeholder="https://..."
                  value={form.homepage}
                  onChange={(e) => onChange("homepage", e.target.value)}
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Google Scholar</span>
                <input
                  className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 outline-none focus:border-light-light-blue focus:bg-white transition"
                  placeholder="https://scholar.google.com/..."
                  value={form.googleScholar}
                  onChange={(e) => onChange("googleScholar", e.target.value)}
                />
              </label>
            </div>
          </div>

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

      {/* Success Popup (no icons) */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="text-center space-y-3">
              <p className="text-xl font-semibold text-green-700">
                Profile saved successfully!
              </p>
              <p className="text-sm text-gray-600">
                Your changes have been saved.
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
    </div>
  );
};

export default TeacherProfile;