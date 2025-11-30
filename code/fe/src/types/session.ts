export enum ModeType {
  ONLINE = 'online',
  IN_PERSON = 'in-person'
}

export enum SessionStatusType {
  BOOKED = 'booked',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PENDING = 'pending'
}

export type SessionSlot = {
	id: string;
	start: string; // ISO
	end: string; // ISO
	mode?: ModeType;
	remaining?: number;
};

export type Session = {
	id: string;
	studentId: string;
	tutorId?: string;
	course?: string;
	topic?: string;
	scheduledAt?: string;
	status?: SessionStatusType;
	slot?: SessionSlot;
	notes?: string;
};
