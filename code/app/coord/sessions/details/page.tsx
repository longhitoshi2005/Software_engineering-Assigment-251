"use client";

import React, { useEffect, useState } from "react";

type SessionDetail = {
  id: number;
  student: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  status: string;
  rating: number | null;
  feedback: string | null;
};

export default function SessionDetailsPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionDetail[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        // 👇 SỬA 1: Cập nhật đúng đường dẫn API theo thư mục của bạn
        const res = await fetch("/api/coord/session_details");
        
        if (!res.ok) throw new Error("API Error");

        const data = await res.json();
        
        // 👇 SỬA 2: Đảm bảo không crash nếu data trả về null/undefined
        setSessions(data.sessions || []);
      } catch (error) {
        console.error("Failed to load session details", error);
      } finally {
        // 👇 SỬA 3: Luôn tắt loading
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading session details...</div>
    );

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.status === filter);

  const badge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col gap-6 px-5 py-6">

      {/* HEADER */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-xl font-semibold text-dark-blue">Session Details</h1>
        <p className="text-sm text-black/70">
          View and manage tutoring sessions and logs.
        </p>
      </section>

      {/* CONTROLS */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
             {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-soft-white-blue rounded px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All sessions</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button className="px-4 py-2 bg-light-heavy-blue text-white rounded text-sm hover:bg-blue-800 transition">
            Create session
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {filtered.length === 0 && (
             <p className="text-center text-gray-500 py-4">No sessions found.</p>
          )}

          {filtered.map((s) => (
            <div
              key={s.id}
              className="border border-soft-white-blue rounded-lg p-4 hover:shadow-sm transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="font-medium text-dark-blue">
                      {s.student} <span className="text-gray-400 mx-1">↔</span> {s.tutor}
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                      {s.subject}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${badge(
                        s.status
                      )}`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="text-sm text-black/60 mb-1">
                    📅 {s.date} · ⏰ {s.time}
                  </div>

                  {s.rating && (
                    <div className="text-sm mt-1 text-yellow-600 font-medium">
                      ★ Rating: {s.rating}/5
                    </div>
                  )}

                  {s.feedback && (
                    <p className="text-sm text-black/70 mt-2 italic bg-gray-50 p-2 rounded border border-gray-100">
                      “{s.feedback}”
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm border border-soft-white-blue rounded hover:bg-gray-50 text-gray-600">
                    View
                  </button>

                  {s.status === "scheduled" && (
                    <button className="px-3 py-1 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50">
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
}