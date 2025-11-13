export type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  source: "DATACORE" | "Local Override" | "Local";
};

export type Tutor = {
  id: number;
  image?: string;
  name: string;
  fullName?: string;
  studentId?: string;
  email?: string;
  role?: string;
  faculty?: string;
  subject: string;
  department: string;
  match?: string;
  slots?: { time: string; mode: string; remaining?: string }[];
  fullAvailability?: string[];
  status?: string;
  expertise?: string;
  detailedExpertise?: string;
  preferences?: string;
  detailedPreferences?: string;
  sessionsCompleted?: number;
  averageRating?: number;
  feedbacks?: { id: number; rating: number; comment: string; date: string }[];
};

export type LibraryResource = {
  id: string;
  title: string;
  type: "PDF" | "Question Bank" | "Slides" | "Internal";
  department: string;
  source: "HCMUT_LIBRARY" | "Tutor Uploaded";
  access: "ALLOWED" | "RESTRICTED";
  content?: string;
};

export type QuizSource = "trusted-bank" | "ai-freeform";
export type QuizStatus = "new" | "skipped" | "solved";
export type QuizDifficulty = "Intro / warm-up" | "Medium exam-style" | "Hard / stress test";

export type QuizItem = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  source: QuizSource;
  topic: string;
  difficulty: QuizDifficulty;
  status: QuizStatus;
  createdAt: string;
};

// Re-export forum types if present (existing file)
export * from "./forum";
