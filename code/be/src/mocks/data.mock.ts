export const TUTORS = [
  {
    id: 'tutor-1',
    fullName: 'Alice Nguyen',
    tutorId: 'T1001',
    eduMail: 'alice@univ.edu',
    email: 'alice.personal@example.com',
    expertise: ['math', 'algorithms'],
    maxLoad: 10,
    currentLoad: 2,
    availability: { monday: ['09:00-11:00'], wednesday: ['13:00-15:00'] },
    profileSummary: 'Experienced CS tutor.',
  },
  {
    id: 'tutor-2',
    fullName: 'Bob Tran',
    tutorId: 'T1002',
    eduMail: 'bob@univ.edu',
    email: 'bob.personal@example.com',
    expertise: ['physics'],
    maxLoad: 8,
    currentLoad: 5,
    availability: { tuesday: ['10:00-12:00'] },
    profileSummary: 'Physics tutor.',
  },
];

export const STUDENTS = [
  {
    id: 'student-1',
    fullName: 'Charlie Pham',
    studentId: 'S2001',
    eduMail: 'charlie@univ.edu',
    personalEmail: 'charlie@example.com',
    phoneNumber: '0123456789',
    program: 'CS',
    faculty: 'CSE',
    year: 2,
    metadata: {},
  },
];

export const CONFLICTS = [
  {
    id: 'conflict-1',
    type: 'double_booking',
    tutor: TUTORS[0],
    slot: '2025-11-15T09:00:00Z/2025-11-15T10:00:00Z',
    details: 'Tutor double-booked for overlapping session',
    requests: [
      {
        requestId: 'req-1',
        studentId: 'student-1',
        requestedAt: new Date().toISOString(),
        subject: 'math',
        preferredTimes: ['2025-11-15T09:00:00Z'],
      },
    ],
    detectedAt: new Date().toISOString(),
    metadata: {},
  },
];

export const SUGGESTIONS = [
  {
    suggestionId: 'sug-1',
    generatedAt: new Date().toISOString(),
    rankedTutors: [
      { tutorId: 'tutor-1', score: 0.9, rationale: 'Close expertise' },
    ],
    prompt: 'Match for math',
    explanation: 'Top candidates based on expertise and availability',
  },
];

export const MANUAL_ASSIGNMENTS = [
  // initially empty
];

export const AUDIT_LOGS: any[] = [];

export const SESSIONS = [
  {
    id: 'session-1',
    studentId: 'student-1',
    tutorId: 'tutor-1',
    datetime: '2025-11-15T09:00:00Z',
    status: 'scheduled',
    notes: '',
  },
];

export const PENDING_ASSIGN_ITEMS = [];
