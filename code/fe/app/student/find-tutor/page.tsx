"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import TUTORS from "@/app/lib/tutors";

export default function FindTutorPage() {
  const router = useRouter();

  const tutors = useMemo(() => TUTORS, []);

  // FILTER STATE
  const [subjectFilter, setSubjectFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("Any time");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [expertiseFilter, setExpertiseFilter] = useState("");
  const [preferencesFilter, setPreferencesFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("Any"); // Any | Online | In-person

  const slotMatchesTimeOfDay = (slotTime: string, filter: string) => {
    if (!filter || filter === "Any time") return true;
    // very small heuristic: morning 07-12, afternoon 12-17, evening 17-21
    const hour = Number(slotTime.split(" ")[1]?.split(":")[0]);
    if (Number.isNaN(hour)) return true;
    if (filter === "Morning (07:00 - 12:00)") return hour >= 7 && hour < 12;
    if (filter === "Afternoon (12:00 - 17:00)") return hour >= 12 && hour < 17;
    if (filter === "Evening (17:00 - 21:00)") return hour >= 17 && hour < 21;
    return true;
  };

  const filteredTutors = useMemo(() => {
    return tutors.filter((tutor) => {
      // Subject filter
      if (subjectFilter && !tutor.subject.toLowerCase().includes(subjectFilter.toLowerCase())) return false;
      // Department filter
      if (departmentFilter && departmentFilter !== "All Departments" && tutor.department !== departmentFilter) return false;
      // Availability (time of day)
      if (availabilityFilter && availabilityFilter !== "Any time") {
          const has = (tutor.slots ?? []).some((s) => slotMatchesTimeOfDay(s.time, availabilityFilter));
          if (!has) return false;
        }
      // Mode filter
      if (modeFilter && modeFilter !== "Any") {
        const wantsOnline = modeFilter === "Online";
        const hasMode = (tutor.slots ?? []).some((s) => {
          const m = s.mode.toLowerCase();
          const isOnline = m.includes("online");
          return wantsOnline ? isOnline : !isOnline;
        });
        if (!hasMode) return false;
      }
      // Expertise filter
      if (expertiseFilter && !tutor.expertise?.toLowerCase().includes(expertiseFilter.toLowerCase())) return false;
      // Preferences filter (tutor-provided)
      if (preferencesFilter && !tutor.preferences?.toLowerCase().includes(preferencesFilter.toLowerCase())) return false;

      return true;
    });
  }, [tutors, subjectFilter, departmentFilter, availabilityFilter, expertiseFilter, preferencesFilter, modeFilter]);

  const handleBook = (tutor: typeof tutors[0]) => {
    // Navigate to booking page (backend should accept tutor id in query in future)
    router.push(`/student/book-session?tutorId=${tutor.id}`);
  };

  const handleViewProfile = (tutor: typeof tutors[0]) => {
    router.push(`/student/tutor/${tutor.id}`);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Find a Tutor</h1>
        <p className="text-sm text-black/70 mt-1">
          Browse approved tutors or request a match. Filter by subject, department, or
          available time. Booking is the primary action; direct messaging is supported later
          via Community.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">
              Subject / Course code
            </label>
            <input
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="e.g. CO1001, Calculus I"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Availability</label>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option>Any time</option>
              <option>Morning (07:00 - 12:00)</option>
              <option>Afternoon (12:00 - 17:00)</option>
              <option>Evening (17:00 - 21:00)</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option>All Departments</option>
              <option>Computer Science and Engineering</option>
              <option>Electrical & Electronics Engineering</option>
              <option>Applied Mathematics</option>
            </select>
          </div>
        </div>
        {/* Additional filters: expertise, preferences, mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Expertise</label>
            <input
              value={expertiseFilter}
              onChange={(e) => setExpertiseFilter(e.target.value)}
              placeholder="e.g. recursion, lab debugging"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Preferences (from tutor)</label>
            <input
              value={preferencesFilter}
              onChange={(e) => setPreferencesFilter(e.target.value)}
              placeholder="e.g. whiteboard, bring code"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="Any">Any</option>
              <option value="Online">Online</option>
              <option value="In-person">In-person</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#00539a] transition">
            Search
          </button>
          <button
            onClick={() => {
              setSubjectFilter("");
              setAvailabilityFilter("Any time");
              setDepartmentFilter("All Departments");
              setExpertiseFilter("");
              setPreferencesFilter("");
              setModeFilter("Any");
            }}
            className="bg-white text-dark-blue text-sm font-semibold rounded-lg px-4 py-2 border border-soft-white-blue hover:bg-soft-white-blue/70 transition"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Tutor list */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTutors.length === 0 && (
          <p className="text-sm text-black/60">No tutors match your filters.</p>
        )}

        {filteredTutors.length > 0 &&
          filteredTutors.map((tutor) => (
            <article
              key={tutor.id}
              className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {tutor.image ? (
                    <Image
                      src={tutor.image}
                      alt={`${tutor.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-sm">
                      {tutor.name.split(" ").map((s) => s[0]).slice(0,2).join("")}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-semibold text-dark-blue">{tutor.name}</h2>
                    <p className="text-xs text-black/60">{tutor.role}</p>
                    <p className="text-sm text-black/80 mt-1">
                      {tutor.subject}
                      <br />
                      <span className="text-xs text-black/50">{tutor.department}</span>
                    </p>
                    {tutor.expertise && (
                      <p className="text-xs text-black/60 mt-2">
                        <span className="font-semibold text-dark-blue">Expertise:</span> {tutor.expertise}
                      </p>
                    )}
                    {tutor.preferences && (
                      <p className="text-xs text-black/60 mt-1 italic">(Preferences: {tutor.preferences})</p>
                    )}
                  </div>
                </div>

                <span className="bg-light-light-blue/10 text-light-heavy-blue text-[0.65rem] font-semibold px-2 py-1 rounded-md">
                  {tutor.match}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs font-semibold text-dark-blue">Next available:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(tutor.slots ?? []).map((slot) => (
                      <span
                        key={slot.time + slot.mode}
                        className="inline-flex items-center gap-1 bg-soft-white-blue border border-soft-white-blue rounded-md px-2 py-1 text-[0.7rem] text-dark-blue"
                      >
                        {slot.time} · {slot.mode}
                        {slot.remaining ? (
                          <span className="text-[0.6rem] text-black/50">({slot.remaining})</span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-black/50">
                  Status: <span className="text-black/80">{tutor.status}</span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleBook(tutor)}
                  className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-3 py-2 hover:bg-[#00539a] transition"
                >
                  Book session
                </button>
                <button
                  onClick={() => handleViewProfile(tutor)}
                  className="bg-white text-light-heavy-blue text-sm font-semibold rounded-lg px-3 py-2 border border-light-heavy-blue hover:bg-light-light-blue/10 transition"
                >
                  View profile
                </button>
              </div>
            </article>
          ))}
      </section>
    </div>
  );
}
