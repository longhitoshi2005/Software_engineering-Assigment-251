export let COORDINATOR_SESSIONS = [
  {
    id: "S-1001",
    student: "Nguyen M.Q.",
    tutor: "Nguyen T.A.",
    course: "CO1001",
    startTime: "2025-11-02T14:00:00Z",
    status: "SCHEDULED",
    issueFlag: null,
  },
  {
    id: "S-1002",
    student: "Tran T.H.",
    tutor: "Pham Q.T.",
    course: "MA1001",
    startTime: "2025-11-01T09:00:00Z",
    status: "CANCELLED",
    issueFlag: "late cancellation",
  },
  {
    id: "S-1003",
    student: "Le V.D.",
    tutor: "Truong Q.T.",
    course: "EE2002",
    startTime: "2025-11-01T11:00:00Z",
    status: "COMPLETED",
    issueFlag: "missing feedback",
  },
];
export const SESSION_DETAILS = [
  {
    id: 1,
    student: "Alice Johnson",
    tutor: "Dr. Smith",
    subject: "Calculus",
    date: "2024-01-15",
    time: "14:00-15:00",
    status: "completed",
    rating: 5,
    feedback: "Great session, very helpful!"
  },
  {
    id: 2,
    student: "Bob Wilson",
    tutor: "Prof. Davis",
    subject: "Physics",
    date: "2024-01-15",
    time: "16:00-17:00",
    status: "scheduled",
    rating: null,
    feedback: null
  },
  {
    id: 3,
    student: "Carol Brown",
    tutor: "Ms. Johnson",
    subject: "Chemistry",
    date: "2024-01-14",
    time: "10:00-11:00",
    status: "cancelled",
    rating: null,
    feedback: null
  }
];
