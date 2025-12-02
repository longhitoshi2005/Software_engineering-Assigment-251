export type Notification = {
	id: string;
	userId: string;
	title: string;
	body?: string;
	read?: boolean;
	createdAt?: string;
	metadata?: Record<string, any>;
};

// Backend notification types
export enum NotificationType {
  BOOKING_REQUEST = "BOOKING_REQUEST",
  NEGOTIATION_PROPOSAL = "NEGOTIATION_PROPOSAL",
  SESSION_CONFIRMED = "SESSION_CONFIRMED",
  SESSION_REJECTED = "SESSION_REJECTED",
  SESSION_CANCELLED = "SESSION_CANCELLED",
  REMINDER = "REMINDER",
  FEEDBACK_REQUEST = "FEEDBACK_REQUEST",
}

export interface NotificationResponse {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  session_id?: string;
  is_read: boolean;
  created_at: string;
}

