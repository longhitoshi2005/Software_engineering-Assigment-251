"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { swalSuccess, swalError } from "@/src/lib/swal";
import type { Thread, ForumFilters } from "@/types/forum";
import { mockThreads } from "@/src/lib/mocks";

export default function ForumPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [filters, setFilters] = useState<ForumFilters>({
    course: "ALL",
    status: "ALL",
    q: "",
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [course, setCourse] = useState("CO1001");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showMore, setShowMore] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingThreadId, setReportingThreadId] = useState<number | null>(null);

  // Filter threads
  const filteredThreads = useMemo(() => {
    let result = [...threads];

    // Filter by course
    if (filters.course !== "ALL") {
      result = result.filter((t) => t.course === filters.course);
    }

    // Filter by status
    if (filters.status !== "ALL") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Search by title
    if (filters.q.trim()) {
      const query = filters.q.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(query));
    }

    // Sort: pinned first, then by ID desc
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.id - a.id;
    });

    return result;
  }, [threads, filters]);

  // Pagination
  const displayedThreads = showMore ? filteredThreads : filteredThreads.slice(0, 10);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Mock attachment processing
    const mockAttachments = attachments.map((file, index) => ({
      id: `att_${Date.now()}_${index}`,
      type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
      url: `/mock-${file.name}`,
      filename: file.name,
      size: file.size,
    }));

    const newThread: Thread = {
      id: Date.now(),
      title,
      author: "you",
      authorRole: "student",
      course,
      createdAt: "just now",
      replies: 0,
      status: "open",
      content: content.trim() || undefined,
      attachments: mockAttachments.length > 0 ? mockAttachments : undefined,
    };
    setThreads((prev) => [newThread, ...prev]);
    setTitle("");
    setContent("");
    setAttachments([]);

    // Show success popup
    setShowSuccessPopup(true);
    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 3000);
  };

  const handlePinThread = (id: number) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    );
  };

  const handleReport = (threadId: number) => {
    setReportingThreadId(threadId);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    // Mock report submission
    await swalSuccess(`Report submitted for thread (ID: ${reportingThreadId})`);
    setShowReportModal(false);
    setReportReason("");
    setReportingThreadId(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      await swalError('Some files were rejected', 'Only images and videos under 10MB are allowed.');
    }

    setAttachments(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <section className="bg-white border border-black/5 rounded-lg px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-semibold text-dark-blue">
                Community Forum / Q&A
              </h1>
              <p className="text-sm text-black/70 mt-1">
                Q&A by course, homework questions, study tips. Posts can be moderated by coordinators
                according to community guidelines.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Bar */}
        <section className="bg-white border border-black/5 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-[200px_180px_1fr] gap-3">
            {/* Course filter */}
            <select
              value={filters.course}
              onChange={(e) => setFilters((prev: ForumFilters) => ({ ...prev, course: e.target.value }))}
              className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="ALL">All course</option>
              <option value="CO1001">CO1001</option>
              <option value="MA1001">MA1001</option>
              <option value="EE2002">EE2002</option>
              <option value="PH1001">PH1001</option>
            </select>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev: ForumFilters) => ({ ...prev, status: e.target.value }))}
              className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            >
              <option value="ALL">All status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="pending">Pending</option>
            </select>

            {/* Search */}
            <input
              type="text"
              value={filters.q}
              onChange={(e) => setFilters((prev: ForumFilters) => ({ ...prev, q: e.target.value }))}
              placeholder="Find by title or keyword..."
              className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
          </div>
        </section>

        {/* Create new thread */}
        <section className="bg-white border border-black/5 rounded-lg p-5">
          <h2 className="text-sm font-semibold text-dark-blue mb-3">Create new question</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Question title (e.g., 'CO1001 – segmentation fault error')"
                className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
              />
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
              >
                <option>CO1001</option>
                <option>MA1001</option>
                <option>EE2002</option>
                <option>PH1001</option>
              </select>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed content (optional)..."
              rows={3}
              className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-dark-blue">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="text-xs"
                />
              </div>
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs bg-soft-white-blue px-2 py-1 rounded">
                      <span className="truncate">{file.name}</span>
                      <span className="text-black/50">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 ml-auto"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-black/50">Max 5 files, 10MB each</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#00539a] transition"
              >
                Post Question
              </button>
            </div>
          </form>
        </section>

        {/* Thread List */}
        <section className="bg-white border border-black/5 rounded-lg">
          <div className="px-5 py-3 border-b border-black/5">
            <h2 className="text-sm font-semibold text-dark-blue">
              Question List ({filteredThreads.length})
            </h2>
          </div>
          <ul className="divide-y divide-black/5">
            {displayedThreads.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-black/50">
                No questions found
              </li>
            ) : (
              displayedThreads.map((t) => (
                <li
                  key={t.id}
                  className="px-5 py-4 hover:bg-soft-white-blue/40 transition cursor-pointer"
                  onClick={() => router.push(`/student/forum/${t.id}`)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {t.pinned && (
                          <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pinned
                          </span>
                        )}
                        <h3 className="text-sm font-semibold text-dark-blue">{t.title}</h3>
                      </div>
                      <p className="text-xs text-black/60 mt-1">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-soft-white-blue text-dark-blue font-medium mr-2">
                          {t.course}
                        </span>
                        by {t.author} · {t.createdAt} · {t.replies} replies
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.status && (
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap ${
                            t.status === "resolved"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : t.status === "pending"
                              ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePinThread(t.id);
                        }}
                        className={`text-xs px-2 py-1 rounded-md font-medium transition ${
                          t.pinned
                            ? "bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200"
                            : "hover:bg-soft-white-blue border border-black/10"
                        }`}
                        title={t.pinned ? "Unpin this thread" : "Pin this thread"}
                      >
                        {t.pinned ? "Unpin" : "Pin"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReport(t.id);
                        }}
                        className="text-xs px-2 py-1 rounded-md hover:bg-red-50 border border-black/10 text-red-600 transition"
                        title="Report this thread"
                      >
                        Report
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {!showMore && filteredThreads.length > 10 && (
            <div className="px-5 py-3 border-t border-black/5">
              <button
                onClick={() => setShowMore(true)}
                className="w-full text-sm font-semibold rounded-lg px-4 py-2 border hover:bg-soft-white-blue/70 transition"
                style={{ borderColor: "var(--color-soft-white-blue)", color: "var(--color-medium-light-blue)", background: "var(--color-white)" }}
              >
                Load more ({filteredThreads.length - 10} questions)
              </button>
            </div>
          )}
        </section>

        {/* REPORT MODAL */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Report Thread</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Reason for reporting:
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Please explain why you're reporting this thread..."
                    className="w-full p-3 border border-black/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
                    rows={4}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitReport}
                    disabled={!reportReason.trim()}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={() => {
                      setShowReportModal(false);
                      setReportReason("");
                      setReportingThreadId(null);
                    }}
                    className="px-4 py-2 border border-black/20 text-black/70 rounded hover:bg-black/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm mx-4 animate-slideUp">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-dark-blue">Question posted successfully!</h3>
                  <p className="text-sm text-black/70 mt-1">Your question has been published to the forum.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full bg-light-heavy-blue text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-[#00539a] transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}