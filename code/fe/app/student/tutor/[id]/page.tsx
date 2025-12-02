"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import BackButton from "@/components/BackButton";
import { LocationModeLabels } from "@/types/location";
import { formatDateTime, formatTime } from "@/lib/dateUtils";
import {BASE_API_URL} from "@/config/env"

interface TeachingSubject {
  course_code: string;
  course_name: string;
  description?: string;
}

interface TutorStats {
  average_rating: number;
  total_feedbacks: number;
  total_sessions: number;
  total_students: number;
  response_rate: number;
}

interface AvailabilitySlot {
  id: string;
  start_time: string;
  end_time: string;
  allowed_modes: string[];
  is_booked: boolean;
}

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

interface TutorProfile {
  id: string;
  user_id: string;
  
  // Identity
  full_name: string;
  display_name: string;
  sso_id: string;
  email_edu: string;
  academic_major?: string;
  is_lecturer: boolean;
  
  // Profile
  bio?: string;
  tags: string[];
  status: string;
  email_personal?: string;
  phone_number?: string;
  avatar_url?: string;
  
  // Expertise
  subjects: TeachingSubject[];
  stats: TutorStats;
}

export default function TutorProfilePage() {
  const params = useParams();
  const id = String(params?.id);
  
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [publicSessions, setPublicSessions] = useState<PublicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch tutor profile
        const profileResponse = await fetch(`${BASE_API_URL}/tutors/${id}`, {
          credentials: "include",
        });

        if (!profileResponse.ok) {
          throw new Error("Tutor not found");
        }

        const profileData: TutorProfile = await profileResponse.json();
        setTutor(profileData);

        // Fetch availability
        try {
          const availResponse = await fetch(`${BASE_API_URL}/availability/tutor/${id}`, {
            credentials: "include",
          });

          if (availResponse.ok) {
            const availData: AvailabilitySlot[] = await availResponse.json();
            setAvailability(availData);
          }
        } catch (err) {
          console.log("No availability data:", err);
        }

        // Fetch public sessions for this tutor
        try {
          const sessionsResponse = await fetch(
            `${BASE_API_URL}/sessions/public?tutor_name=${encodeURIComponent(profileData.full_name)}&limit=10`,
            { credentials: "include" }
          );

          if (sessionsResponse.ok) {
            const sessionsData: PublicSession[] = await sessionsResponse.json();
            setPublicSessions(sessionsData);
          }
        } catch (err) {
          console.log("No public sessions:", err);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load tutor profile";
        setError(message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTutorProfile();
    }
  }, [id]);

  const handleJoinSession = async (sessionId: string) => {
    try {
      const response = await fetch(`${BASE_API_URL}/sessions/${sessionId}/join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to join session");
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "You have successfully joined the session",
      });

      // Refresh public sessions
      if (tutor) {
        const sessionsResponse = await fetch(
          `${BASE_API_URL}/sessions/public?tutor_name=${encodeURIComponent(tutor.full_name)}&limit=10`,
          { credentials: "include" }
        );
        if (sessionsResponse.ok) {
          const sessionsData: PublicSession[] = await sessionsResponse.json();
          setPublicSessions(sessionsData);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to join session";
      await Swal.fire({
        icon: "error",
        title: "Error",
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
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to leave session");
      }

      await Swal.fire({
        icon: "success",
        title: "Left Session",
        text: "You have successfully left the session.",
      });

      // Refresh public sessions
      if (tutor) {
        const sessionsResponse = await fetch(
          `${BASE_API_URL}/sessions/public?tutor_name=${encodeURIComponent(tutor.full_name)}&limit=10`,
          { credentials: "include" }
        );
        if (sessionsResponse.ok) {
          const sessionsData: PublicSession[] = await sessionsResponse.json();
          setPublicSessions(sessionsData);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to leave session";
      await Swal.fire({
        icon: "error",
        title: "Leave Failed",
        text: message,
      });
    }
  };

  // Using imported formatDateTime and formatTime from dateUtils

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 flex items-center justify-center">
        <p className="text-dark-blue">Loading tutor profile...</p>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-blue font-semibold mb-2">Tutor not found</p>
          <p className="text-sm text-black/60">The tutor profile you requested does not exist.</p>
          <div className="mt-4">
            <Link href="/student/find-tutor" className="text-light-heavy-blue underline">
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      <div className="mb-3">
        <BackButton />
      </div>
      
      <header className="mb-4 flex items-center gap-4">
        {tutor.avatar_url ? (
          <Image 
            src={tutor.avatar_url} 
            alt={`${tutor.display_name} avatar`} 
            width={80} 
            height={80} 
            className="w-20 h-20 rounded-full object-cover" 
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-light-heavy-blue text-white flex items-center justify-center font-semibold text-2xl">
            {tutor.display_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
          </div>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">{tutor.display_name}</h1>
          <p className="text-sm text-black/70 mt-1">
            {tutor.is_lecturer ? "Lecturer" : "Student Tutor"}
            {tutor.academic_major && ` · ${tutor.academic_major}`}
          </p>
          <p className="text-xs text-black/50 mt-1">{tutor.email_edu}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        <section className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-blue">Profile Information</h2>
          
          {tutor.bio && (
            <div>
              <p className="text-[11px] text-black/60">Bio</p>
              <p className="text-sm text-black/80 whitespace-pre-wrap">{tutor.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-black/60">Full Name</p>
              <p className="text-sm text-black/80">{tutor.full_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">SSO ID</p>
              <p className="text-sm text-black/80">{tutor.sso_id}</p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">Status</p>
              <p className="text-sm text-black/80">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  tutor.status === "AVAILABLE" ? "bg-green-100 text-green-800" :
                  tutor.status === "BUSY" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {tutor.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">Response Rate</p>
              <p className="text-sm text-black/80">{tutor.stats.response_rate}%</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-dark-blue mt-4">Teaching Subjects</h3>
          {tutor.subjects.length > 0 ? (
            <div className="space-y-2">
              {tutor.subjects.map((subject, idx) => (
                <div key={idx} className="border border-soft-white-blue rounded-md p-3">
                  <p className="text-sm font-semibold text-dark-blue">
                    {subject.course_code} - {subject.course_name}
                  </p>
                  {subject.description && (
                    <p className="text-xs text-black/60 mt-1">{subject.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">No teaching subjects assigned yet.</p>
          )}

          {tutor.tags.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-dark-blue mt-4">Expertise Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tutor.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center bg-light-light-blue/10 text-light-heavy-blue rounded-md px-3 py-1 text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}

          <h3 className="text-lg font-semibold text-dark-blue mt-4">Availability</h3>
          {availability.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availability.slice(0, 10).map((slot) => (
                <div key={slot.id} className="border border-soft-white-blue rounded-md p-3">
                  <p className="text-sm font-semibold text-dark-blue">
                    {formatDateTime(slot.start_time)}
                  </p>
                  <p className="text-xs text-black/60">
                    to {formatTime(slot.end_time)}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {slot.allowed_modes.map((mode) => (
                      <span
                        key={mode}
                        className="text-[0.65rem] bg-green-50 text-green-700 px-2 py-0.5 rounded"
                      >
                        {LocationModeLabels[mode as keyof typeof LocationModeLabels] || mode}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">No upcoming availability.</p>
          )}

          <div className="mt-4 pt-4 border-t border-soft-white-blue">
            <Link 
              href={`/student/book-session?tutorId=${tutor.id}`} 
              className="inline-flex items-center rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-[#00539a] transition"
            >
              Book Session with {tutor.display_name}
            </Link>
          </div>
        </section>

        <aside className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-dark-blue">Statistics</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Average Rating</span>
              <span className="text-lg font-semibold text-dark-blue">
                {tutor.stats.average_rating.toFixed(1)} ⭐
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Total Sessions</span>
              <span className="text-lg font-semibold text-dark-blue">
                {tutor.stats.total_sessions}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Total Students</span>
              <span className="text-lg font-semibold text-dark-blue">
                {tutor.stats.total_students}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/60">Total Feedbacks</span>
              <span className="text-lg font-semibold text-dark-blue">
                {tutor.stats.total_feedbacks}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-soft-white-blue">
            <h4 className="text-sm font-semibold text-dark-blue mb-2">Contact</h4>
            <div className="space-y-2">
              <div>
                <p className="text-[11px] text-black/60">Educational Email</p>
                <p className="text-sm text-black/80">{tutor.email_edu}</p>
              </div>
              {tutor.email_personal && (
                <div>
                  <p className="text-[11px] text-black/60">Personal Email</p>
                  <p className="text-sm text-black/80">{tutor.email_personal}</p>
                </div>
              )}
              {tutor.phone_number && (
                <div>
                  <p className="text-[11px] text-black/60">Phone</p>
                  <p className="text-sm text-black/80">{tutor.phone_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Public Sessions Section */}
          <div className="pt-4 border-t border-soft-white-blue">
            <h4 className="text-sm font-semibold text-dark-blue mb-3">Available Public Sessions</h4>
            {publicSessions.length > 0 ? (
              <div className="space-y-3">
                {publicSessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-soft-white-blue rounded-lg p-3 bg-white hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-dark-blue mb-1">{session.topic}</p>
                        <p className="text-xs text-black/60">{session.course_code} - {session.course_name}</p>
                      </div>
                      <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ml-2">
                        {session.available_slots}/{session.max_capacity}
                      </span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-2 text-xs text-black/70">
                        <svg className="w-3.5 h-3.5 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDateTime(session.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-black/70">
                        <svg className="w-3.5 h-3.5 text-black/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>to {formatTime(session.end_time)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-1 bg-light-light-blue/10 text-light-heavy-blue rounded-md px-2 py-0.5 text-[0.65rem] font-medium">
                          {LocationModeLabels[session.mode as keyof typeof LocationModeLabels] || session.mode}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => session.is_joined ? handleLeaveSession(session.id) : handleJoinSession(session.id)}
                      disabled={!session.is_joined && session.available_slots === 0}
                      className={`w-full text-xs font-semibold rounded-lg px-3 py-2 transition ${
                        session.is_joined
                          ? "bg-gray-400 text-white hover:bg-gray-500 cursor-pointer"
                          : session.available_slots === 0
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {session.is_joined ? "Leave Session" : session.available_slots === 0 ? "Full" : "Join Session"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-black/60">No public sessions available at the moment.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
