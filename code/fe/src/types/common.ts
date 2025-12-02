export enum Role {
  STUDENT = 'student',
  TUTOR = 'tutor',
  COORD = 'coordinator',
  ADMIN = 'admin',
  SA = 'student affairs'
};
export type Id = string | number;

export type Paginated<T> = {
	items: T[];
	total: number;
	page: number;
	pageSize: number;
};

export type Timestamp = string; // ISO 8601
