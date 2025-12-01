export type PendingMatch = {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  suggestedTutor: string;
  reason: string;
  priority: "HIGH" | "NORMAL" | "LOW";
  createdAgo: string;
  source: "AI" | "StudentRequest" | "System" | "Tutor";
  preferredSlot?: string;
};
