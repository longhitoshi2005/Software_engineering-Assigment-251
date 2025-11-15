"use client";

import React, { useState, useMemo } from "react";
import ClientRoleGuard from "@/src/components/ClientRoleGuard";
import { SYSTEM_TASKS, SystemTask } from '@/src/lib/mocks';
import { hasRole, Role } from "@/src/lib/role";

const SystemTasks: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const tasks = useMemo<SystemTask[]>(() => SYSTEM_TASKS, []);

  const filteredTasks = useMemo(() => {
    if (statusFilter === "all") return tasks;
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.PROGRAM_ADMIN]} title="System tasks (Admin only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">System tasks</h1>
        <p className="text-sm text-black/70 mt-1">Monitor automated processes and maintenance tasks.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="all">All tasks</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div key={task.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-dark-blue">{task.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm text-black/60 mb-1">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-black/60">
                <span>Last run: {task.lastRun}</span>
                <span>Next run: {task.nextRun}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      </div>
    </ClientRoleGuard>
  );
};

export default SystemTasks;
