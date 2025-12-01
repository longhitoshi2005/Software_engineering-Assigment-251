"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { swalError } from "@/lib/swal";
import { format, parseISO } from "date-fns";
import { parseUTC } from "@/lib/dateUtils";
import FeedbackModal from "@/components/FeedbackModal";
import { BASE_API_URL } from "@/config/env";

type FeedbackItem = {
  id: string;
  session: {
    id: string;
    tutor_name: string;
    course_code: string;
    course_name: string;
    start_time: string;
    end_time: string;
    mode: string;
    location: string | null;
  };
  rating: number;
  comment: string | null;
  created_at: string;
};

export default function FeedbackSummaryPage() {
  const router = useRouter();

  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_API_URL}/feedback/my-feedbacks`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to load feedback");

      const data: FeedbackItem[] = await response.json();
      setFeedbackList(data);
    } catch (error) {
      console.error("Error loading feedback:", error);
      await swalError("Failed to load feedback", "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const getModeLabel = (mode: string) => {
    if (mode === 'ONLINE') return 'Online';
    if (mode === 'CAMPUS_1') return 'Campus 1';
    if (mode === 'CAMPUS_2') return 'Campus 2';
    return mode;
  };

  const sortedList = useMemo(() => {
    if (!sortBy) return feedbackList;
    const list = [...feedbackList];
    list.sort((a, b) => {
      let va: any;
      let vb: any;

      // Handle nested session fields
      if (sortBy === 'tutor') {
        va = a.session.tutor_name;
        vb = b.session.tutor_name;
      } else if (sortBy === 'course') {
        va = `${a.session.course_code} - ${a.session.course_name}`;
        vb = `${b.session.course_code} - ${b.session.course_name}`;
      } else if (sortBy === 'rating') {
        va = a.rating;
        vb = b.rating;
      } else if (sortBy === 'submittedAt') {
        va = a.created_at;
        vb = b.created_at;
      } else {
        va = (a as any)[sortBy];
        vb = (b as any)[sortBy];
      }

      // Normalize undefined/null
      if (va === undefined || va === null) va = '';
      if (vb === undefined || vb === null) vb = '';

      // For dates
      if (sortBy === 'submittedAt') {
        const da = va ? Date.parse(va) : 0;
        const db = vb ? Date.parse(vb) : 0;
        return da - db;
      }

      // numeric
      if (sortBy === 'rating') {
        return Number(va) - Number(vb);
      }

      // string compare
      return String(va).localeCompare(String(vb));
    });

    if (sortDir === 'desc') list.reverse();
    return list;
  }, [feedbackList, sortBy, sortDir]);

  const handleViewFeedback = (item: FeedbackItem) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleFeedbackSaved = () => {
    // Reload feedback list
    loadFeedback();
  };

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            My Feedback Summary
          </h1>
          <p className="text-sm text-black/70 mt-1 max-w-2xl">
            View all feedback you&apos;ve submitted for completed tutoring sessions.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.7rem] text-black/50">
            UC.04 Submit Feedback · FR-FBK.01 · AF3, AF5
          </p>
        </div>
      </header>

      {/* TABLE */}
      <main className="bg-white rounded-xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-soft-white-blue/60 border-b border-black/5">
              <tr>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('datetime')}>
                    <span>Session</span>
                    {sortBy === 'datetime' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('tutor')}>
                    <span>Tutor</span>
                    {sortBy === 'tutor' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('course')}>
                    <span>Course</span>
                    {sortBy === 'course' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('rating')}>
                    <span>Rating</span>
                    {sortBy === 'rating' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('submittedAt')}>
                    <span>Submitted</span>
                    {sortBy === 'submittedAt' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedList.map((item, idx) => {
                const sessionDateTime = format(parseISO(item.session.start_time), "MMM dd, yyyy 'at' hh:mm a");
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-black/5 hover:bg-soft-white-blue/30 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-soft-white-blue/10"
                    }`}
                  >
                    {/* Session */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-dark-blue">
                        {sessionDateTime}
                      </p>
                      <p className="text-[0.7rem] text-black/60">{getModeLabel(item.session.mode)} • {item.session.location || 'N/A'}</p>
                    </td>

                    {/* Tutor */}
                    <td className="px-4 py-3 text-xs text-black/80">
                      {item.session.tutor_name}
                    </td>

                    {/* Course */}
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-light-light-blue/10 text-light-light-blue text-[0.65rem] font-semibold px-2 py-1 border border-light-light-blue/40">
                        {item.session.course_code} - {item.session.course_name}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3 text-xs text-black/80">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const filled = i < item.rating;
                          return (
                            <span
                              key={i}
                              className={`text-base ${
                                filled ? "text-yellow-400" : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          );
                        })}
                        <span className="ml-1 text-gray-700 font-medium">{item.rating}.0</span>
                      </div>
                    </td>

                    {/* Submitted */}
                    <td className="px-4 py-3 text-xs text-black/60">
                      {format(parseISO(item.created_at), "MMM dd, yyyy")}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewFeedback(item)}
                        className="text-xs font-semibold px-3 py-1 rounded-md border transition border-light-heavy-blue/80 bg-light-heavy-blue/10 text-light-heavy-blue hover:bg-light-heavy-blue/20"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-soft-white-blue/30 border-t border-black/5 px-4 py-3 text-[0.68rem] text-black/50 space-y-1">
          <p>
            This page shows all feedback you&apos;ve submitted for completed sessions.
          </p>
          <p>
            Click <b>View</b> to see the full details of your feedback and the associated session.
          </p>
        </div>
      </main>

      
      {/* Feedback Modal */}
      {modalOpen && selected && (
        <FeedbackModal
          sessionId={selected.session.id}
          onClose={closeFeedbackModal}
          onSaved={handleFeedbackSaved}
        />
      )}

    </div>
  );
}