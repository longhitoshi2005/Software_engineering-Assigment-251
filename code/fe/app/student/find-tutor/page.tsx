"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import { TutorSearchResult, TutorSearchRequest } from "@/types/tutorSearch";
import { LocationMode, LocationModeLabels } from "@/types/location";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function FindTutorPage() {
  const router = useRouter();

  // State
  const [tutors, setTutors] = useState<TutorSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
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

      const response = await fetch(`${API_BASE_URL}/tutors/search`, {
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

  // Load tutors on mount
  useEffect(() => {
    searchTutors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = (tutor: TutorSearchResult) => {
    router.push(`/student/book-session?tutorId=${tutor.id}`);
  };

  const handleViewProfile = (tutor: TutorSearchResult) => {
    router.push(`/student/tutor/${tutor.id}`);
  };

  const handleReset = () => {
    setSubjectFilter("");
    setDepartmentFilter("");
    setTagsFilter("");
    setModeFilter("");
  };

  const formatAvailability = (availability: TutorSearchResult["closest_availability"]) => {
    if (!availability) return "No upcoming availability";
    
    const start = new Date(availability.start_time);
    const end = new Date(availability.end_time);
    
    const dateStr = start.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    
    const timeStr = `${start.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    
    return `${dateStr}, ${timeStr}`;
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
            onClick={searchTutors}
            disabled={loading}
            className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#00539a] transition disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-sm text-black/60">Loading tutors...</p>
        </div>
      )}

      {/* Tutor list */}
      {!loading && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tutors.length === 0 && !error && (
            <p className="text-sm text-black/60 col-span-full">
              No tutors found matching your criteria. Try adjusting your filters.
            </p>
          )}

          {tutors.map((tutor) => (
            <article
              key={tutor.id}
              className="bg-white border border-soft-white-blue rounded-lg p-5 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {tutor.avatar_url ? (
                    <Image
                      src={tutor.avatar_url}
                      alt={`${tutor.display_name} avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-sm">
                      {tutor.display_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div>
                    <h2 className="text-base font-semibold text-dark-blue">{tutor.display_name}</h2>
                    <p className="text-xs text-black/60">
                      {tutor.is_lecturer ? "Lecturer" : "Student Tutor"}
                      {tutor.academic_major && ` • ${tutor.academic_major}`}
                    </p>
                    {tutor.bio && (
                      <p className="text-sm text-black/80 mt-1 line-clamp-2">{tutor.bio}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end">
                  <span className="bg-light-light-blue/10 text-light-heavy-blue text-[0.65rem] font-semibold px-2 py-1 rounded-md whitespace-nowrap">
                    {tutor.stats.average_rating.toFixed(1)} ⭐
                  </span>
                  <span className="text-[0.6rem] text-black/50">
                    {tutor.stats.total_sessions} sessions
                  </span>
                </div>
              </div>

              {/* Subjects */}
              {tutor.subjects.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-dark-blue">Teaches:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tutor.subjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-soft-white-blue border border-soft-white-blue rounded-md px-2 py-1 text-[0.7rem] text-dark-blue"
                      >
                        {subject.course_code} - {subject.course_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {tutor.tags.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-dark-blue">Expertise:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {tutor.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-light-light-blue/10 text-light-heavy-blue rounded-md px-2 py-1 text-[0.65rem] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Closest Availability */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-dark-blue">Next available:</span>
                {tutor.closest_availability ? (
                  <div className="space-y-1">
                    <p className="text-sm text-black/80">
                      {formatAvailability(tutor.closest_availability)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {tutor.closest_availability.allowed_modes.map((mode) => (
                        <span
                          key={mode}
                          className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 rounded-md px-2 py-1 text-[0.65rem] font-medium"
                        >
                          {LocationModeLabels[mode]}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-black/50 italic">No upcoming availability</p>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-soft-white-blue">
                <button
                  onClick={() => handleBook(tutor)}
                  className="flex-1 bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-3 py-2 hover:bg-[#00539a] transition"
                >
                  Book session
                </button>
                <button
                  onClick={() => handleViewProfile(tutor)}
                  className="flex-1 bg-white text-light-heavy-blue text-sm font-semibold rounded-lg px-3 py-2 border border-light-heavy-blue hover:bg-light-light-blue/10 transition"
                >
                  View profile
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
