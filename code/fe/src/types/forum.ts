// src/types/forum.ts
export type ThreadStatus = "open" | "resolved" | "pending";

export type Thread = {
  id: number;
  title: string;
  author: string;
  authorRole?: "student" | "tutor" | "coordinator";
  course: string;
  createdAt: string;
  replies: number;
  status: ThreadStatus;
  pinned?: boolean;
  content?: string;
  reported?: boolean;
};

export type Reply = {
  id: number;
  threadId: number;
  author: string;
  role: "student" | "tutor" | "coordinator";
  createdAt: string;
  content: string;
};

export type ForumFilters = {
  course: string;
  status: string;
  q: string;
};