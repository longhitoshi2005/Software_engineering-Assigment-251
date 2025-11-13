// Centralized mocks for migrate app (coord area and shared)
// Export types and constant mock datasets so no file defines its own mocks.

export type Integration = {
  id: number;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'pending' | string;
  lastSync: string;
};

export const INTEGRATIONS: Integration[] = [
  { id: 1, name: "Google Calendar", description: "Sync sessions with Google Calendar", status: "connected", lastSync: "2024-01-15 08:00:00" },
  { id: 2, name: "Zoom", description: "Create and manage video sessions", status: "connected", lastSync: "2024-01-15 09:30:00" },
  { id: 3, name: "Slack", description: "Send notifications to coordinators", status: "disconnected", lastSync: "Never" },
  { id: 4, name: "Microsoft Teams", description: "Integration with Teams for meetings", status: "pending", lastSync: "Setup required" },
];

export type RoleDef = { id: number; name: string; description: string; permissions: string[]; users: number };
export const ROLES: RoleDef[] = [
  { id: 1, name: "Coordinator Lead", description: "Full access to all coordinator functions", permissions: ["assign_tutors", "resolve_conflicts", "generate_reports", "manage_integrations", "audit_logs"], users: 2 },
  { id: 2, name: "Coordinator", description: "Standard coordinator access", permissions: ["assign_tutors", "resolve_conflicts", "generate_reports"], users: 5 },
  { id: 3, name: "Coordinator Assistant", description: "Limited coordinator access", permissions: ["view_reports", "view_sessions"], users: 3 },
];

export const PERMISSIONS = [
  { key: "assign_tutors", label: "Assign tutors to students" },
  { key: "resolve_conflicts", label: "Resolve scheduling conflicts" },
  { key: "generate_reports", label: "Generate workload reports" },
  { key: "manage_integrations", label: "Manage third-party integrations" },
  { key: "audit_logs", label: "View audit logs" },
  { key: "view_reports", label: "View reports" },
  { key: "view_sessions", label: "View session details" },
];

export type SystemTask = { id: number; name: string; status: string; progress: number; lastRun: string; nextRun: string };
export const SYSTEM_TASKS: SystemTask[] = [
  { id: 1, name: "Auto-assign pending requests", status: "running", progress: 65, lastRun: "2024-01-15 08:00:00", nextRun: "2024-01-15 16:00:00" },
  { id: 2, name: "Generate weekly reports", status: "completed", progress: 100, lastRun: "2024-01-14 23:00:00", nextRun: "2024-01-21 23:00:00" },
  { id: 3, name: "Clean up old sessions", status: "pending", progress: 0, lastRun: "2024-01-10 02:00:00", nextRun: "2024-01-16 02:00:00" },
  { id: 4, name: "Update tutor availability", status: "failed", progress: 0, lastRun: "2024-01-15 06:00:00", nextRun: "2024-01-15 12:00:00" },
];

export type AuditLog = { id: number; timestamp: string; user: string; action: string; details: string; type: string };
export const AUDIT_LOGS: AuditLog[] = [
  { id: 1, timestamp: "2024-01-15 10:30:00", user: "coord1", action: "Assigned tutor to student", details: "Tutor John assigned to Student Alice for Math session", type: "assignment" },
  { id: 2, timestamp: "2024-01-15 09:15:00", user: "coord1", action: "Resolved conflict", details: "Resolved scheduling conflict between Tutor Bob and Student Charlie", type: "conflict" },
  { id: 3, timestamp: "2024-01-14 16:45:00", user: "coord2", action: "Manual match created", details: "Created manual match for advanced Physics tutoring", type: "match" },
  { id: 4, timestamp: "2024-01-14 14:20:00", user: "coord1", action: "Report generated", details: "Generated workload report for January 2024", type: "report" },
];

export type TutorStat = { name: string; faculty: string; active: number; max: number; utilization: number };
export const TUTOR_STATS: TutorStat[] = [
  { name: "Nguyen T. A.", faculty: "CSE", active: 8, max: 10, utilization: 80 },
  { name: "Pham Q. T.", faculty: "Math", active: 6, max: 8, utilization: 75 },
  { name: "Truong Q. T.", faculty: "EE", active: 11, max: 10, utilization: 110 },
];

export type PerformanceMetric = { metric: string; value: string; trend: string; change: string };
export const PERFORMANCE_METRICS: PerformanceMetric[] = [
  { metric: "Match success rate", value: "94%", trend: "up", change: "+2.1%" },
  { metric: "Average response time", value: "2.3h", trend: "down", change: "-0.4h" },
  { metric: "Student satisfaction", value: "4.6/5", trend: "up", change: "+0.2" },
  { metric: "Tutor utilization", value: "87%", trend: "up", change: "+3.2%" },
  { metric: "Conflict resolution rate", value: "96%", trend: "stable", change: "0.0%" },
];

