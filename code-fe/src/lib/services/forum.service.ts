import { MOCK_THREADS, mockReplies } from "@/lib/mocks/db/threads";
import type { Thread, Reply } from "@/types/forum";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ForumService = {
  getAllThreads: async (): Promise<Thread[]> => {
    await delay(400);
    return MOCK_THREADS;
  },

  getThreadById: async (id: number): Promise<Thread | undefined> => {
    await delay(250);
    return MOCK_THREADS.find((t) => t.id === id);
  },

  createThread: async (newThread: Partial<Thread>): Promise<Thread> => {
    await delay(600);
    const created: Thread = {
      id: Math.floor(Math.random() * 100000),
      title: newThread.title ?? "(no title)",
      author: newThread.author ?? "unknown",
      authorRole: newThread.authorRole ?? "student",
      course: newThread.course ?? "",
      createdAt: new Date().toISOString(),
      replies: 0,
      status: newThread.status ?? "open",
      pinned: !!newThread.pinned,
      content: newThread.content ?? "",
    } as Thread;

    // insert at front to mimic newest-first
    MOCK_THREADS.unshift(created);
    return created;
  },

  getRepliesForThread: async (threadId: number): Promise<Reply[]> => {
    await delay(200);
    return mockReplies[threadId] ?? [];
  },

  addReply: async (threadId: number, reply: Partial<Reply>): Promise<Reply> => {
    await delay(300);
    const created: Reply = {
      id: Math.floor(Math.random() * 100000),
      threadId,
      author: reply.author ?? "anonymous",
      role: reply.role ?? "student",
      createdAt: new Date().toISOString(),
      content: reply.content ?? "",
      upvotes: reply.upvotes ?? 0,
      downvotes: reply.downvotes ?? 0,
      userVote: null,
      valueVote: (reply.upvotes ?? 0) - (reply.downvotes ?? 0),
      parentCommentId: reply.parentCommentId,
    } as Reply;

    if (!mockReplies[threadId]) mockReplies[threadId] = [];
    mockReplies[threadId].push(created);
    return created;
  },
};
