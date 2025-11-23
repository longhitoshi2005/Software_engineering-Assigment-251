export enum LibraryType {
  PDF = "PDF",
  QUESTION_BANK = "Question Bank",
  SLIDES = "Slides",
  INTERNAL = "Internal"
};

export enum LibrarySourceType {
  HCMUT = "HCMUT_LIBRARY",
  USER = "User Uploaded"
};

export enum LibraryAccessType {
  ALLOWED = "ALLOWED",
  RESTRICTED = "RESTRICTED"
};

export enum QuizSource {
  TRUSTED = "trusted-bank",
  AI = "ai-freeform"
};

export enum QuizStatus {
  NEW = "new",
  SKIPPED = "skipped",
  SOLVED = "solved"
};

export enum QuizDifficulty {
  INTRO = "Intro / warm-up",
  MEDIUM = "Medium exam-style",
  HARD = "Hard / stress test"
}

export type LibraryResource = {
	id: string;
	title: string;
	type: LibraryType;
	department: string;
	source: LibrarySourceType;
	access: LibraryAccessType;
	content?: string;
};

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
