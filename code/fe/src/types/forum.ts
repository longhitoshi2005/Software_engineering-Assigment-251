import { Role } from "./common";

// src/types/forum.ts
export enum ThreadStatus {
  OPEN = "open",
  RESOLVED = "resolved",
  PENDING = "pending"
};

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video'
}

export type Attachment = {
  id: string;
  type: AttachmentType;
  url: string;
  filename: string;
  size: number;
};

export type Thread = {
  id: number;
  title: string;
  author: string;
  authorRole?: Role;
  course: string;
  createdAt: string;
  replies: number;
  status: ThreadStatus;
  pinned?: boolean;
  content?: string;
  reported?: boolean;
  attachments?: Attachment[];
};

export type Reply = {
  id: number;
  threadId: number;
  author: string;
  role: Role;
  createdAt: string;
  content: string;
  attachments?: Attachment[];
  parentCommentId?: number; // For nested comments (replies to other comments)
  // Voting fields - only for top-level comments (parentCommentId is null/undefined)
  upvotes?: number;
  downvotes?: number;
  userVote?: 'up' | 'down' | null;
  // Computed field for vote value
  valueVote?: number; // upvotes - downvotes
};

export type ForumFilters = {
  course: string;
  status: string;
  q: string;
};