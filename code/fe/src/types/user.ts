export type User = {
	id: string;
	name: string;
	email: string;
	roles: string[];
};

export type Coordinator = {
	id: string;
	fullName?: string;
	staffId?: string;
	email?: string;
	role?: string;
	department?: string;
};
