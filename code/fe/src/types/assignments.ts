export type ManualAssignment = {
  id: string;
  studentId: string;
  tutorId: string;
  coordinatorId: string;
  course?: string | null;
  reason: string;
  slot?: string | null;
  suggestionContext?: any | null;
  createdAt: string;
};
