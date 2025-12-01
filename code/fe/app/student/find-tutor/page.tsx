"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import { TutorSearchResult, TutorSearchRequest } from "@/types/tutorSearch";
import { LocationMode, LocationModeLabels } from "@/types/location";
import { formatTimeRange } from "@/lib/dateUtils";
import {BASE_API_URL} from "@/config/env"


interface PublicSession {
  id: string;
  tutor_id: string;
  tutor_name: string;
  course_code: string;
  course_name: string;
  topic: string;
  start_time: string;
  end_time: string;
  mode: string;
  location: string | null;
  max_capacity: number;
  available_slots: number;
  is_joined?: boolean;
}

export default function FindTutorPage() {
  const router = useRouter();

  // State
  const [tutors, setTutors] = useState<TutorSearchResult[]>([]);
  const [publicSessions, setPublicSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FILTER STATE
  const [subjectFilter, setSubjectFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState("");
  const [modeFilter, setModeFilter] = useState<LocationMode | "">("");

  // Autocomplete state
  const [subjectSuggestions, setSubjectSuggestions] = useState<Array<{code: string, name: string}>>([]);
  const [departmentSuggestions, setDepartmentSuggestions] = useState<string[]>([]);
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [showDepartmentSuggestions, setShowDepartmentSuggestions] = useState(false);
  
  const subjectInputRef = useRef<HTMLInputElement>(null);
  const departmentInputRef = useRef<HTMLInputElement>(null);

  // Extract unique subjects and departments from current tutors
  useEffect(() => {
    if (tutors.length > 0) {
      // Extract unique courses with code and name
      const subjectsMap = new Map<string, {code: string, name: string}>();
      tutors.forEach(tutor => {
        tutor.subjects.forEach(subject => {
          if (!subjectsMap.has(subject.course_code)) {
            subjectsMap.set(subject.course_code, {
              code: subject.course_code,
              name: subject.course_name
            });
          }
        });
      });
      setSubjectSuggestions(Array.from(subjectsMap.values()).sort((a, b) => a.code.localeCompare(b.code)));

      // Extract unique departments (from academic_major)
      const departments = new Set<string>();
      tutors.forEach(tutor => {
        if (tutor.academic_major) {
          departments.add(tutor.academic_major);
        }
      });
      setDepartmentSuggestions(Array.from(departments).sort());
    }
  }, [tutors]);

  // Filter suggestions based on input
  const filteredSubjectSuggestions = useMemo(() => {
    if (!subjectFilter) return [];
    const query = subjectFilter.toLowerCase();
    return subjectSuggestions.filter(s => 
      s.code.toLowerCase().includes(query) || 
      s.name.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [subjectFilter, subjectSuggestions]);

  const filteredDepartmentSuggestions = useMemo(() => {
    if (!departmentFilter) return [];
    return departmentSuggestions.filter(d => 
      d.toLowerCase().includes(departmentFilter.toLowerCase())
    ).slice(0, 10);
  }, [departmentFilter, departmentSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subjectInputRef.current && !subjectInputRef.current.contains(event.target as Node)) {
        setShowSubjectSuggestions(false);
      }
      if (departmentInputRef.current && !departmentInputRef.current.contains(event.target as Node)) {
        setShowDepartmentSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch tutors from API
  const searchTutors = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams: TutorSearchRequest = {
        limit: 20,
        offset: 0,
      };

      if (subjectFilter) searchParams.subject = subjectFilter;
      if (departmentFilter) searchParams.department = departmentFilter;
      if (tagsFilter) searchParams.tags = tagsFilter.split(",").map(t => t.trim()).filter(Boolean);
      if (modeFilter) searchParams.mode = modeFilter as LocationMode;

      const response = await fetch(`${BASE_API_URL}/tutors/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`Failed to search tutors: ${response.statusText}`);
      }

      const data: TutorSearchResult[] = await response.json();
      setTutors(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tutors";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Search Failed",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch public sessions from API
  const searchPublicSessions = async () => {
    setLoadingSessions(true);

    try {
      const params = new URLSearchParams();
      if (subjectFilter) params.append("course_code", subjectFilter.split(" ")[0]); // Extract course code
      if (departmentFilter) params.append("tutor_name", departmentFilter);
      params.append("limit", "20");

      const response = await fetch(`${BASE_API_URL}/sessions/public?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch public sessions: ${response.statusText}`);
      }

      const data: PublicSession[] = await response.json();
      setPublicSessions(data);
    } catch (err) {
      console.error("Failed to load public sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Combined search
  const handleSearch = async () => {
    await Promise.all([searchTutors(), searchPublicSessions()]);
  };

  // Load on mount
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = (tutor: TutorSearchResult) => {
    router.push(`/student/book-session?tutorId=${tutor.id}`);
  };

  const handleViewProfile = (tutor: TutorSearchResult) => {
    router.push(`/student/tutor/${tutor.id}`);
  };

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/join`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to join session");
      }

      await Swal.fire({
        icon: "success",
        title: "Joined!",
        text: "You have successfully joined the public session.",
      });

      // Refresh sessions
      searchPublicSessions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join session";
      Swal.fire({
        icon: "error",
        title: "Join Failed",
        text: message,
      });
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Leave Session?",
        text: "Are you sure you want to leave this session?",
        showCancelButton: true,
        confirmButtonText: "Yes, leave",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/leave`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to leave session");
      }

      await Swal.fire({
        icon: "success",
        title: "Left Session",
        text: "You have successfully left the session.",
      });

      // Refresh sessions
      searchPublicSessions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to leave session";
      Swal.fire({
        icon: "error",
        title: "Leave Failed",
        text: message,
      });
    }
  };

  const handleReset = () => {
    setSubjectFilter("");
    setDepartmentFilter("");
    setTagsFilter("");
    setModeFilter("");
  };

  const formatAvailability = (availability: TutorSearchResult["closest_availability"]) => {
    if (!availability) return "No upcoming availability";
    return formatTimeRange(availability.start_time, availability.end_time);
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* Page header */}
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Find a Tutor</h1>
        <p className="text-sm text-black/70 mt-1">
          Browse approved tutors and their availability. Filter by subject, department, expertise tags, or location mode.
        </p>
      </header>

      {/* Filters */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1 relative" ref={subjectInputRef}>
            <label className="text-xs font-semibold text-dark-blue">
              Subject / Course code
            </label>
            <input
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setShowSubjectSuggestions(true);
              }}
              onFocus={() => setShowSubjectSuggestions(true)}
              placeholder="e.g. CO1001, Calculus"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
            {showSubjectSuggestions && filteredSubjectSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-soft-white-blue rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {filteredSubjectSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSubjectFilter(`${suggestion.code} - ${suggestion.name}`);
                      setShowSubjectSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-soft-white-blue transition"
                  >
                    {suggestion.code} - {suggestion.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 relative" ref={departmentInputRef}>
            <label className="text-xs font-semibold text-dark-blue">Department</label>
            <input
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setShowDepartmentSuggestions(true);
              }}
              onFocus={() => setShowDepartmentSuggestions(true)}
              placeholder="e.g. Computer Science"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
            {showDepartmentSuggestions && filteredDepartmentSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-soft-white-blue rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                {filteredDepartmentSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDepartmentFilter(suggestion);
                      setShowDepartmentSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-soft-white-blue transition"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">Location Mode</label>
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value as LocationMode | "")}
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="">All Modes</option>
              {Object.entries(LocationModeLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-dark-blue">
              Expertise Tags (comma-separated)
            </label>
            <input
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              placeholder="e.g. Python, Machine Learning, Data Structures"
              className="rounded-lg bg-soft-white-blue border border-soft-white-blue px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSearch}
            disabled={loading || loadingSessions}
            className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#00539a] transition disabled:opacity-50"
          >
            {(loading || loadingSessions) ? "Searching..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            className="bg-white text-dark-blue text-sm font-semibold rounded-lg px-4 py-2 border border-soft-white-blue hover:bg-soft-white-blue/70 transition"
          >
            Reset
          </button>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Section 2: Tutors - Horizontal Scroll */}
      <section>
        <h2 className="text-base font-semibold text-dark-blue mb-3">Available Tutors</h2>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-sm text-black/60">Loading tutors...</p>
          </div>
        ) : tutors.length === 0 ? (
          <p className="text-sm text-black/60">No tutors found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4" style={{ minWidth: "max-content" }}>
              {tutors.map((tutor) => (
                <article
                  key={tutor.id}
                  className="bg-white border border-soft-white-blue rounded-lg p-4 flex-shrink-0"
                  style={{ width: "320px" }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    {tutor.avatar_url ? (
                      <Image
                        src={tutor.avatar_url}
                        alt={`${tutor.display_name} avatar`}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        width={48}
                        height={48}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                        {tutor.display_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-dark-blue truncate">{tutor.display_name}</h3>
                      <p className="text-xs text-black/60 truncate">
                        {tutor.is_lecturer ? "Lecturer" : "Student Tutor"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-light-light-blue/10 text-light-heavy-blue text-[0.65rem] font-semibold px-2 py-0.5 rounded-md">
                          {tutor.stats.average_rating.toFixed(1)} ⭐
                        </span>
                        <span className="text-[0.6rem] text-black/50">
                          {tutor.stats.total_sessions} sessions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subjects */}
                  {tutor.subjects.length > 0 && (
                    <div className="mb-2">
                      <span className="text-xs font-semibold text-dark-blue">Teaches:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tutor.subjects.slice(0, 2).map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center bg-soft-white-blue rounded-md px-2 py-1 text-[0.65rem] text-dark-blue"
                          >
                            {subject.course_code}
                          </span>
                        ))}
                        {tutor.subjects.length > 2 && (
                          <span className="text-[0.65rem] text-black/50">+{tutor.subjects.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-soft-white-blue">
                    <button
                      onClick={() => handleBook(tutor)}
                      className="flex-1 bg-light-heavy-blue text-white text-xs font-semibold rounded-lg px-3 py-2 hover:bg-[#00539a] transition"
                    >
                      Book
                    </button>
                    <button
                      onClick={() => handleViewProfile(tutor)}
                      className="flex-1 bg-white text-light-heavy-blue text-xs font-semibold rounded-lg px-3 py-2 border border-light-heavy-blue hover:bg-light-light-blue/10 transition"
                    >
                      View
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 3: Public Sessions - Grid */}
      <section>
        <h2 className="text-base font-semibold text-dark-blue mb-3">Public Sessions - Join Anytime</h2>
        {loadingSessions ? (
          <div className="text-center py-8">
            <p className="text-sm text-black/60">Loading sessions...</p>
          </div>
        ) : publicSessions.length === 0 ? (
          <p className="text-sm text-black/60">No public sessions available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSessions.map((session) => (
              <article
                key={session.id}
                className="bg-white border border-soft-white-blue rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-dark-blue mb-1">{session.topic}</h3>
                    <p className="text-xs text-black/60">{session.course_code} - {session.course_name}</p>
                  </div>
                  <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ml-2">
                    {session.available_slots}/{session.max_capacity} slots
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-black/70">
                    <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">{session.tutor_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-black/70">
                    <svg className="w-4 h-4 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatTimeRange(session.start_time, session.end_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 bg-light-light-blue/10 text-light-heavy-blue rounded-md px-2 py-1 text-[0.65rem] font-medium">
                      {LocationModeLabels[session.mode as LocationMode]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => session.is_joined ? handleLeaveSession(session.id) : handleJoinSession(session.id)}
                  disabled={!session.is_joined && session.available_slots === 0}
                  className={`w-full text-sm font-semibold rounded-lg px-4 py-2 transition ${
                    session.is_joined
                      ? "bg-gray-400 text-white hover:bg-gray-500 cursor-pointer"
                      : session.available_slots === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {session.is_joined ? "Leave Session" : session.available_slots === 0 ? "Full" : "Join Session"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
