"use client";

import React, { useState, useMemo } from "react";
import { hasRole, Role } from '@/app/lib/role';

const PendingAssignDetails: React.FC = () => {
  const [priorityFilter, setPriorityFilter] = useState("all");

  const pendingRequests = useMemo(() => [
    {
      id: 1,
      student: "Alice Johnson",
      grade: "11th",
      subject: "Advanced Calculus",
      requestedDate: "2024-01-10",
      preferredTimes: ["Mon 14:00-15:00", "Wed 15:00-16:00"],
      specialNeeds: "Visual learning style",
      priority: "high",
      waitingDays: 5
    },
    {
      id: 2,
      student: "Bob Wilson",
      grade: "10th",
      subject: "Physics",
      requestedDate: "2024-01-12",
      preferredTimes: ["Tue 16:00-17:00", "Thu 17:00-18:00"],
      specialNeeds: "Extra time for problem-solving",
      priority: "medium",
      waitingDays: 3
    },
    {
      id: 3,
      student: "Carol Davis",
      grade: "12th",
      subject: "Chemistry",
      requestedDate: "2024-01-08",
      preferredTimes: ["Mon 10:00-11:00", "Fri 14:00-15:00"],
      specialNeeds: "Lab experiment preparation",
      priority: "high",
      waitingDays: 7
    },
    {
      id: 4,
      student: "David Lee",
      grade: "9th",
      subject: "Algebra",
      requestedDate: "2024-01-14",
      preferredTimes: ["Wed 13:00-14:00", "Fri 15:00-16:00"],
      specialNeeds: "Foundation building",
      priority: "low",
      waitingDays: 1
    },
  ], []);

  const filteredRequests = useMemo(() => {
    if (priorityFilter === "all") return pendingRequests;
    return pendingRequests.filter(request => request.priority === priorityFilter);
  }, [pendingRequests, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Pending assignments details</h1>
        <p className="text-sm text-black/70 mt-1">Review and assign tutors to pending student requests.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="all">All priorities</option>
            <option value="high">High priority</option>
            <option value="medium">Medium priority</option>
            <option value="low">Low priority</option>
          </select>

          <div className="text-sm text-black/60">
            {filteredRequests.length} pending request{filteredRequests.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-dark-blue">
                      {request.student} - {request.subject}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {request.grade} grade
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority} priority
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-black/70 mb-1">
                        <strong>Requested:</strong> {request.requestedDate}
                      </div>
                      <div className="text-sm text-black/70 mb-1">
                        <strong>Waiting:</strong> {request.waitingDays} days
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black/70 mb-1">
                        <strong>Preferred times:</strong>
                      </div>
                      <div className="text-xs text-black/60">
                        {request.preferredTimes.join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-black/70">
                    <strong>Special needs:</strong> {request.specialNeeds}
                  </div>
                </div>

                <div className="flex gap-2">
                  {hasRole(Role.Coordinator, Role.ProgramAdmin) ? (
                    <>
                      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                        Assign tutor
                      </button>
                      <button className="px-3 py-1 text-sm border border-soft-white-blue rounded hover:bg-gray-50">
                        View details
                      </button>
                    </>
                  ) : (
                    <div className="text-sm text-black/60">Assigning tutors is restricted to Coordinators/Program Admins.</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PendingAssignDetails;