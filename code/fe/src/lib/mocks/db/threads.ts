// In-memory mock DB for forum threads and replies.
// Exposes async functions to mimic a backend API.

import { Role, AttachmentType, ThreadStatus } from "@/types";
import type { Thread, Reply, Attachment } from "@/types/forum";

// --- seed data (kept similar to previous content) ---
export const MOCK_THREADS: Thread[] = [
  {
    id: 101,
    title: "CO1001 – How to pass the last test case?",
    author: "2353xxxx",
    authorRole: Role.STUDENT,
    course: "CO1001",
    createdAt: new Date().toISOString(),
    replies: 5,
    status: ThreadStatus.OPEN,
    pinned: true,
    content:
      "My code passes test locally but fails the last test case on the system. I'm using C, reading input with scanf. Could it be a flush issue? I've tried fflush(stdin) but it still doesn't work.",
  },
  {
    id: 102,
    title: "EE2002 – Any quick tips for Karnaugh map?",
    author: "2252xxxx",
    authorRole: Role.STUDENT,
    course: "EE2002",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    replies: 2,
    status: ThreadStatus.RESOLVED,
    content:
      "Do you have any tips to draw K-map quickly? I often make mistakes when grouping cells.",
  },
  {
    id: 103,
    title: "MA1001 – Differential homework week 5",
    author: "2278xxxx",
    authorRole: Role.STUDENT,
    course: "MA1001",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    replies: 0,
    status: ThreadStatus.PENDING,
    content: "Problem 3.7 in the textbook, my result differs from the answer. Can anyone explain?",
  },
  {
    id: 104,
    title: "PH1001 – Conservation of momentum law",
    author: "2251xxxx",
    authorRole: Role.STUDENT,
    course: "PH1001",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    replies: 8,
    status: ThreadStatus.RESOLVED,
    content: "In elastic collision, why is kinetic energy conserved but momentum is not?",
  },
  {
    id: 105,
    title: "CO1001 – Question about pointer and array",
    author: "2350xxxx",
    authorRole: Role.STUDENT,
    course: "CO1001",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    replies: 12,
    status: ThreadStatus.RESOLVED,
    content: "I don't understand the difference between char *p and char p[]. When to use which one?",
  },
];

