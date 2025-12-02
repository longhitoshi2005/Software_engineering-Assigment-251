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
