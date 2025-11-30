"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { swalSuccess, swalError, swalConfirm } from "@/lib/swal";
import api from "@/lib/api";

// State Machine Types
type ViewMode = "VIEW_MODE" | "EDIT_MODE";

interface StudentProfile {
  id: string;
  user_id: string;
  // Section I: Identity & Academic Info (Read-only)
  full_name: string;
  sso_id: string;
  email_edu: string;
  academic_major: string | null;
  class_code: string | null;
  current_year: number | null;
  student_status: string | null;
  // Section II: Personal Contact & Profile (Editable)
  bio: string | null;
  email_personal: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  // Section III: Learning Profile (Read-only stats)
  stats: {
    total_learning_hours: number;
    total_sessions: number;
    total_tutors_met: number;
    attendance_rate: number;
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("VIEW_MODE");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  
  // Editable form state (Section II only)
  const [form, setForm] = useState({
    bio: "",
    email_personal: "",
  });

  const [initialForm, setInitialForm] = useState({
    bio: "",
    email_personal: "",
  });

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get("/students/me");
        setProfile(data);
        const formData = {
          bio: data.bio || "",
          email_personal: data.email_personal || "",
        };
        setForm(formData);
        setInitialForm(formData);
      } catch (error) {
        console.error("Failed to load profile:", error);
        await swalError("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Guard against navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (mode === "EDIT_MODE" && hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [mode, form, initialForm]);

  const onChange = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const hasUnsavedChanges = (): boolean => {
    return (
      form.bio !== initialForm.bio ||
      form.email_personal !== initialForm.email_personal
    );
  };

  const handleEdit = () => {
    setMode("EDIT_MODE");
  };

  const handleCancel = async () => {
    if (hasUnsavedChanges()) {
      const confirmed = await swalConfirm(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?"
      );
      if (!confirmed) return;
    }
    setForm(initialForm);
    setMode("VIEW_MODE");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const updateData = {
        bio: form.bio || null,
        email_personal: form.email_personal || null,
      };
      
      const updated = await api.put("/students/me", updateData);
      setProfile(updated);
      const newFormData = {
        bio: updated.bio || "",
        email_personal: updated.email_personal || "",
      };
      setForm(newFormData);
      setInitialForm(newFormData);
      setMode("VIEW_MODE");
      await swalSuccess("Profile saved successfully", "Your changes have been saved");
    } catch (error) {
      console.error("Failed to save profile:", error);
      await swalError("Error", "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      await swalError("Invalid File", "Please select an image file (JPG, PNG, GIF, WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      await swalError("File Too Large", "Image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/users/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      
      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar_url: data.avatar_url });
      }
      
      await swalSuccess("Success", "Avatar uploaded successfully!");
    } catch (error) {
      console.error("Avatar upload failed:", error);
      await swalError("Upload Failed", "Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-white-blue">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  const isEditMode = mode === "EDIT_MODE";

  return (
    <div className="min-h-screen bg-soft-white-blue p-4 md:p-8 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Student Profile
          </h1>
          <p className="text-sm text-black/70 mt-1">
            Manage your learning profile and contact information
          </p>
        </div>
        {!isEditMode && (
          <button
            onClick={handleEdit}
            className="bg-light-heavy-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#00539a] transition"
          >
            Edit Profile
          </button>
        )}
      </header>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section I: Identity & Academic Info (Always Read-only) */}
        <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
            Identity & Academic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-4 items-start">
            {/* Avatar - First column */}
            <div className="md:row-span-4 flex justify-center md:justify-start">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-soft-white-blue bg-gray-100">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-light-heavy-blue text-white text-4xl font-bold">
                      {profile.full_name?.charAt(0).toUpperCase() || "S"}
                    </div>
                  )}
                </div>
                
                {/* Click to edit overlay (always visible for students) */}
                <input
                  type="file"
                  id="student-avatar-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
                <label
                  htmlFor="student-avatar-upload"
                  className={`absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                    uploadingAvatar ? "opacity-100" : ""
                  }`}
                >
                  {uploadingAvatar ? (
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-1"></div>
                      <p className="text-xs">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-white text-center px-2">
                      <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-xs font-semibold">Click to edit</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Identity fields - Second and third columns */}
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-dark-blue">Full Name</span>
              <input
                disabled
                className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                value={profile.full_name}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-dark-blue">Student ID</span>
              <input
                disabled
                className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                value={profile.sso_id}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-dark-blue">Email (HCMUT)</span>
              <input
                disabled
                className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                value={profile.email_edu}
              />
            </label>

            {profile.academic_major && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Major</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={profile.academic_major}
                />
              </label>
            )}

            {profile.class_code && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Class Code</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={profile.class_code}
                />
              </label>
            )}

            {profile.current_year && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Current Year</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={`Year ${profile.current_year}`}
                />
              </label>
            )}
          </div>
        </section>

        {/* Section II: Personal Contact & Profile (Editable in EDIT_MODE) */}
        <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
            Personal Profile & Contact Information
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold text-dark-blue">Bio / Introduction</span>
              <textarea
                disabled={!isEditMode}
                rows={4}
                className={`rounded-lg border px-3 py-2 transition resize-none ${
                  isEditMode
                    ? "bg-soft-white-blue border-soft-white-blue outline-none focus:border-light-light-blue focus:bg-white"
                    : "bg-black/5 border-soft-white-blue cursor-not-allowed text-black/60"
                }`}
                value={form.bio}
                onChange={(e) => onChange("bio", e.target.value)}
                placeholder="Introduce yourself and your learning goals..."
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Personal Email</span>
                <input
                  type="email"
                  disabled={!isEditMode}
                  className={`rounded-lg border px-3 py-2 transition ${
                    isEditMode
                      ? "bg-soft-white-blue border-soft-white-blue outline-none focus:border-light-light-blue focus:bg-white"
                      : "bg-black/5 border-soft-white-blue cursor-not-allowed text-black/60"
                  }`}
                  value={form.email_personal}
                  onChange={(e) => onChange("email_personal", e.target.value)}
                  placeholder="your.email@gmail.com"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-dark-blue">Phone Number</span>
                <input
                  disabled
                  className="rounded-lg bg-black/5 border border-soft-white-blue px-3 py-2 cursor-not-allowed text-black/60"
                  value={profile.phone_number || "Not provided"}
                />
                <span className="text-xs text-black/50">Synced from DataCore (read-only)</span>
              </label>
            </div>
          </div>

          {isEditMode && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-soft-white-blue">
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-dark-blue bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasUnsavedChanges() || saving}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
                  !hasUnsavedChanges() || saving
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-light-heavy-blue text-white hover:bg-[#00539a]"
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </section>

        {/* Section III: Learning Profile & Stats (Always Read-only) */}
        <section className="bg-white border border-black/5 rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-dark-blue mb-4 pb-2 border-b-2 border-soft-white-blue">
            Learning Profile & Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-soft-white-blue rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-dark-blue">
                {profile.stats.total_sessions}
              </p>
              <p className="text-xs text-black/60 uppercase tracking-wide">Sessions</p>
            </div>
            <div className="bg-soft-white-blue rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-dark-blue">
                {profile.stats.total_learning_hours.toFixed(1)}h
              </p>
              <p className="text-xs text-black/60 uppercase tracking-wide">Learning Hours</p>
            </div>
            <div className="bg-soft-white-blue rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-dark-blue">
                {profile.stats.total_tutors_met}
              </p>
              <p className="text-xs text-black/60 uppercase tracking-wide">Tutors Met</p>
            </div>
            <div className="bg-soft-white-blue rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-dark-blue">
                {profile.stats.attendance_rate}%
              </p>
              <p className="text-xs text-black/60 uppercase tracking-wide">Attendance Rate</p>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}