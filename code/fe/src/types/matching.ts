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
