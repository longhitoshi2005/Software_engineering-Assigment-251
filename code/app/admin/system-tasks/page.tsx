"use client";

import { useEffect, useState } from "react";

interface Task {
  name: string;
  schedule: string;
  lastRun: string;
  status: "Success" | "Failed" | "Running";
}

interface TaskHistoryItem {
  time: string;
  task: string;
  result: string;
}

export default function AdminSystemTasksPage() {
  // ===============================
  // STATE
  // ===============================
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  // ===============================
  // LOAD DATA
  // ===============================
  const loadTasks = async () => {
    const res = await fetch("/api/admin/system-tasks");
    setTasks(await res.json());
  };

  const loadHistory = async () =>    {
    const res = await fetch("/api/admin/system-tasks/history");
    setHistory(await res.json());
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadTasks(), loadHistory()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ===============================
  // RUN TASK
  // ===============================
  const runTask = async (taskName: string) => {
    showMessage(`Running ${taskName}...`);

    // Immediately mark as Running in UI
    setTasks((prev) =>
      prev.map((t) =>
        t.name === taskName ? { ...t, status: "Running" } : t
      )
    );

    // Call API
    await fetch("/api/admin/system-tasks/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskName }),
    });

    // Reload updated data
    await loadAll();

    showMessage(`${taskName} completed successfully.`);
  };

  // ===============================
  // UTILS
  // ===============================
  const getStatusColor = (status: string) => {
    if (status === "Success") return "text-green-700 bg-green-50";
    if (status === "Failed") return "text-red-700 bg-red-50";
    return "text-blue-700 bg-blue-50"; // Running
  };

  if (loading) {
    return <div className="p-4 text-sm text-black/60">Loading system tasks...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">System Tasks</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">
          View and run scheduled tasks such as DB cleanup, log archiving, and backups.
        </p>
      </header>

      {/* Message Banner */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded text-sm animate-fadeIn">
          {message}
        </div>
      )}

      {/* Scheduled Tasks */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-dark-blue">Scheduled Tasks</h2>
          <div className="flex gap-2">
            <button
              onClick={() => runTask("Daily DB cleanup")}
              className="px-3 py-1.5 bg-soft-white-blue border border-soft-white-blue rounded text-xs font-medium text-dark-blue hover:bg-blue-50 transition"
            >
              Run cleanup now
            </button>
            <button
              onClick={() => runTask("Full backup")}
              className="px-3 py-1.5 bg-soft-white-blue border border-soft-white-blue rounded text-xs font-medium text-dark-blue hover:bg-blue-50 transition"
            >
              Run backup now
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.name}
              className="p-4 bg-soft-white-blue border border-soft-white-blue rounded"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-dark-blue">{task.name}</h3>
                  <p className="text-xs text-black/60 mt-1">
                    Schedule: {task.schedule}
                  </p>
                  <p className="text-xs text-black/60">
                    Last run: {task.lastRun}
                  </p>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Task History */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <h2 className="text-base font-semibold text-dark-blue mb-3">Task History</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Time</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Task</th>
              <th className="text-left py-2 px-3 font-semibold text-dark-blue">Result</th>
            </tr>
          </thead>

          <tbody>
            {history.map((h, idx) => (
              <tr
                key={idx}
                className="border-b border-soft-white-blue hover:bg-soft-white-blue"
              >
                <td className="py-3 px-3 text-black/60 whitespace-nowrap">{h.time}</td>
                <td className="py-3 px-3 font-medium text-dark-blue">{h.task}</td>
                <td className="py-3 px-3 text-black/70">{h.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