export const mockReplies: Record<number, Reply[]> = {
  101: [
    {
      id: 1001,
      threadId: 101,
      author: "tutor_co1001",
      role: Role.TUTOR,
      createdAt: new Date().toISOString(),
      content:
        "The input might have whitespace at the end of line. Try using fgets or read line by line then parse. scanf might miss whitespace.",
      upvotes: 12,
      downvotes: 1,
      userVote: null,
      valueVote: 11,
    },
    {
      id: 1002,
      threadId: 101,
      author: "2353xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "Okay I'll try it, thank you!",
      parentCommentId: 1001,
    },
    {
      id: 1003,
      threadId: 101,
      author: "2354xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "I had the same issue, using fgets + sscanf worked for me.",
      upvotes: 5,
      downvotes: 0,
      userVote: null,
      valueVote: 5,
      attachments: [
        {
          id: "att1",
          type: AttachmentType.IMAGE,
          url: "/mock-image1.jpg",
          filename: "code_screenshot.png",
          size: 245760,
        },
      ],
    },
    {
      id: 1008,
      threadId: 101,
      author: "2355xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "Thanks for the screenshot! That really helped me understand.",
      parentCommentId: 1003,
    },
  ],
  102: [
    {
      id: 1004,
      threadId: 102,
      author: "tutor_ee2002",
      role: Role.TUTOR,
      createdAt: new Date().toISOString(),
      content:
        "The trick is to always group by powers of 2 (1, 2, 4, 8 cells). And remember K-map wraps around at the edges.",
      upvotes: 8,
      downvotes: 0,
      userVote: null,
      valueVote: 8,
    },
    {
      id: 1005,
      threadId: 102,
      author: "2252xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "Thank you, I understand now!",
      parentCommentId: 1004,
    },
  ],
  104: [
    {
      id: 1006,
      threadId: 104,
      author: "tutor_ph1001",
      role: Role.TUTOR,
      createdAt: new Date().toISOString(),
      content:
        "Momentum is ALWAYS conserved in all collisions (elastic or inelastic). Kinetic energy is only conserved in elastic collisions. Please review the definitions.",
      upvotes: 15,
      downvotes: 2,
      userVote: null,
      valueVote: 13,
    },
  ],
  105: [
    {
      id: 1007,
      threadId: 105,
      author: "tutor_co1001",
      role: Role.TUTOR,
      createdAt: new Date().toISOString(),
      content:
        "char *p is a pointer to a string (can change address). char p[] is a fixed character array. Example: char *p = 'hello' (literal, read-only), char p[] = {'h','e','l','l','o','\\0'} (modifiable).",
      upvotes: 22,
      downvotes: 1,
      userVote: null,
      valueVote: 21,
      attachments: [
        {
          id: "att2",
          type: AttachmentType.VIDEO,
          url: "/mock-video1.mp4",
          filename: "pointer_explanation.mp4",
          size: 5242880,
        },
      ],
    },
    {
      id: 1009,
      threadId: 105,
      author: "2356xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "Great explanation! The video really helped clarify the concept.",
      parentCommentId: 1007,
    },
    {
      id: 1010,
      threadId: 105,
      author: "2357xxxx",
      role: Role.STUDENT,
      createdAt: new Date().toISOString(),
      content: "I still don't get when to use which one. Can you give a practical example?",
      upvotes: 3,
      downvotes: 0,
      userVote: null,
      valueVote: 3,
    },
  ],
};

export const MOCK_PENDING_THREADS: Thread[] = [
  {
    id: 201,
    title: "MA1001 – Does anyone have old exam papers?",
    author: "2271xxxx",
    authorRole: Role.STUDENT,
    course: "MA1001",
    createdAt: new Date().toISOString(),
    replies: 0,
    status: ThreadStatus.PENDING,
    reported: false,
    content: "Can anyone share last year's exam papers with me?",
  },
  {
    id: 202,
    title: "CO1001 – Share final project source code",
    author: "fake_account",
    authorRole: Role.STUDENT,
    course: "CO1001",
    createdAt: new Date().toISOString(),
    replies: 0,
    status: ThreadStatus.PENDING,
    reported: true,
    content: "Can anyone share their final project source code? I can't finish mine.",
  },
];

// --- simple id generators ---
let nextThreadId = Math.max(...MOCK_THREADS.map((t) => t.id), 100) + 1;
let nextReplyId = Math.max(
  1000,
  ...Object.values(mockReplies)
    .flat()
    .map((r) => r.id)
) + 1;
let nextAttachmentCounter = 1;

function delay(ms = 120) {
  return new Promise((res) => setTimeout(res, ms));
}

// --- API functions ---
export async function listThreads(opts?: { course?: string; status?: ThreadStatus | string; search?: string }) {
  await delay();
  let rows = MOCK_THREADS.slice();
  if (opts?.course) rows = rows.filter((r) => r.course === opts.course);
  if (opts?.status) rows = rows.filter((r) => String(r.status) === String(opts.status));
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((r) => (r.title + " " + r.content).toLowerCase().includes(q));
  }
  return rows;
}

export async function getThreadById(id: number) {
  await delay();
  const thread = MOCK_THREADS.find((t) => t.id === id) || MOCK_PENDING_THREADS.find((t) => t.id === id);
  if (!thread) return null;
  const replies = (mockReplies[id] || []).map((r) => ({ ...r }));
  return { ...thread, replies } as Thread & { replies?: Reply[] };
}