export type WorkloadRow = { coordinator: string; assignedSessions: number; resolvedConflicts: number; pendingRequests: number; avgResponseTime: string };
export const WORKLOAD_DATA: WorkloadRow[] = [
  { coordinator: "Alice Johnson", assignedSessions: 45, resolvedConflicts: 12, pendingRequests: 8, avgResponseTime: "2.3h" },
  { coordinator: "Bob Smith", assignedSessions: 38, resolvedConflicts: 15, pendingRequests: 5, avgResponseTime: "1.8h" },
  { coordinator: "Carol Davis", assignedSessions: 52, resolvedConflicts: 8, pendingRequests: 12, avgResponseTime: "3.1h" },
  { coordinator: "David Wilson", assignedSessions: 41, resolvedConflicts: 10, pendingRequests: 6, avgResponseTime: "2.5h" },
];

export type ExportJob = { id: number; name: string; type: string; status: string; created: string; size: string; downloadUrl: string | null };
export const EXPORT_JOBS: ExportJob[] = [
  { id: 1, name: "Student data export", type: "CSV", status: "completed", created: "2024-01-15 09:00:00", size: "2.3 MB", downloadUrl: "/downloads/student-data-2024-01-15.csv" },
  { id: 2, name: "Session reports", type: "PDF", status: "processing", created: "2024-01-15 10:30:00", size: "Processing...", downloadUrl: null },
  { id: 3, name: "Tutor performance", type: "Excel", status: "completed", created: "2024-01-14 16:00:00", size: "1.8 MB", downloadUrl: "/downloads/tutor-performance-2024-01-14.xlsx" },
  { id: 4, name: "Feedback summary", type: "JSON", status: "failed", created: "2024-01-14 14:00:00", size: "Error", downloadUrl: null },
];

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

export type Conflict = { id: string; student: string; tutor: string; reason: string; created: string; status: string };
export const CONFLICTS: Conflict[] = [
  { id: "conf-1", student: "Alice Nguyen", tutor: "Tutor A", reason: "Double booking", created: "2024-01-15 10:00:00", status: "open" },
];

export const STUDENTS = [
  { id: "s-101", name: "Alice Nguyen", email: "alice@example.com" },
  { id: "s-102", name: "Tran Minh", email: "tran.minh@example.com" },
];

export type Student = { id: string; name: string; email?: string };

export type LibraryResource = { id: string; title: string; author?: string; link?: string };
export const LIBRARY_RESOURCES: LibraryResource[] = [
  { id: "lib-1", title: "Intro to Algorithms", author: "Cormen", link: "" },
  { id: "lib-2", title: "Digital Systems Lab Guide", author: "Nguyen", link: "" },
];

export const RECENT_SESSIONS = [
  { id: "rs-1", title: "Recursion lab review", date: "2025-10-25" },
];

export const AVAILABLE_COURSES = [
  { id: "CO1001", name: "Programming Fundamentals" },
  { id: "MA1001", name: "Calculus I" },
];

export const MY_UPCOMING_SESSIONS = [
  {
    id: "UP-1",
    datetime: "Mon, Oct 27 · 09:00 – 10:30",
    tutorName: "John Doe",
    course: "CO1001 · Programming Fundamentals",
    mode: "Online",
    status: "CONFIRMED",
  },
];

export const MY_COMPLETED_SESSIONS = [
  {
    id: "COMP-1",
    datetime: "Tue, Oct 26 · 14:00 – 15:30",
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
    time: "Wed, Oct 27 · 14:00–15:30 · Room B4-205 / Online",
    topic: "Recursion & pointer debugging – Lab 03",
    status: "completed",
  },
  {
    id: "SESS-2025-10-26-0900",
    studentName: "Tran H. Minh",
    course: "MA1001 · Calculus I",
    time: "Tue, Oct 26 · 09:00–10:15 · C2-301",
    topic: "Derivative drills for midterm",
    status: "completed",
  },
  {
    id: "SESS-2025-10-26-1630",
    studentName: "Le T. Cam Tu",
    course: "EE2002 · Digital Systems",
    time: "Tue, Oct 26 · 16:30–18:00 · Lab D1",
    topic: "Timing diagram, FF troubleshooting",
    status: "in-progress",
  },
];

export const TUTOR_DASH_SESSIONS = [
  {
    id: "sess-301",
    datetime: "Mon · 09:00 – 10:30 · B4-205 / Online",
    student: "Nguyen M. Q. Khanh",
    subject: "CO1001 · Programming Fundamentals",
    status: "CONFIRMED",
  },
  {
    id: "sess-302",
    datetime: "Tue · 14:00 – 15:30 · Online only",
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
export type Tutor = {
  id: string;
  name?: string;
  fullName?: string;
  faculty?: string;
  email?: string;
  subject?: string;
  status?: string;
  slots?: { time: string; mode: string }[];
  sessionsCompleted?: number;
};

export const TUTORS: Tutor[] = [
  {
    id: "1",
    name: "John Doe",
    fullName: "John Doe",
    faculty: "CSE",
    subject: "Programming Fundamentals",
    status: "Available",
    slots: [{ time: "Mon 09:00", mode: "Online" }],
    sessionsCompleted: 3,
    email: "john@example.com",
  },
  {
    id: "2",
    name: "Pham Q. T.",
    fullName: "Pham Quoc Thang",
    faculty: "Math",
    subject: "Calculus I",
    status: "NearFull",
    slots: [],
    sessionsCompleted: 5,
    email: "pham@example.com",
  },
];
