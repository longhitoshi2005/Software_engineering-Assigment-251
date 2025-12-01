import { LocationMode } from './location';

export enum ModeType {
  ONLINE = 'online',
  IN_PERSON = 'in-person'
}

export enum SessionStatusType {
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PENDING = 'pending'
}

export enum SessionRequestType {
  ONE_ON_ONE = 'ONE_ON_ONE',
  PRIVATE_GROUP = 'PRIVATE_GROUP',
  PUBLIC_GROUP = 'PUBLIC_GROUP'
}

export type SessionSlot = {
	id: string;
	start: string; // ISO
	end: string; // ISO
	mode?: ModeType;
	remaining?: number;
};

export type Session = {
	id: string;
	studentId: string;
	tutorId?: string;
	course?: string;
	topic?: string;
	scheduledAt?: string;
	status?: SessionStatusType;
	slot?: SessionSlot;
	notes?: string;
};

export interface BookingRequest {
  tutor_id: string;
  course_code: string;
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  mode: LocationMode;
  location?: string;
  session_request_type: SessionRequestType;
  invited_emails?: string[];
  requested_max_capacity?: number;
  note?: string;
}

export interface AvailabilitySlotForBooking {
  id: string;
  tutor_id: string;
  start_time: string;
  end_time: string;
  allowed_modes: LocationMode[];
  is_booked: boolean;
}

// Backend Session Types
export enum SessionStatus {
  WAITING_FOR_TUTOR = "WAITING_FOR_TUTOR",
  WAITING_FOR_STUDENT = "WAITING_FOR_STUDENT",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface NegotiationProposal {
  new_start_time?: string;
  new_end_time?: string;
  new_mode?: LocationMode;
  new_location?: string;
  tutor_message: string;
  new_max_capacity?: number;
  new_is_public?: boolean;
}

export interface SessionResponse {
  id: string;
  tutor_id: string;
  tutor_name: string;
  student_id: string;
  student_name: string;
  course_code: string;
  course_name: string;
  start_time: string;
  end_time: string;
  mode: LocationMode;
  location?: string;
  status: SessionStatus;
  proposal?: NegotiationProposal;
  created_at: string;
  session_request_type?: SessionRequestType;
  max_capacity?: number;
  is_public?: boolean;
  note?: string;
}

export interface SessionConfirmRequest {
  max_capacity: number;
  is_public: boolean;
  final_location_link?: string;
}

export interface NegotiationCreateRequest {
  new_start_time?: string;
  new_end_time?: string;
  new_mode?: LocationMode;
  new_location?: string;
  message: string;
  new_max_capacity?: number;
  new_is_public?: boolean;
}
