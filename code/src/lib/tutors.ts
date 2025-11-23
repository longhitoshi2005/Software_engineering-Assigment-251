import type { Tutor } from "@/types";

export const TUTORS: Tutor[] = [
  {
    id: 1,
    image:
      "https://ui-avatars.com/api/?name=Nguyen+T.+A&background=0D9488&color=fff&rounded=true&size=128",
    name: "Nguyen T. A.",
    fullName: "Nguyen Tran An",
    studentId: "2352525",
    email: "nguyen.an@hcmut.edu.vn",
    role: "Senior student",
    faculty: "Computer Science and Engineering",
    subject: "CO1001 – Programming Fundamentals",
    department: "Computer Science and Engineering",
    match: "High match · 82%",
    slots: [
      { time: "Wed 14:00", mode: "Online / B4-205", remaining: "2 left" },
      { time: "Fri 09:30", mode: "Online", remaining: "1 left" },
    ],
    fullAvailability: [
      new Date().toISOString(),
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    ],
    status: "Available",
    expertise: ["Programming fundamentals", "recursion", "pointers"],
    detailedExpertise:
      "Extensive experience tutoring programming fundamentals: recursion, pointers, data structures. Can help with debugging C/C++ assignments and whiteboard problem-solving.",
    preferences: "Prefer 1:1 debugging sessions; bring code samples",
    detailedPreferences:
      "I prefer hands-on sessions where students bring their code. I usually work through problems step-by-step and provide small exercises to practice. I can do both online and in-person sessions.",
    sessionsCompleted: 124,
    averageRating: 4.8,
    feedbacks: [
      { id: 1, rating: 5, comment: "Very clear explanations, helped me fix a tricky bug.", date: new Date().toISOString() },
      { id: 2, rating: 4, comment: "Good walkthroughs; recommended.", date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
    ],
  },
  {
    id: 2,
    image:
      "https://ui-avatars.com/api/?name=Pham+Q.+T&background=0D9488&color=fff&rounded=true&size=128",
    name: "Pham Q. T.",
    fullName: "Pham Quoc Tuan",
    studentId: "2251780",
    email: "pham.tuan@hcmut.edu.vn",
    role: "Tutor",
    faculty: "Applied Mathematics",
    subject: "MA1001 – Calculus I",
    department: "Applied Mathematics",
    match: "Good match · 74%",
    slots: [
      { time: "Thu 09:00", mode: "C2-301", remaining: "3 left" },
      { time: "Sat 10:15", mode: "Online", remaining: "∞" },
    ],
    fullAvailability: [
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    ],
    status: "Available",
    expertise: ["Calculus", "problem solving", "exam techniques"],
    detailedExpertise:
      "Support for calculus topics including limits, derivatives, integrals, and common exam problems. Good at explaining proofs and solution strategies.",
    preferences: "Prefers step-by-step proofs; accepts whiteboard sessions",
    detailedPreferences:
      "I like to focus on conceptual understanding and problem-solving techniques. Whiteboard sessions are preferred for proofs.",
    sessionsCompleted: 58,
    averageRating: 4.5,
    feedbacks: [{ id: 3, rating: 5, comment: "Explains proofs clearly.", date: new Date().toISOString() }],
  },
  {
    id: 3,
    image:
      "https://ui-avatars.com/api/?name=Truong+Q.+T&background=0D9488&color=fff&rounded=true&size=128",
    name: "Truong Q. T.",
    role: "Tutor",
    subject: "EE2002 – Digital Systems",
    department: "Electrical & Electronics Engineering",
    match: "Available soon",
    expertise: ["Digital logic", "Verilog", "FPGA labs"],
    preferences: "Hands-on lab sessions encouraged",
    slots: [{ time: "Fri 16:30", mode: "Lab D1", remaining: "1 left" }],
    status: "1 slot this week",
  },
];

export default TUTORS;
