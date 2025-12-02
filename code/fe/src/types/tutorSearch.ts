import { LocationMode } from "./location";

export interface TeachingSubject {
  course_code: string;
  course_name: string;
  description?: string;
}

export interface TutorStats {
  average_rating: number;
  total_feedbacks: number;
  total_sessions: number;
  total_students: number;
  response_rate: number;
}

export interface ClosestAvailability {
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  allowed_modes: LocationMode[];
}

export interface TutorSearchResult {
  id: string;
  user_id: string;
  
  // Identity
  full_name: string;
  display_name: string;
  email_edu: string;
  academic_major?: string;
  is_lecturer: boolean;
  
  // Profile
  bio?: string;
  tags: string[];
  status: string;
  avatar_url?: string;
  
  // Expertise
  subjects: TeachingSubject[];
  stats: TutorStats;
  
  // Availability
  closest_availability?: ClosestAvailability;
}

export interface TutorSearchRequest {
  subject?: string;
  department?: string;
  tags?: string[];
  mode?: LocationMode;
  available_from?: string; // ISO datetime
  available_to?: string;   // ISO datetime
  limit?: number;
  offset?: number;
}
