"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { swalError } from "@/lib/swal";

type FeedbackItem = {
  id: string;
  sessionId: string;
  datetime: string;
  tutorName: string;
  course: string;
  overallRating: number;
  clarity: string;
  status: "SUBMITTED" | "DRAFT" | "EXPIRED";
  submittedAt?: string;
  canEdit: boolean;
};

export default function FeedbackSummaryPage() {
  const router = useRouter();

  // Mock feedback list
  const [feedbackList] = useState<FeedbackItem[]>([
    {
      id: "FBK-001",
      sessionId: "SESS-2025-10-27-1400",
      datetime: "Mon · Oct 27 · 09:00 – 10:30 · C2-301",
      tutorName: "Pham Q. T.",
      course: "Calculus I (MA1001)",
      overallRating: 5,
      clarity: "Very clear",
      status: "SUBMITTED",
      submittedAt: "Oct 28, 10:42 AM",
      canEdit: true,
    },
    {
      id: "FBK-002",
      sessionId: "SESS-2025-10-20-1530",
      datetime: "Mon · Oct 20 · 03:30 – 05:00 · C2-301",
      tutorName: "Nguyen T. L.",
      course: "Operating Systems (CS3011)",
      overallRating: 4,
      clarity: "Mostly clear",
      status: "SUBMITTED",
      submittedAt: "Oct 21, 02:12 PM",
      canEdit: false,
    },
    {
      id: "FBK-003",
      sessionId: "SESS-2025-10-13-1000",
      datetime: "Mon · Oct 13 · 10:00 – 11:30 · C2-301",
      tutorName: "Le D. H.",
      course: "Data Structures (CS2011)",
      overallRating: 3,
      clarity: "Somewhat unclear",
      status: "DRAFT",
      submittedAt: undefined,
      canEdit: true,
    },
    {
      id: "FBK-004",
      sessionId: "SESS-2025-09-30-1400",
      datetime: "Mon · Sep 30 · 02:00 – 03:30 · C2-301",
      tutorName: "Tran V. A.",
      course: "Physics I (PH1001)",
      overallRating: 0,
      clarity: "",
      status: "EXPIRED",
      submittedAt: undefined,
      canEdit: false,
    },
  ]);

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

  const sortedList = useMemo(() => {
    if (!sortBy) return feedbackList;
    const list = [...feedbackList];
    list.sort((a, b) => {
      let va: any = (a as any)[sortBy];
      let vb: any = (b as any)[sortBy];

      // Normalize undefined/null
      if (va === undefined || va === null) va = '';
      if (vb === undefined || vb === null) vb = '';

      // For submittedAt, try parsing date-like strings
      if (sortBy === 'submittedAt') {
        const da = va ? Date.parse(va) : 0;
        const db = vb ? Date.parse(vb) : 0;
        return da - db;
      }

      // numeric
      if (sortBy === 'overallRating') {
        return Number(va) - Number(vb);
      }

      // string compare
      return String(va).localeCompare(String(vb));
    });

    if (sortDir === 'desc') list.reverse();
    return list;
  }, [feedbackList, sortBy, sortDir]);

  const getBadge = (status: FeedbackItem["status"]) => {
    switch (status) {
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center rounded-md bg-green-50 text-green-700 text-[0.65rem] font-semibold px-2 py-1 border border-green-200">
            SUBMITTED
          </span>
        );
      case "DRAFT":
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-700 text-[0.65rem] font-semibold px-2 py-1 border border-amber-200">
            DRAFT
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center rounded-md bg-red-50 text-red-700 text-[0.65rem] font-semibold px-2 py-1 border border-red-200">
            EXPIRED
          </span>
        );
    }
  };

  const handleViewOrEdit = async (item: FeedbackItem) => {
    if (item.status === "EXPIRED") {
      await swalError("This feedback deadline has passed.", "Cannot view or edit.");
      return;
    }
    if (item.status === "DRAFT" || item.canEdit) {
      // Navigate with session params
      router.push(
        `/student/feedback?sessionId=${item.sessionId}&datetime=${encodeURIComponent(
          item.datetime
        )}&course=${encodeURIComponent(item.course)}&tutor=${encodeURIComponent(item.tutorName)}`
      );
    } else {
      // View read-only: open modal with feedback detail
      setSelected(item);
      setModalOpen(true);
    }
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
            View, edit (within 24h), or check the status of your session feedback.
            Expired entries cannot be modified.
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
                  <button className="flex items-center gap-2" onClick={() => toggleSort('sessionId')}>
                    <span>Session</span>
                    {sortBy === 'sessionId' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('tutorName')}>
                    <span>Tutor</span>
                    {sortBy === 'tutorName' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('course')}>
                    <span>Course</span>
                    {sortBy === 'course' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('overallRating')}>
                    <span>Rating</span>
                    {sortBy === 'overallRating' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('clarity')}>
                    <span>Clarity</span>
                    {sortBy === 'clarity' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-dark-blue text-xs">
                  <button className="flex items-center gap-2" onClick={() => toggleSort('status')}>
                    <span>Status</span>
                    {sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
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
              {sortedList.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-black/5 hover:bg-soft-white-blue/30 transition ${
                    idx % 2 === 0 ? "bg-white" : "bg-soft-white-blue/10"
                  }`}
                >
                  {/* Session */}
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold text-dark-blue">
                      {item.sessionId}
                    </p>
                    <p className="text-[0.7rem] text-black/60">{item.datetime}</p>
                  </td>

                  {/* Tutor */}
                  <td className="px-4 py-3 text-xs text-black/80">
                    {item.tutorName}
                  </td>

                  {/* Course */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md bg-light-light-blue/10 text-light-light-blue text-[0.65rem] font-semibold px-2 py-1 border border-light-light-blue/40">
                      {item.course}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 text-xs text-black/80">
                    {item.status === "EXPIRED" ? (
                      <span className="text-black/40">—</span>
                    ) : item.status === "DRAFT" ? (
                      <span className="text-black/40 italic">Not yet</span>
                    ) : (
                      <span className="font-semibold text-dark-blue">
                        {item.overallRating}/5
                      </span>
                    )}
                  </td>

                  {/* Clarity */}
                  <td className="px-4 py-3 text-xs text-black/70">
                    {item.status === "EXPIRED" ? (
                      <span className="text-black/40">—</span>
                    ) : item.status === "DRAFT" ? (
                      <span className="text-black/40 italic">Not yet</span>
                    ) : (
                      item.clarity
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">{getBadge(item.status)}</td>

                  {/* Submitted */}
                  <td className="px-4 py-3 text-xs text-black/60">
                    {item.submittedAt || (
                      <span className="text-black/40">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewOrEdit(item)}
                      disabled={item.status === "EXPIRED"}
                      className={`text-xs font-semibold px-3 py-1 rounded-md border transition ${
                        item.status === "EXPIRED"
                          ? "border-black/10 bg-black/5 text-black/30 cursor-not-allowed"
                          : item.canEdit
                          ? "border-light-heavy-blue/80 bg-light-heavy-blue/10 text-light-heavy-blue hover:bg-light-heavy-blue/20"
                          : "border-black/20 bg-black/5 text-black/70 hover:bg-black/10"
                      }`}
                    >
                      {item.status === "EXPIRED"
                        ? "Expired"
                        : item.status === "DRAFT"
                        ? "Edit Draft"
                        : item.canEdit
                        ? "Edit"
                        : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-soft-white-blue/30 border-t border-black/5 px-4 py-3 text-[0.68rem] text-black/50 space-y-1">
          <p>
            <b>SUBMITTED</b>: You can edit within 24h of submission. After
            that, it becomes read-only.
          </p>
          <p>
            <b>DRAFT</b>: You can saved progress but haven&apos;t submitted. Finish before
            the deadline.
          </p>
          <p>
            <b>EXPIRED</b>: The 24h deadline has passed and you didn&apos;t submit. This
            session is marked as &quot;Feedback Skipped&quot;.
          </p>
        </div>
      </main>

      
      {/* Feedback detail modal */}
      {modalOpen && selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setModalOpen(false); setSelected(null); }} />
          <div className="relative max-w-2xl w-full mx-4 bg-white rounded-xl shadow-lg border p-6 z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-dark-blue">Feedback Detail</h2>
                <p className="text-[0.82rem] text-black/60">Session <b>#{selected.sessionId}</b></p>
              </div>
              <div>
                <button
                  onClick={() => { setModalOpen(false); setSelected(null); }}
                  className="text-sm text-black/50 hover:text-black"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-[0.8rem] text-black/60">Date & time</p>
                <p className="font-semibold text-dark-blue">{selected.datetime}</p>
              </div>
              <div>
                <p className="text-[0.8rem] text-black/60">Tutor</p>
                <p className="font-semibold text-dark-blue">{selected.tutorName}</p>
              </div>
              <div>
                <p className="text-[0.8rem] text-black/60">Course</p>
                <p className="font-semibold text-dark-blue">{selected.course}</p>
              </div>
              <div>
                <p className="text-[0.8rem] text-black/60">Submitted</p>
                <p className="font-semibold text-dark-blue">{selected.submittedAt || '—'}</p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[0.8rem] text-black/60">Overall rating</p>
              <p className="font-semibold text-dark-blue">{selected.overallRating}/5</p>
            </div>

            <div className="mt-4">
              <p className="text-[0.8rem] text-black/60">Clarity</p>
              <p className="text-black/80">{selected.clarity || '—'}</p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => { setModalOpen(false); setSelected(null); }}
                className="rounded-md border px-4 py-2 text-sm bg-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Optionally navigate to the full feedback page (read-only view)
                  setModalOpen(false);
                  router.push(
                    `/student/feedback?sessionId=${selected.sessionId}&datetime=${encodeURIComponent(
                      selected.datetime
                    )}&course=${encodeURIComponent(selected.course)}&tutor=${encodeURIComponent(selected.tutorName)}&readOnly=1`
                  );
                }}
                className="rounded-md bg-light-heavy-blue text-white px-4 py-2 text-sm"
              >
                Open full view
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}
