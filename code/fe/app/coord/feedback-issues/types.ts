export interface FlaggedFeedback {
  feedbackId: string;
  sessionId: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  flagReason: string;
  student: { id: string; name: string };
  tutor: { id: string; name: string };
  session: { course: string; sessionTime: string };
  rating: number;
  comment: string;
}
