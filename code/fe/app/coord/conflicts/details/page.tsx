"use client";

import React, { useState, useMemo } from "react";

const ConflictsDetails: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const conflicts = useMemo(() => [
    {
      id: 1,
      type: "Double booking",
      student: "Alice Johnson",
      tutor: "Dr. Smith",
      requestedTime: "2024-01-15 14:00-15:00",
      conflictingSession: "Math tutoring with Bob Wilson",
      status: "resolved",
      resolvedBy: "Coordinator Jane",
      resolution: "Rescheduled Alice's session to 15:00-16:00"
    },
    {
      id: 2,
      type: "Tutor unavailable",
      student: "Charlie Brown",
      tutor: "Prof. Davis",
      requestedTime: "2024-01-16 10:00-11:00",
      conflictingSession: "Tutor on leave",
      status: "pending",
      resolvedBy: null,
      resolution: null
    },
    {
      id: 3,
      type: "Room conflict",
      student: "Diana Prince",
      tutor: "Ms. Johnson",
      requestedTime: "2024-01-17 13:00-14:00",
      conflictingSession: "Room 101 occupied by another session",
      status: "resolved",
      resolvedBy: "Coordinator Mike",
      resolution: "Moved to Room 203"
    },
  ], []);

  const filteredConflicts = useMemo(() => {
    if (statusFilter === "all") return conflicts;
    return conflicts.filter(conflict => conflict.status === statusFilter);
  }, [conflicts, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Conflicts details</h1>
        <p className="text-sm text-black/70 mt-1">View and resolve scheduling conflicts.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="all">All conflicts</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>

          <div className="text-sm text-black/60">
            {filteredConflicts.length} conflict{filteredConflicts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="space-y-4">
          {filteredConflicts.map((conflict) => (
            <div key={conflict.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-dark-blue">
                      {conflict.student} - {conflict.tutor}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {conflict.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(conflict.status)}`}>
                      {conflict.status}
                    </span>
                  </div>

                  <div className="text-sm text-black/70 mb-2">
                    <strong>Requested:</strong> {conflict.requestedTime}
                  </div>

                  <div className="text-sm text-black/70 mb-2">
                    <strong>Conflict:</strong> {conflict.conflictingSession}
                  </div>

                  {conflict.resolution && (
                    <div className="text-sm text-black/70 mb-2">
                      <strong>Resolution:</strong> {conflict.resolution}
                    </div>
                  )}

                  {conflict.resolvedBy && (
                    <div className="text-xs text-black/60">
                      Resolved by {conflict.resolvedBy}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {conflict.status === "pending" && (
                    <>
                      <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                        Resolve
                      </button>
                      <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                        Cancel request
                      </button>
                    </>
                  )}
                  <button className="px-3 py-1 text-sm border border-soft-white-blue rounded hover:bg-gray-50">
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ConflictsDetails;