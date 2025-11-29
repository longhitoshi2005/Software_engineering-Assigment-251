export type Notification = {
	id: string;
	userId: string;
	title: string;
	body?: string;
	read?: boolean;
	createdAt?: string;
	metadata?: Record<string, any>;
};
