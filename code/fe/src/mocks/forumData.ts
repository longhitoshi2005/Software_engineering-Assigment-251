// src/mocks/forumData.ts
import type { Thread, Reply } from "@/types/forum";

export const mockThreads: Thread[] = [
  {
    id: 101,
    title: "CO1001 – How to pass the last test case?",
    author: "2353xxxx",
    authorRole: "student",
    course: "CO1001",
    createdAt: "Today 10:12",
    replies: 5,
    status: "open",
    pinned: true,
    content:
      "My code passes test locally but fails the last test case on the system. I'm using C, reading input with scanf. Could it be a flush issue? I've tried fflush(stdin) but it still doesn't work.",
  },
  {
    id: 102,
    title: "EE2002 – Any quick tips for Karnaugh map?",
    author: "2252xxxx",
    authorRole: "student",
    course: "EE2002",
    createdAt: "Yesterday 21:03",
    replies: 2,
    status: "resolved",
    content:
      "Do you have any tips to draw K-map quickly? I often make mistakes when grouping cells.",
  },
  {
    id: 103,
    title: "MA1001 – Differential homework week 5",
    author: "2278xxxx",
    authorRole: "student",
    course: "MA1001",
    createdAt: "2 days ago",
    replies: 0,
    status: "pending",
    content: "Problem 3.7 in the textbook, my result differs from the answer. Can anyone explain?",
  },
  {
    id: 104,
    title: "PH1001 – Conservation of momentum law",
    author: "2251xxxx",
    authorRole: "student",
    course: "PH1001",
    createdAt: "3 days ago",
    replies: 8,
    status: "resolved",
    content: "In elastic collision, why is kinetic energy conserved but momentum is not?",
  },
  {
    id: 105,
    title: "CO1001 – Question about pointer and array",
    author: "2350xxxx",
    authorRole: "student",
    course: "CO1001",
    createdAt: "1 week ago",
    replies: 12,
    status: "resolved",
    content: "I don't understand the difference between char *p and char p[]. When to use which one?",
  },
];

export const mockReplies: Record<number, Reply[]> = {
  101: [
    {
      id: 1001,
      threadId: 101,
      author: "tutor_co1001",
      role: "tutor",
      createdAt: "5 mins ago",
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
      role: "student",
      createdAt: "just now",
      content: "Okay I'll try it, thank you!",
      parentCommentId: 1001, // This is a nested comment replying to comment 1001
    },
    {
      id: 1003,
      threadId: 101,
      author: "2354xxxx",
      role: "student",
      createdAt: "2 mins ago",
      content: "I had the same issue, using fgets + sscanf worked for me.",
      upvotes: 5,
      downvotes: 0,
      userVote: null,
      valueVote: 5,
      attachments: [
        {
          id: "att1",
          type: "image",
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
      role: "student",
      createdAt: "1 min ago",
      content: "Thanks for the screenshot! That really helped me understand.",
      parentCommentId: 1003, // Nested reply to comment 1003
    },
  ],
  102: [
    {
      id: 1004,
      threadId: 102,
      author: "tutor_ee2002",
      role: "tutor",
      createdAt: "Yesterday 21:30",
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
      role: "student",
      createdAt: "Yesterday 22:00",
      content: "Thank you, I understand now!",
      parentCommentId: 1004, // Nested reply
    },
  ],
  104: [
    {
      id: 1006,
      threadId: 104,
      author: "tutor_ph1001",
      role: "tutor",
      createdAt: "3 days ago",
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
      role: "tutor",
      createdAt: "1 week ago",
      content:
        "char *p is a pointer to a string (can change address). char p[] is a fixed character array. Example: char *p = 'hello' (literal, read-only), char p[] = {'h','e','l','l','o','\\0'} (modifiable).",
      upvotes: 22,
      downvotes: 1,
      userVote: null,
      valueVote: 21,
      attachments: [
        {
          id: "att2",
          type: "video",
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
      role: "student",
      createdAt: "6 days ago",
      content: "Great explanation! The video really helped clarify the concept.",
      parentCommentId: 1007, // Nested reply
    },
    {
      id: 1010,
      threadId: 105,
      author: "2357xxxx",
      role: "student",
      createdAt: "5 days ago",
      content: "I still don't get when to use which one. Can you give a practical example?",
      upvotes: 3,
      downvotes: 0,
      userVote: null,
      valueVote: 3,
    },
  ],
};

export const mockPendingThreads: Thread[] = [
  {
    id: 201,
    title: "MA1001 – Does anyone have old exam papers?",
    author: "2271xxxx",
    authorRole: "student",
    course: "MA1001",
    createdAt: "1 hour ago",
    replies: 0,
    status: "pending",
    reported: false,
    content: "Can anyone share last year's exam papers with me?",
  },
  {
    id: 202,
    title: "CO1001 – Share final project source code",
    author: "fake_account",
    authorRole: "student",
    course: "CO1001",
    createdAt: "30 mins ago",
    replies: 0,
    status: "pending",
    reported: true,
    content: "Can anyone share their final project source code? I can't finish mine.",
  },
];