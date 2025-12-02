export type RankedTutor = {
  tutorId: string;
  tutorName?: string;
  matchScore: number; // 0..1
  justifications: string[];
};

export type TutorMatch = {
  tutorId: string;
  matchScore: number;
  justifications: string[];
};
export type SuggestionShape = {
  id: number;
  studentId: string;
  student: string;
  course: string;
  suggestedTutorId: string;
  suggestedTutor: string;
  score: number;
  reason: string;
};

export type SuggestionList = SuggestionShape[];

export type SuggestionRank = { tutorId: string; score: number; rationale?: string };
export type SuggestionContext = {
  suggestionId: string;
  generatedAt: string; // ISO timestamp
  rankedTutors: SuggestionRank[];
  prompt?: string;
  explanation?: string;
};

export type ManualAssignment = {
  id: string;
  studentId: string;
  tutorId: string;
  coordinatorId: string;
  reason: string;
  suggestionContext?: SuggestionContext | null;
  createdAt?: string;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorRole?: string;
  action: string;
  resource?: string;
  details?: Record<string, any> | string;
  createdAt?: string;
};
