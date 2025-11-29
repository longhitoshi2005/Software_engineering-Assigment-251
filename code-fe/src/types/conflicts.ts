export type ConflictRequest = { id: string; studentId?: string; studentName: string; course: string; preferredSlot?: string; status: string };
export type Conflict = {
  id: string;
  type: "TUTOR_DOUBLE_BOOKING" | "ROOM_CONFLICT" | "STUDENT_QUOTA" | string;
  tutor: { id: string; name: string } | null;
  slot: string;
  details: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  requests: ConflictRequest[];
};
