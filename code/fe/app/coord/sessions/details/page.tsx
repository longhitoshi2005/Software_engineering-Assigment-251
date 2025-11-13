"use client";

import React, { useState, useMemo } from "react";

const SessionDetails: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const sessions = useMemo(() => [
    {
      id: 1,
      student: "Alice Johnson",
      tutor: "Dr. Smith",
      subject: "Calculus",
      date: "2024-01-15",
      time: "14:00-15:00",
      status: "completed",
      rating: 5,
      feedback: "Great session, very helpful!"
    },
    {
      id: 2,
      student: "Bob Wilson",
      tutor: "Prof. Davis",
      subject: "Physics",
      date: "2024-01-15",
      time: "16:00-17:00",
      status: "scheduled",
      rating: null,
      feedback: null
    },
    {
      id: 3,
      student: "Carol Brown",
      tutor: "Ms. Johnson",
      subject: "Chemistry",
      date: "2024-01-14",
      time: "10:00-11:00",
      status: "cancelled",
      rating: null,
      feedback: null
    },
    {
      id: 4,
      student: "David Lee",
      tutor: "Dr. Chen",
      subject: "Biology",
      date: "2024-01-16",
      time: "13:00-14:00",
      status: "scheduled",
      rating: null,
      feedback: null
    },
  ], []);

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return sessions;
    return sessions.filter(session => session.status === statusFilter);
  }, [sessions, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Session details</h1>
        <p className="text-sm text-black/70 mt-1">View and manage individual tutoring sessions.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="all">All sessions</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
            Schedule session
          </button>
        </div>

        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-dark-blue">
                      {session.student} ↔ {session.tutor}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {session.subject}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-black/60 mb-2">
                    <span>{session.date}</span>
                    <span>{session.time}</span>
                  </div>
                  {session.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <span>Rating: {session.rating}/5</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < session.rating! ? "text-yellow-400" : "text-gray-300"}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {session.feedback && (
                    <p className="text-sm text-black/70 mt-2 italic">&ldquo;{session.feedback}&rdquo;</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-soft-white-blue rounded hover:bg-gray-50">
                    View details
                  </button>
                  {session.status === "scheduled" && (
                    <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                      Cancel
                    </button>
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

export default SessionDetails;