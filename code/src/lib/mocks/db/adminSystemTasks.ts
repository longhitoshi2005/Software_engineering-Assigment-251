// lib/mocks/db/adminSystemTasks.ts

export type TaskStatus = "Success" | "Failed" | "Running";

export interface Task {
  name: string;
  schedule: string;
  lastRun: string;
  status: TaskStatus;
}

export interface TaskHistoryItem {
  time: string;
  task: string;
  result: string;
}

// === MOCK DATABASE (RAM) ===
export let adminSystemTasks: Task[] = [
  {
    name: "Daily DB cleanup",
    schedule: "Everyday at 03:00",
    lastRun: "2025-11-02 03:01",
    status: "Success",
  },
  {
    name: "Incremental backup",
    schedule: "Every 15 minutes",
    lastRun: "2025-11-02 10:00",
    status: "Success",
  },
  {
    name: "Full backup",
    schedule: "Everyday at 01:00",
    lastRun: "2025-11-02 01:02",
    status: "Success",
  },
];

export let adminSystemTaskHistory: TaskHistoryItem[] = [
  {
    time: "2025-11-02 03:01",
    task: "Daily DB cleanup",
    result: "OK (12 MB freed)",
  },
  {
    time: "2025-11-02 01:02",
    task: "Full backup",
    result: "OK (stored in dc-hcmut-bucket-02)",
  },
  {
    time: "2025-11-01 03:01",
    task: "Daily DB cleanup",
    result: "OK (9 MB freed)",
  },
];

// === HELPERS ===
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function nowTime(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function runAdminTaskMock(
  taskName: string,
  resultText: string,
  status: TaskStatus = "Success"
) {
  const time = nowTime();

  // Update task
  adminSystemTasks = adminSystemTasks.map((t) =>
    t.name === taskName ? { ...t, lastRun: time, status } : t
  );

  // Add history
  adminSystemTaskHistory = [
    {
      time,
      task: taskName,
      result: resultText,
    },
    ...adminSystemTaskHistory,
  ];

  return { time, taskName, status, resultText };
}
