export enum LibraryType {
	PDF = "PDF",
	QUESTION_BANK = "Question Bank",
	VIDEO = "Video",
}

export enum LibrarySourceType {
	HCMUT = "HCMUT_LIBRARY",
	USER = "User Uploaded",
}

export enum LibraryAccessType {
	ALLOWED = "ALLOWED",
	RESTRICTED = "RESTRICTED",
}

export type LibraryResource = {
	id: string;
	title: string;
	author?: string;
	link?: string;
	access?: LibraryAccessType;
	type?: LibraryType;
	department?: string;
	source?: LibrarySourceType;
	content?: string;
};
