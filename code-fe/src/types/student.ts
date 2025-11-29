export type Student = {
	id: string;
	fullName?: string;
	studentId?: string;
	eduMail?: string;
	personalEmail?: string;
	phoneNumber?: string;
	program?: string;
	faculty?: string;
	year?: number;
	metadata?: Record<string, any>;
};
