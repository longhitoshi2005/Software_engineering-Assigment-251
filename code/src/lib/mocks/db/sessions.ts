export const RECENT_SESSIONS = [
  {
    id: "rs-1",
    title: "Recursion lab review",
    date: "2025-10-25"
  },
];

export const AVAILABLE_COURSES = [
  {
    id: "CO1001",
    name: "Programming Fundamentals"
  },
  {
    id: "MA1001",
    name: "Calculus I"
  },
];

export const MY_UPCOMING_SESSIONS = [
  {
    id: "UP-1",
    datetime: "Mon, Oct 27 · 09:00-10:30",
    tutorName: "John Doe",
    course: "CO1001 · Programming Fundamentals",
    mode: "Online",
    status: "CONFIRMED",
  },
];

export const MY_COMPLETED_SESSIONS = [
  {
    id: "COMP-1",
    datetime: "Tue, Oct 26 · 14:00-15:30",
    tutorName: "Pham Quoc Thang",
    course: "MA1001 · Calculus I",
    mode: "In-person",
    status: "NEEDS_FEEDBACK",
    note: "Covered integration by parts and sample problems.",
    focus: "Derivatives practice",
  },
];

export const TUTOR_SESSIONS = [
  {
    id: "SESS-2025-10-27-1400",
    studentName: "Nguyen M. Q. Khanh · 2352525",
    course: "CO1001 · Programming Fundamentals",
    time: "Wed, Oct 27 · 14:00-15:30 · Room B4-205 / Online",
    topic: "Recursion & pointer debugging - Lab 03",
    status: "completed",
  },
  {
    id: "SESS-2025-10-26-0900",
    studentName: "Tran H. Minh",
    course: "MA1001 · Calculus I",
    time: "Tue, Oct 26 · 09:00-10:15 · C2-301",
    topic: "Derivative drills for midterm",
    status: "completed",
  },
  {
    id: "SESS-2025-10-26-1630",
    studentName: "Le T. Cam Tu",
    course: "EE2002 · Digital Systems",
    time: "Tue, Oct 26 · 16:30-18:00 · Lab D1",
    topic: "Timing diagram, FF troubleshooting",
    status: "in-progress",
  },
];

export const TUTOR_DASH_SESSIONS = [
  {
    id: "sess-301",
    datetime: "Mon · 09:00-10:30 · B4-205 / Online",
    student: "Nguyen M. Q. Khanh",
    subject: "CO1001 · Programming Fundamentals",
    status: "CONFIRMED",
  },
  {
    id: "sess-302",
    datetime: "Tue · 14:00-15:30 · Online only",
    student: "Le P. T. Hien",
    subject: "CO1002 · Data Structures",
    status: "PENDING",
  },
];

export const TUTOR_DASH_FEEDBACKS = [
  {
    id: "fbk-101",
    student: "Tran N. T. Bao",
    subject: "MA1001 · Calculus I",
    rating: 5,
    comment: "Explained really clearly! Helped me understand derivatives.",
    date: "Oct 27, 2025",
  },
  {
    id: "fbk-102",
    student: "Nguyen V. Phuc",
    subject: "CO1001 · Programming Fundamentals",
    rating: 4,
    comment: "Helpful session, but we ran out of time for one exercise.",
    date: "Oct 25, 2025",
  },
];
