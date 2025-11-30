"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import BackButton from "@/components/BackButton";
import { LocationModeLabels } from "@/types/location";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch tutor profile
        const profileResponse = await fetch(`${API_BASE_URL}/tutors/${id}`, {
          credentials: "include",
        });

        if (!profileResponse.ok) {
          throw new Error("Tutor not found");
        }

        const profileData: TutorProfile = await profileResponse.json();
        setTutor(profileData);

        // Fetch availability
        try {
          const availResponse = await fetch(`${API_BASE_URL}/availability/tutor/${id}`, {
            credentials: "include",
          });

          if (availResponse.ok) {
            const availData: AvailabilitySlot[] = await availResponse.json();
            setAvailability(availData);
          }
        } catch (err) {
          console.log("No availability data:", err);
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

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                    to {new Date(slot.end_time).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
        </aside>
      </div>
    </div>
  );
}
