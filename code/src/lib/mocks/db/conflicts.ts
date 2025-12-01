import type { Conflict, ConflictRequest } from "@/types/conflicts";

export const CONFLICTS: Conflict[] = [
  {
    id: "conf-1",
    type: "TUTOR_DOUBLE_BOOKING",
    tutor: {
      id: "tut-1",
      name: "Pham Q. T."
    },
    slot: "Wed 14:00 · Room B4-205",
    details: "Tutor is double-booked for this slot.",
    severity: "HIGH",
    requests: [
      {
        id: "req-1",
        studentId: "2350001",
        studentName: "Alice Nguyen",
        course: "CO1001",
        preferredSlot: "Wed 14:00",
        status: "PENDING" 
      }, {
        id: "req-2",
        studentId: "2353xxx",
        studentName: "Bob Tran",
        course: "CO1001",
        preferredSlot: "Wed 14:00",
        status: "PENDING"
      },
    ],
  },
  {
    id: "conf-2",
    type: "ROOM_CONFLICT",
    tutor: null,
    slot: "Fri 10:00 · Room C1-202",
    details: "Room C1-202 is booked for a department meeting at this time.",
    severity: "MEDIUM",
    requests: [
      { 
        id: "req-3",
        studentId: "2351xxx",
        studentName: "Charlie D.",
        course: "MA1001",
        preferredSlot: "Fri 10:00",
        status: "PENDING"
      },
    ],
  },
];
