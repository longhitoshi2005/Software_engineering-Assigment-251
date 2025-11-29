import type { PendingMatch } from "@/types/pendingAssign";

export const PENDING_ASSIGN_ITEMS: PendingMatch[] = [
  {
    id: "pm-1",
    studentId: "s-101",
    studentName: "Alice Nguyen",
    course: "CO1001",
    suggestedTutor: "Tutor A",
    reason: "Requested urgent help",
    priority: "HIGH",
    createdAgo: "2h",
    source: "StudentRequest",
    preferredSlot: "Wed 14:00",
  },
];
