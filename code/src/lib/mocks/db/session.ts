// lib/mocks/db/sessions.ts

export type SessionStatus = "CONFIRMED" | "PENDING" | "CANCELLED";

export interface SessionRecord {
  id: string;
  course: string;
  tutor: string;
  student: string;
  slot: string;
  status: SessionStatus;
}

// Mock database: tutoring sessions
export const DB_SESSIONS: SessionRecord[] = [
  {
    id: "S-2101",
    course: "CO1001",
    tutor: "tutor01",
    student: "2352525",
    slot: "2025-10-22 09:00",
    status: "CONFIRMED",
  },
  {
    id: "S-2102",
    course: "MA1001",
    tutor: "tutor02",
    student: "2353001",
    slot: "2025-10-22 13:00",
    status: "PENDING",
  },
  {
    id: "S-2103",
    course: "EE2002",
    tutor: "tutor03",
    student: "2354002",
    slot: "2025-10-23 10:30",
    status: "CONFIRMED",
  },
];
