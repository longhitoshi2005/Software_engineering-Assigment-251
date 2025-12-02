"use client";

import React, { useEffect, useState } from "react";

type CoordSession = {
  id: string;
  student: string | null;
  tutor: string | null;
  course: string;
  startTime: string;
  status: string;
  issueFlag: string | null;
};

export default function CoordSessionsPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<CoordSession[]>([]);
  const [success, setSuccess] = useState(false);
  
  // State để lưu thông báo lỗi hệ thống nếu phát hiện data hỏng
  const [dataIntegrityError, setDataIntegrityError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/coord/sessions");
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        const rawList = Array.isArray(data.sessions) ? data.sessions : [];

        // --- LOGIC XỬ LÝ LỖI (DATA INTEGRITY CHECK) ---
        const validSessions: CoordSession[] = [];
        let corruptedCount = 0;

        rawList.forEach((s: any) => {
          // Định nghĩa thế nào là một bản ghi bị hỏng (Missing/Corrupted)
          // Ví dụ: Thiếu tên sinh viên, thiếu tên gia sư, hoặc thời gian không hợp lệ
          const isCorrupted = !s.student || !s.tutor || !s.startTime || isNaN(Date.parse(s.startTime));

          if (isCorrupted) {
            corruptedCount++;
            // 1. Log lỗi vào hệ thống (Console)
            console.error(`[SYSTEM ERROR] Session record missing or corrupted. ID: ${s.id}`, s);
          } else {
            validSessions.push(s);
          }
        });

        // 2. Thông báo cho Coordinator nếu có lỗi
        if (corruptedCount > 0) {
          setDataIntegrityError(
            `Warning: Detected ${corruptedCount} corrupted session record(s). These have been hidden from the list and logged for IT support.`
          );
        }
        // ------------------------------------------------

        setSessions(validSessions);

      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function markResolved(id: string) {
    try {
      const res = await fetch(`/api/coord/sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolveIssue: true }),
      });

      if (!res.ok) throw new Error("Failed");

      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, issueFlag: null } : s))
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (error) {
      alert("Failed to update session.");
    }
  }

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading sessions...</div>
    );

  return (
    <div className="flex flex-col gap-6 px-5 py-6">

      {/* HEADER */}
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-xl font-semibold text-dark-blue">Sessions & Issues</h1>
        <p className="text-sm text-black/70 mt-1">
          Monitor sessions and resolve cancellations or missing logs.
        </p>
      </section>

      {/* --- BANNER THÔNG BÁO LỖI DỮ LIỆU (Chỉ hiện khi có data hỏng) --- */}
      {dataIntegrityError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in">
          <span className="text-red-600 font-bold text-xl">⚠️</span>
          <div>
            <h3 className="text-sm font-bold text-red-800">System Alert</h3>
            <p className="text-sm text-red-700">{dataIntegrityError}</p>
          </div>
        </div>
      )}

      {/* SESSION LIST */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-6 space-y-5">
        {sessions.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            No sessions found.
          </div>
        )}

        {sessions.map((s) => (
          <div
            key={s.id}
            className="border border-soft-white-blue rounded-lg p-4 flex justify-between items-start"
          >
            <div className="flex-1">
              <div className="font-semibold text-dark-blue">
                {s.student} <span className="text-gray-500">({s.id})</span>
              </div>
              <div className="text-sm text-black/70">
                Tutor: {s.tutor} · Course: {s.course}
              </div>
              <div className="text-xs text-black/50 mt-1" suppressHydrationWarning>
                {new Date(s.startTime).toLocaleString()}
              </div>

              {s.issueFlag && (
                <div className="text-xs text-red-600 mt-2 font-medium">
                  Issue: {s.issueFlag}
                </div>
              )}
            </div>

            <div>
              {s.issueFlag ? (
                <button
                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                  onClick={() => markResolved(s.id)}
                >
                  Mark resolved
                </button>
              ) : (
                <div className="text-xs text-gray-400">No issue</div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* SUCCESS OVERLAY */}
      {success && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <p className="text-lg font-semibold text-green-700 text-center">
              Issue resolved!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}