export async function createThread(payload: Partial<Thread> & { author: string; title: string; content: string }) {
  await delay();
  const newThread: Thread = {
    id: nextThreadId++,
    title: payload.title,
    author: payload.author,
    authorRole: payload.authorRole ?? Role.STUDENT,
    course: payload.course ?? "GENERAL",
    createdAt: new Date().toISOString(),
    replies: 0,
    status: payload.status ?? ThreadStatus.OPEN,
    pinned: !!payload.pinned,
    content: payload.content,
  } as Thread;
  MOCK_THREADS.unshift(newThread);
  mockReplies[newThread.id] = [];
  return newThread;
}

export async function createReply(threadId: number, payload: Partial<Reply> & { author: string; content: string }) {
  await delay();
  if (!MOCK_THREADS.find((t) => t.id === threadId) && !MOCK_PENDING_THREADS.find((t) => t.id === threadId)) {
    throw new Error("Thread not found");
  }
  const reply: Reply = {
    id: nextReplyId++,
    threadId,
    author: payload.author,
    role: payload.role ?? Role.STUDENT,
    createdAt: new Date().toISOString(),
    content: payload.content,
    upvotes: payload.upvotes ?? 0,
    downvotes: payload.downvotes ?? 0,
    userVote: null,
    valueVote: (payload.upvotes ?? 0) - (payload.downvotes ?? 0),
    parentCommentId: payload.parentCommentId,
    attachments: payload.attachments as Attachment[] | undefined,
  };
  mockReplies[threadId] = mockReplies[threadId] || [];
  mockReplies[threadId].push(reply);
  const th = MOCK_THREADS.find((t) => t.id === threadId) || MOCK_PENDING_THREADS.find((t) => t.id === threadId);
  if (th) th.replies = (th.replies || 0) + 1;
  return reply;
}

export async function voteReply(threadId: number, replyId: number, vote: "up" | "down" | null) {
  await delay();
  const list = mockReplies[threadId] || [];
  const r = list.find((x) => x.id === replyId);
  if (!r) throw new Error("Reply not found");
  // simplistic vote handling (no per-user tracking here)
  if (vote === "up") {
    r.upvotes = (r.upvotes || 0) + 1;
    r.valueVote = (r.valueVote || 0) + 1;
  } else if (vote === "down") {
    r.downvotes = (r.downvotes || 0) + 1;
    r.valueVote = (r.valueVote || 0) - 1;
  }
  return r;
}

export async function updateThreadStatus(threadId: number, status: ThreadStatus) {
  await delay();
  const t = MOCK_THREADS.find((x) => x.id === threadId) || MOCK_PENDING_THREADS.find((x) => x.id === threadId);
  if (!t) throw new Error("Thread not found");
  t.status = status;
  return t;
}

export async function pinThread(threadId: number, pinned = true) {
  await delay();
  const t = MOCK_THREADS.find((x) => x.id === threadId) || MOCK_PENDING_THREADS.find((x) => x.id === threadId);
  if (!t) throw new Error("Thread not found");
  (t as any).pinned = pinned;
  return t;
}

export async function attachToReply(threadId: number, replyId: number, attachment: Omit<Attachment, "id">) {
  await delay();
  const list = mockReplies[threadId] || [];
  const r = list.find((x) => x.id === replyId);
  if (!r) throw new Error("Reply not found");
  const att: Attachment = {
    id: `att-${nextAttachmentCounter++}`,
    ...attachment,
  } as Attachment;
  r.attachments = r.attachments || [];
  r.attachments.push(att);
  return att;
}

export async function searchThreads(q: string) {
  await delay();
  const query = q.toLowerCase();
  return MOCK_THREADS.filter((t) => (t.title + " " + t.content).toLowerCase().includes(query));
}

const ThreadsDB = {
  listThreads,
  getThreadById,
  createThread,
  createReply,
  voteReply,
  updateThreadStatus,
  pinThread,
  attachToReply,
  searchThreads,
};

export default ThreadsDB;
