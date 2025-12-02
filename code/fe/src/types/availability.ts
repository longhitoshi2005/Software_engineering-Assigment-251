import { LocationMode } from './location';

export interface AvailabilitySlot {
  id: string;
  tutor_id: string;
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  allowed_modes: LocationMode[];
  is_booked: boolean;
}

export interface AvailabilityCreateRequest {
  start_time: string; // ISO datetime
  end_time: string;   // ISO datetime
  allowed_modes: LocationMode[];
}

export interface DaySlot {
  id: string;
  day: string;
  start: string; // HH:MM
  end: string;   // HH:MM
  allowed_modes: LocationMode[];
  backendId?: string; // ID from backend when saved
}
