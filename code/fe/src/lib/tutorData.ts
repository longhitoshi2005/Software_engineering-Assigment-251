import { getPrisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

export type DayName =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type SessionMode = "ONLINE" | "OFFLINE" | "HYBRID";
export type SessionStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type RequestStatus = "NEW" | "PENDING" | "APPROVED" | "REJECTED" | "FORWARDED";

const DAY_VALUES: readonly DayName[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const MODE_VALUES: readonly SessionMode[] = ["ONLINE", "OFFLINE", "HYBRID"] as const;
const SESSION_STATUS_VALUES: readonly SessionStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
const REQUEST_STATUS_VALUES: readonly RequestStatus[] = [
  "NEW",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "FORWARDED",
] as const;

const toDayName = (value: string): DayName =>
  DAY_VALUES.includes(value as DayName) ? (value as DayName) : "MONDAY";

const toSessionMode = (value: string): SessionMode =>
  MODE_VALUES.includes(value as SessionMode) ? (value as SessionMode) : "OFFLINE";

const toSessionStatus = (value: string): SessionStatus =>
  SESSION_STATUS_VALUES.includes(value as SessionStatus) ? (value as SessionStatus) : "PENDING";

const toRequestStatus = (value: string): RequestStatus =>
  REQUEST_STATUS_VALUES.includes(value as RequestStatus) ? (value as RequestStatus) : "NEW";

type DbAvailability = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  mode: string;
  createdAt: Date;
};

type DbSession = {
  id: string;
  studentName: string;
  studentId: string | null;
  courseCode: string;
  courseTitle: string;
  scheduledStart: Date;
  scheduledEnd: Date | null;
  mode: string;
  location: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DbFeedback = {
  id: string;
  sessionId: string | null;
  studentName: string;
  courseCode: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

type DbProgressLog = {
  id: string;
  sessionId: string;
  understanding: string | null;
  engagement: string | null;
  summary: string;
  nextPlan: string | null;
  attachments: string | null;
  submittedAt: Date;
};

type DbBookingRequest = {
  id: string;
  studentName: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  topic: string | null;
  preferredStart: Date;
  preferredEnd: Date | null;
  mode: string;
  note: string | null;
  status: string;
  conflictNote: string | null;
  decisionNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AvailabilitySlot = {
  id: string;
  day: DayName;
  start: string;
  end: string;
  mode: SessionMode;
};

export type SessionItem = {
  id: string;
  studentName: string;
  studentId?: string | null;
  courseCode: string;
  courseTitle: string;
  scheduledStart: string;
  scheduledEnd?: string | null;
  mode: SessionMode;
  location?: string | null;
  status: SessionStatus;
  notes?: string | null;
};

export type FeedbackItem = {
  id: string;
  sessionId?: string | null;
  studentName: string;
  courseCode: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type TutorProfile = {
  fullName: string;
  staffId: string;
  title: string;
  department: string;
  faculty: string;
  email: string;
  phone?: string | null;
  personalEmail?: string | null;
  officeLocation?: string | null;
  officeHours?: string | null;
  shortIntro?: string | null;
  expertise?: string | null;
  homepage?: string | null;
  googleScholar?: string | null;
};

export type ProgressLogAttachment = {
  name: string;
  size: number;
  url?: string;
  path?: string;
  contentType?: string;
};

export type ProgressLogStatus = "DRAFT" | "SUBMITTED";

export type ProgressLog = {
  id: string;
  sessionId: string;
  understanding?: string | null;
  engagement?: string | null;
  summary: string;
  nextPlan?: string | null;
  attachments?: ProgressLogAttachment[];
  submittedAt: string;
  status: ProgressLogStatus;
};

export type TutorRequest = {
  id: string;
  studentName: string;
  studentId: string;
  courseCode: string;
  courseTitle: string;
  topic?: string | null;
  preferredStart: string;
  preferredEnd?: string | null;
  mode: SessionMode;
  note?: string | null;
  status: RequestStatus;
  conflictNote?: string | null;
  decisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStat = {
  label: string;
  value: number | string;
  sub?: string;
};

export type DashboardSnapshot = {
  stats: DashboardStat[];
  upcomingSessions: SessionItem[];
  recentFeedback: FeedbackItem[];
};

const FALLBACK_PROFILE_ID = "default-profile";

const fallbackAvailability: AvailabilitySlot[] = [
  { id: "AVL-1", day: "MONDAY", start: "09:00", end: "10:30", mode: "OFFLINE" },
  { id: "AVL-2", day: "MONDAY", start: "14:00", end: "15:30", mode: "ONLINE" },
  { id: "AVL-3", day: "WEDNESDAY", start: "13:30", end: "15:00", mode: "OFFLINE" },
  { id: "AVL-4", day: "FRIDAY", start: "09:00", end: "10:30", mode: "ONLINE" },
];

const fallbackSessions: SessionItem[] = [
  {
    id: "SES-1",
    studentName: "Nguyen M. Q. Khanh",
    studentId: "2352525",
    courseCode: "CO1001",
    courseTitle: "Programming Fundamentals",
    scheduledStart: "2025-12-03T09:00:00.000Z",
    scheduledEnd: "2025-12-03T10:30:00.000Z",
    mode: "OFFLINE",
    location: "B4-205",
    status: "CONFIRMED",
    notes: "Recursion drills",
  },
  {
    id: "SES-2",
    studentName: "Tran H. Minh",
    studentId: "2353001",
    courseCode: "MA1001",
    courseTitle: "Calculus I",
    scheduledStart: "2025-12-04T14:00:00.000Z",
    scheduledEnd: "2025-12-04T15:30:00.000Z",
    mode: "ONLINE",
    location: "Zoom",
    status: "PENDING",
    notes: "Derivative revision",
  },
  {
    id: "SES-3",
    studentName: "Le T. Cam Tu",
    studentId: "2355525",
    courseCode: "EE2002",
    courseTitle: "Digital Systems",
    scheduledStart: "2025-12-05T10:00:00.000Z",
    scheduledEnd: "2025-12-05T11:30:00.000Z",
    mode: "HYBRID",
    location: "B4-205 / Meet",
    status: "PENDING",
    notes: "Timing diagram practice",
  },
];

const fallbackFeedbacks: FeedbackItem[] = [
  {
    id: "FB-1",
    sessionId: "SES-1",
    studentName: "23531xx",
    courseCode: "CO1001",
    rating: 5,
    comment: "Very clear explanation!",
    createdAt: "2025-11-12T10:20:00.000Z",
  },
  {
    id: "FB-2",
    sessionId: "SES-2",
    studentName: "23529xx",
    courseCode: "MA1001",
    rating: 4,
    comment: "Helpful examples.",
    createdAt: "2025-10-31T07:30:00.000Z",
  },
];

let fallbackProfile: TutorProfile = {
  fullName: "Dr. Nguyen Van A",
  staffId: "GV-2025-0137",
  title: "Lecturer",
  department: "Computer Science & Engineering",
  faculty: "School of Computer Science & Engineering (CSE)",
  email: "nguyenvana@hcmut.edu.vn",
  phone: "+84 908 123 456",
  personalEmail: "nguyenvana.personal@gmail.com",
  officeLocation: "B4-205",
  officeHours: "Wed 14:00–16:00; Fri 09:00–11:00",
  shortIntro:
    "Lecturer in Computer Science focusing on Systems and Software Engineering. I mentor final-year projects and coordinate tutoring for CO1001/CO2002.",
  expertise: "Software Engineering, Operating Systems, Databases",
  homepage: "https://faculty.hcmut.edu.vn/nguyenvana",
  googleScholar: "https://scholar.google.com/citations?user=XXXX",
};

const fallbackProgressLogs: ProgressLog[] = [];

const fallbackRequests: TutorRequest[] = [
  {
    id: "REQ-1",
    studentName: "Nguyen M. Q. Khanh",
    studentId: "2352525",
    courseCode: "CO1001",
    courseTitle: "Programming Fundamentals",
    topic: "Recursion and pointers",
    preferredStart: "2025-12-05T07:00:00.000Z",
    preferredEnd: "2025-12-05T08:30:00.000Z",
    mode: "HYBRID",
    note: "Need help with Lab 03",
    status: "NEW",
    conflictNote: null,
    decisionNote: null,
    createdAt: "2025-11-30T02:00:00.000Z",
    updatedAt: "2025-11-30T02:00:00.000Z",
  },
  {
    id: "REQ-2",
    studentName: "Tran H. Minh",
    studentId: "2353001",
    courseCode: "MA1001",
    courseTitle: "Calculus I",
    topic: "Derivative problems",
    preferredStart: "2025-12-06T02:00:00.000Z",
    preferredEnd: "2025-12-06T03:30:00.000Z",
    mode: "ONLINE",
    note: "Midterm preparation",
    status: "PENDING",
    conflictNote: null,
    decisionNote: null,
    createdAt: "2025-11-30T03:45:00.000Z",
    updatedAt: "2025-11-30T03:45:00.000Z",
  },
];

const fallbackDashboard: DashboardSnapshot = {
  stats: [
    { label: "Total Sessions", value: 28, sub: "This semester" },
    { label: "Pending Requests", value: 3 },
    { label: "Avg Feedback", value: "4.7 / 5", sub: "from sample data" },
    { label: "Upcoming", value: 4, sub: "Next 7 days" },
  ],
  upcomingSessions: fallbackSessions.slice(0, 3),
  recentFeedback: fallbackFeedbacks.slice(0, 3),
};

const cloneAttachments = (attachments?: ProgressLogAttachment[]) =>
  attachments ? attachments.map((file) => ({ ...file })) : undefined;

const cloneProgress = (log: ProgressLog): ProgressLog => ({
  ...log,
  attachments: cloneAttachments(log.attachments),
  status: log.status,
});

const cloneRequest = (req: TutorRequest): TutorRequest => ({ ...req });

const cloneSession = (session: SessionItem): SessionItem => ({ ...session });

const cloneAvailability = (slot: AvailabilitySlot): AvailabilitySlot => ({ ...slot });

const cloneFeedback = (feedback: FeedbackItem): FeedbackItem => ({ ...feedback });

function mapSession(row: DbSession): SessionItem {
  return {
    id: row.id,
    studentName: row.studentName,
    studentId: row.studentId,
    courseCode: row.courseCode,
    courseTitle: row.courseTitle,
    scheduledStart: row.scheduledStart.toISOString(),
    scheduledEnd: row.scheduledEnd ? row.scheduledEnd.toISOString() : null,
    mode: toSessionMode(row.mode),
    location: row.location,
    status: toSessionStatus(row.status),
    notes: row.notes,
  };
}

function mapFeedback(row: DbFeedback): FeedbackItem {
  return {
    id: row.id,
    sessionId: row.sessionId ?? undefined,
    studentName: row.studentName,
    courseCode: row.courseCode,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapAvailability(row: DbAvailability): AvailabilitySlot {
  return {
    id: row.id,
    day: toDayName(row.day),
    start: row.startTime,
    end: row.endTime,
    mode: toSessionMode(row.mode),
  };
}

function mapProgress(row: DbProgressLog): ProgressLog {
  let parsedAttachments: ProgressLogAttachment[] | undefined;
  if (row.attachments) {
    try {
      const raw = JSON.parse(row.attachments);
      if (Array.isArray(raw)) parsedAttachments = raw as ProgressLogAttachment[];
    } catch (error) {
      parsedAttachments = undefined;
    }
  }

  return {
    id: row.id,
    sessionId: row.sessionId,
    understanding: row.understanding ?? null,
    engagement: row.engagement ?? null,
    summary: row.summary,
    nextPlan: row.nextPlan ?? null,
    attachments: parsedAttachments,
    submittedAt: row.submittedAt.toISOString(),
    status: "SUBMITTED",
  };
}

function mapRequest(row: DbBookingRequest): TutorRequest {
  return {
    id: row.id,
    studentName: row.studentName,
    studentId: row.studentId,
    courseCode: row.courseCode,
    courseTitle: row.courseTitle,
    topic: row.topic ?? null,
    preferredStart: row.preferredStart.toISOString(),
    preferredEnd: row.preferredEnd ? row.preferredEnd.toISOString() : null,
    mode: toSessionMode(row.mode),
    note: row.note ?? null,
    status: toRequestStatus(row.status),
    conflictNote: row.conflictNote ?? null,
    decisionNote: row.decisionNote ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureProfile(prisma: PrismaClient) {
  const existing = await prisma.profile.findUnique({ where: { id: FALLBACK_PROFILE_ID } });
  if (existing) return existing;
  return prisma.profile.create({ data: { id: FALLBACK_PROFILE_ID, ...fallbackProfile } });
}

export async function getAvailability(): Promise<AvailabilitySlot[]> {
  const prisma = await getPrisma();
  if (!prisma) return fallbackAvailability.map(cloneAvailability);
  const rows = await prisma.availability.findMany({ orderBy: [{ day: "asc" }, { startTime: "asc" }] });
  return rows.map(mapAvailability);
}

export async function addAvailability(slot: Omit<AvailabilitySlot, "id">): Promise<AvailabilitySlot> {
  const prisma = await getPrisma();
  if (!prisma) {
    const entry: AvailabilitySlot = { ...slot, id: `AVL-${Date.now()}` };
    fallbackAvailability.push(entry);
    return cloneAvailability(entry);
  }
  const row = await prisma.availability.create({
    data: {
      day: slot.day,
      startTime: slot.start,
      endTime: slot.end,
      mode: slot.mode,
    },
  });
  return mapAvailability(row);
}

export async function getSessions(options?: {
  status?: SessionStatus;
  from?: string;
  to?: string;
  upcomingOnly?: boolean;
  limit?: number;
}): Promise<SessionItem[]> {
  const prisma = await getPrisma();
  if (!prisma) {
    let rows = fallbackSessions.map(cloneSession);
    if (options?.status) rows = rows.filter((s) => s.status === options.status);
    if (options?.from) {
      const from = Date.parse(options.from);
      rows = rows.filter((s) => Date.parse(s.scheduledStart) >= from);
    }
    if (options?.to) {
      const to = Date.parse(options.to);
      rows = rows.filter((s) => Date.parse(s.scheduledStart) <= to);
    }
    if (options?.upcomingOnly) {
      const now = Date.now();
      rows = rows.filter((s) => Date.parse(s.scheduledStart) >= now);
    }
    if (options?.limit) rows = rows.slice(0, options.limit);
    return rows;
  }

  const where: any = {};
  if (options?.status) where.status = options.status;
  if (options?.from || options?.to || options?.upcomingOnly) {
    where.scheduledStart = {};
    if (options.from) where.scheduledStart.gte = new Date(options.from);
    if (options.to) where.scheduledStart.lte = new Date(options.to);
    if (options.upcomingOnly) where.scheduledStart.gte = new Date();
  }

  const rows = await prisma.session.findMany({
    where,
    orderBy: { scheduledStart: "asc" },
    take: options?.limit,
  });
  return rows.map(mapSession);
}

export async function confirmSession(id: string): Promise<SessionItem | null> {
  const prisma = await getPrisma();
  if (!prisma) {
    const session = fallbackSessions.find((s) => s.id === id);
    if (!session) return null;
    session.status = "CONFIRMED";
    return cloneSession(session);
  }
  try {
    const row = await prisma.session.update({ where: { id }, data: { status: "CONFIRMED" } });
    return mapSession(row);
  } catch (error) {
    return null;
  }
}

export async function getFeedbacks(filters?: { courseCode?: string; minScore?: number }): Promise<FeedbackItem[]> {
  const prisma = await getPrisma();
  if (!prisma) {
    let rows = fallbackFeedbacks.map(cloneFeedback);
    if (filters?.courseCode) rows = rows.filter((f) => f.courseCode === filters.courseCode);
    const minScore = filters?.minScore;
    if (typeof minScore === "number") rows = rows.filter((f) => f.rating >= minScore);
    return rows;
  }
  const where: any = {};
  if (filters?.courseCode) where.courseCode = filters.courseCode;
  if (typeof filters?.minScore === "number") where.rating = { gte: filters.minScore };
  const rows = await prisma.feedback.findMany({ where, orderBy: { createdAt: "desc" } });
  return rows.map(mapFeedback);
}

export async function getFeedbackById(id: string): Promise<FeedbackItem | null> {
  const prisma = await getPrisma();
  if (!prisma) {
    const item = fallbackFeedbacks.find((f) => f.id === id);
    return item ? cloneFeedback(item) : null;
  }
  const row = await prisma.feedback.findUnique({ where: { id } });
  return row ? mapFeedback(row) : null;
}

export async function getProfile(): Promise<TutorProfile> {
  const prisma = await getPrisma();
  if (!prisma) return { ...fallbackProfile };
  const row = await ensureProfile(prisma);
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

export async function updateProfile(partial: Partial<TutorProfile>): Promise<TutorProfile> {
  const prisma = await getPrisma();
  if (!prisma) {
    fallbackProfile = { ...fallbackProfile, ...partial };
    return { ...fallbackProfile };
  }
  const row = await prisma.profile.upsert({
    where: { id: FALLBACK_PROFILE_ID },
    update: partial,
    create: { id: FALLBACK_PROFILE_ID, ...fallbackProfile, ...partial },
  });
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = row;
  return rest;
}

export async function addProgressLog(input: {
  sessionId: string;
  summary: string;
  understanding?: string | null;
  engagement?: string | null;
  nextPlan?: string | null;
  attachments?: ProgressLogAttachment[];
  status?: ProgressLogStatus;
}): Promise<ProgressLog> {
  const prisma = await getPrisma();
  if (!prisma) {
    const entry: ProgressLog = {
      id: `PL-${Date.now()}`,
      sessionId: input.sessionId,
      summary: input.summary,
      understanding: input.understanding ?? null,
      engagement: input.engagement ?? null,
      nextPlan: input.nextPlan ?? null,
      attachments: cloneAttachments(input.attachments),
      submittedAt: new Date().toISOString(),
      status: input.status ?? "SUBMITTED",
    };
    fallbackProgressLogs.push(entry);
    return cloneProgress(entry);
  }
  const row = await prisma.progressLog.create({
    data: {
      sessionId: input.sessionId,
      summary: input.summary,
      understanding: input.understanding,
      engagement: input.engagement,
      nextPlan: input.nextPlan,
      attachments: input.attachments ? JSON.stringify(input.attachments) : null,
    },
  });
  return { ...mapProgress(row), status: input.status ?? "SUBMITTED" };
}

export async function listProgressLogs(sessionId?: string): Promise<ProgressLog[]> {
  const prisma = await getPrisma();
  if (!prisma) {
    let rows = fallbackProgressLogs.map(cloneProgress);
    if (sessionId) rows = rows.filter((log) => log.sessionId === sessionId);
    return rows.sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt));
  }
  const rows = await prisma.progressLog.findMany({
    where: sessionId ? { sessionId } : undefined,
    orderBy: { submittedAt: "desc" },
  });
  return rows.map(mapProgress);
}

export async function getRequests(): Promise<TutorRequest[]> {
  const prisma = await getPrisma();
  if (!prisma) return fallbackRequests.map(cloneRequest);
  const rows = await prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapRequest);
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  decisionNote?: string | null
): Promise<TutorRequest | null> {
  const prisma = await getPrisma();
  if (!prisma) {
    const request = fallbackRequests.find((r) => r.id === id);
    if (!request) return null;
    request.status = status;
    request.decisionNote = decisionNote ?? null;
    request.updatedAt = new Date().toISOString();
    return cloneRequest(request);
  }
  try {
    const row = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status,
        decisionNote: decisionNote ?? null,
      },
    });
    return mapRequest(row);
  } catch (error) {
    return null;
  }
}

export async function listRequestsByStatus(status: RequestStatus): Promise<TutorRequest[]> {
  const prisma = await getPrisma();
  if (!prisma) return fallbackRequests.filter((r) => r.status === status).map(cloneRequest);
  const rows = await prisma.bookingRequest.findMany({ where: { status }, orderBy: { createdAt: "desc" } });
  return rows.map(mapRequest);
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const prisma = await getPrisma();
  if (!prisma) {
    return {
      stats: fallbackDashboard.stats.map((stat) => ({ ...stat })),
      upcomingSessions: fallbackDashboard.upcomingSessions.map(cloneSession),
      recentFeedback: fallbackDashboard.recentFeedback.map(cloneFeedback),
    };
  }

  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalSessions, pendingRequests, avgRating, upcomingSessions, recentFeedback] = await Promise.all([
    prisma.session.count(),
    prisma.bookingRequest.count({ where: { status: { in: ["NEW", "PENDING"] } } }),
    prisma.feedback.aggregate({ _avg: { rating: true } }),
    prisma.session.findMany({
      where: {
        scheduledStart: { gte: now, lte: sevenDaysLater },
        status: { in: ["CONFIRMED", "PENDING"] },
      },
      orderBy: { scheduledStart: "asc" },
      take: 5,
    }),
    prisma.feedback.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats: DashboardStat[] = [
    { label: "Total Sessions", value: totalSessions },
    { label: "Pending Requests", value: pendingRequests },
    {
      label: "Avg Feedback",
      value: avgRating._avg.rating ? `${avgRating._avg.rating.toFixed(1)} / 5` : "—",
      sub: "Rolling",
    },
    { label: "Upcoming", value: upcomingSessions.length, sub: "Next 7 days" },
  ];

  return {
    stats,
    upcomingSessions: upcomingSessions.map(mapSession),
    recentFeedback: recentFeedback.map(mapFeedback),
  };
}

export async function getSessionsToday(): Promise<SessionItem[]> {
  const prisma = await getPrisma();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  if (!prisma) {
    return fallbackSessions
      .filter((session) => {
        const timestamp = Date.parse(session.scheduledStart);
        return timestamp >= start.getTime() && timestamp < end.getTime();
      })
      .map(cloneSession);
  }

  const rows = await prisma.session.findMany({
    where: {
      scheduledStart: {
        gte: start,
        lt: end,
      },
    },
    orderBy: { scheduledStart: "asc" },
  });
  return rows.map(mapSession);
}

export async function seedFallbackDataIntoPrisma(prisma: PrismaClient) {
  await ensureProfile(prisma);

  if ((await prisma.availability.count()) === 0) {
    await prisma.availability.createMany({
      data: fallbackAvailability.map((slot) => ({
        id: slot.id,
        day: slot.day,
        startTime: slot.start,
        endTime: slot.end,
        mode: slot.mode,
      })),
      skipDuplicates: true,
    });
  }

  if ((await prisma.session.count()) === 0) {
    await prisma.session.createMany({
      data: fallbackSessions.map((session) => ({
        id: session.id,
        studentName: session.studentName,
        studentId: session.studentId ?? null,
        courseCode: session.courseCode,
        courseTitle: session.courseTitle,
        scheduledStart: new Date(session.scheduledStart),
        scheduledEnd: session.scheduledEnd ? new Date(session.scheduledEnd) : null,
        mode: session.mode,
        location: session.location ?? null,
        status: session.status,
        notes: session.notes ?? null,
      })),
      skipDuplicates: true,
    });
  }

  if ((await prisma.feedback.count()) === 0) {
    await prisma.feedback.createMany({
      data: fallbackFeedbacks.map((feedback) => ({
        id: feedback.id,
        sessionId: feedback.sessionId ?? null,
        studentName: feedback.studentName,
        courseCode: feedback.courseCode,
        rating: feedback.rating,
        comment: feedback.comment,
        createdAt: new Date(feedback.createdAt),
      })),
      skipDuplicates: true,
    });
  }

  if ((await prisma.bookingRequest.count()) === 0) {
    await prisma.bookingRequest.createMany({
      data: fallbackRequests.map((request) => ({
        id: request.id,
        studentName: request.studentName,
        studentId: request.studentId,
        courseCode: request.courseCode,
        courseTitle: request.courseTitle,
        topic: request.topic ?? null,
        preferredStart: new Date(request.preferredStart),
        preferredEnd: request.preferredEnd ? new Date(request.preferredEnd) : null,
        mode: request.mode,
        note: request.note ?? null,
        status: request.status,
        conflictNote: request.conflictNote ?? null,
        decisionNote: request.decisionNote ?? null,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),
      })),
      skipDuplicates: true,
    });
  }
}
