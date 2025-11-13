"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { swalSuccess, swalError } from "@/app/lib/swal";
import type { Thread, Reply } from "@/types/forum";
import { mockThreads, mockReplies } from "@/src/mocks/forumData";

export default function ForumThreadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;

  const [threads, setThreads] = useState<Thread[]>(mockThreads);
  const [repliesData, setRepliesData] = useState<Record<number, Reply[]>>(mockReplies);
  const [replyContent, setReplyContent] = useState("");
  const [replyAttachments, setReplyAttachments] = useState<File[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingItem, setReportingItem] = useState<{ type: 'thread' | 'reply', id: number } | null>(null);
  const [replyingToCommentId, setReplyingToCommentId] = useState<number | null>(null);

  const thread = useMemo(() => {
    return threads.find((t) => t.id === Number(threadId));
  }, [threads, threadId]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/student/forum");
    }
  };

  const replies = useMemo(() => {
    return repliesData[Number(threadId)] || [];
  }, [repliesData, threadId]);

  // Organize comments hierarchically
  const organizedComments = useMemo(() => {
    const allComments = replies;
    const topLevelComments = allComments.filter(reply => !reply.parentCommentId);
    const nestedComments = allComments.filter(reply => reply.parentCommentId);

    // Group nested comments by parent
    const commentsByParent: Record<number, Reply[]> = {};
    nestedComments.forEach(comment => {
      if (comment.parentCommentId) {
        if (!commentsByParent[comment.parentCommentId]) {
          commentsByParent[comment.parentCommentId] = [];
        }
        commentsByParent[comment.parentCommentId].push(comment);
      }
    });

    return { topLevelComments, commentsByParent };
  }, [replies]);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !threadId) return;

    // Mock attachment processing
    const mockAttachments = replyAttachments.map((file, index) => ({
      id: `att_reply_${Date.now()}_${index}`,
      type: file.type.startsWith('image/') ? 'image' as const : 'video' as const,
      url: `/mock-${file.name}`,
      filename: file.name,
      size: file.size,
    }));

    const newReply: Reply = {
      id: Date.now(),
      threadId: Number(threadId),
      author: "you",
      role: "student",
      createdAt: "just now",
      content: replyContent,
      attachments: mockAttachments.length > 0 ? mockAttachments : undefined,
      parentCommentId: replyingToCommentId || undefined,
      // Only add voting fields for top-level comments
      ...(replyingToCommentId ? {} : {
        upvotes: 0,
        downvotes: 0,
        userVote: null,
        valueVote: 0,
      }),
    };

    setRepliesData((prev) => ({
      ...prev,
      [Number(threadId)]: [...(prev[Number(threadId)] || []), newReply],
    }));

    // Update reply count
    setThreads((prev) =>
      prev.map((t) =>
        t.id === Number(threadId) ? { ...t, replies: t.replies + 1 } : t
      )
    );

    setReplyContent("");
    setReplyAttachments([]);
    setReplyingToCommentId(null);
  };

  const handleMarkResolved = () => {
    if (!threadId) return;
    setThreads((prev) =>
      prev.map((t) =>
        t.id === Number(threadId) ? { ...t, status: "resolved" as const } : t
      )
    );
  };

  const handleReport = (type: 'thread' | 'reply', id: number) => {
    setReportingItem({ type, id });
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) return;
    // Mock report submission
    await swalSuccess(`Report submitted for ${reportingItem?.type} (ID: ${reportingItem?.id})`);
    setShowReportModal(false);
    setReportReason("");
    setReportingItem(null);
  };

  const handleReplyFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      await swalError('Some files were rejected', 'Only images and videos under 10MB are allowed.');
    }

    setReplyAttachments((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeReplyAttachment = (index: number) => {
    setReplyAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVote = (replyId: number, voteType: 'up' | 'down') => {
    setRepliesData((prev) => {
      const threadId = Number(params.id);
      const currentReplies = prev[threadId] || [];
      
      return {
        ...prev,
        [threadId]: currentReplies.map((reply) => {
          if (reply.id === replyId && !reply.parentCommentId) { // Only allow voting on top-level comments
            const newUserVote = reply.userVote === voteType ? null : voteType;
            let newUpvotes = reply.upvotes || 0;
            let newDownvotes = reply.downvotes || 0;

            // Remove previous vote
            if (reply.userVote === 'up') newUpvotes--;
            if (reply.userVote === 'down') newDownvotes--;

            // Add new vote
            if (newUserVote === 'up') newUpvotes++;
            if (newUserVote === 'down') newDownvotes++;

            return {
              ...reply,
              upvotes: newUpvotes,
              downvotes: newDownvotes,
              userVote: newUserVote,
              valueVote: newUpvotes - newDownvotes,
            };
          }
          return reply;
        }),
      };
    });
  };

  if (!thread) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white border border-black/5 rounded-lg px-5 py-8 text-center">
            <p className="text-sm text-black/70">Thread not found</p>
            <button
              onClick={handleBack}
              className="inline-block mt-4 text-sm font-semibold text-light-heavy-blue hover:underline"
            >
              ← Back to Forum
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <div>
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-light-heavy-blue hover:underline inline-flex items-center gap-1"
          >
            ← Back to Forum
          </button>
        </div>

        {/* Thread Header */}
        <section className="bg-white border border-black/5 rounded-lg p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2 py-0.5 rounded-md bg-soft-white-blue text-dark-blue font-medium text-xs">
                  {thread.course}
                </span>
                {thread.pinned && (
                  <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Pinned
                  </span>
                )}
                {thread.status && (
                  <span
                    className={`text-xs px-2 py-1 rounded-md font-semibold ${
                      thread.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : thread.status === "pending"
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {thread.status}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-semibold text-dark-blue">{thread.title}</h1>
              <p className="text-xs text-black/60 mt-2">
                Asked by {thread.author} · {thread.createdAt} · {thread.replies} replies
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReport('thread', thread.id)}
                className="text-xs px-2 py-1 rounded-md hover:bg-red-50 border border-black/10 text-red-600 transition"
                title="Report this post"
              >
                Report
              </button>
            </div>
          </div>

          {/* Thread Body */}
          {thread.content && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap">
                {thread.content}
              </p>
            </div>
          )}

          {/* Thread Attachments */}
          {thread.attachments && thread.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t border-black/5">
              <h4 className="text-sm font-semibold text-dark-blue mb-3">Attachments</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {thread.attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-black/10 rounded-lg p-3 bg-soft-white-blue/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                        {attachment.type === 'image' ? (
                          <svg className="w-5 h-5 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-blue truncate">{attachment.filename}</p>
                        <p className="text-xs text-black/50">{(attachment.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                      <button
                        onClick={() => window.open(attachment.url, '_blank')}
                        className="text-xs px-2 py-1 rounded bg-light-heavy-blue text-white hover:bg-light-blue transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Reply List */}
        <section className="bg-white border border-black/5 rounded-lg">
          <div className="px-5 py-3 border-b border-black/5">
            <h2 className="text-sm font-semibold text-dark-blue">
              Comments ({replies.length})
            </h2>
          </div>
          <div className="divide-y divide-black/5">
            {organizedComments.topLevelComments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-black/50">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              organizedComments.topLevelComments.map((comment) => (
                <div key={comment.id}>
                  {/* Top-level comment */}
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      {/* Vote buttons for top-level comments */}
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <button
                          onClick={() => handleVote(comment.id, 'up')}
                          className={`w-8 h-8 rounded flex items-center justify-center transition ${
                            comment.userVote === 'up'
                              ? 'bg-orange-100 text-orange-600'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Upvote"
                        >
                          ▲
                        </button>
                        <span className="text-xs font-medium text-dark-blue min-w-[20px] text-center">
                          {comment.valueVote || 0}
                        </span>
                        <button
                          onClick={() => handleVote(comment.id, 'down')}
                          className={`w-8 h-8 rounded flex items-center justify-center transition ${
                            comment.userVote === 'down'
                              ? 'bg-blue-100 text-blue-600'
                              : 'hover:bg-gray-100 text-gray-400'
                          }`}
                          title="Downvote"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-dark-blue">
                            {comment.author}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                              comment.role === "tutor"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : comment.role === "coordinator"
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-soft-white-blue text-dark-blue"
                            }`}
                          >
                            {comment.role}
                          </span>
                          <span className="text-xs text-black/50">{comment.createdAt}</span>
                          <button
                            onClick={() => setReplyingToCommentId(comment.id)}
                            className="text-xs px-2 py-0.5 rounded-md hover:bg-blue-50 border border-black/10 text-blue-600 transition"
                            title="Reply to this comment"
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => handleReport('reply', comment.id)}
                            className="text-xs px-2 py-0.5 rounded-md hover:bg-red-50 border border-black/10 text-red-600 transition ml-auto"
                            title="Report this comment"
                          >
                            Report
                          </button>
                        </div>
                        <p className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap">
                          {comment.content}
                        </p>

                        {/* Comment Attachments */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {comment.attachments.map((attachment) => (
                              <div key={attachment.id} className="inline-block border border-black/10 rounded-lg p-2 bg-soft-white-blue/30 mr-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
                                    {attachment.type === 'image' ? (
                                      <svg className="w-3 h-3 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-dark-blue truncate">{attachment.filename}</p>
                                  </div>
                                  <button
                                    onClick={() => window.open(attachment.url, '_blank')}
                                    className="text-xs px-2 py-0.5 rounded bg-light-heavy-blue text-white hover:bg-light-blue transition"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested replies */}
                  {organizedComments.commentsByParent[comment.id] && (
                    <div className="ml-12 border-l-2 border-gray-200 pl-4 space-y-3">
                      {organizedComments.commentsByParent[comment.id].map((nestedReply) => (
                        <div key={nestedReply.id} className="px-5 py-3 bg-gray-50 rounded-lg">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-dark-blue">
                                  {nestedReply.author}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                                    nestedReply.role === "tutor"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : nestedReply.role === "coordinator"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-soft-white-blue text-dark-blue"
                                  }`}
                                >
                                  {nestedReply.role}
                                </span>
                                <span className="text-xs text-black/50">{nestedReply.createdAt}</span>
                                <button
                                  onClick={() => handleReport('reply', nestedReply.id)}
                                  className="text-xs px-2 py-0.5 rounded-md hover:bg-red-50 border border-black/10 text-red-600 transition ml-auto"
                                  title="Report this reply"
                                >
                                  Report
                                </button>
                              </div>
                              <p className="text-sm text-black/80 leading-relaxed whitespace-pre-wrap">
                                {nestedReply.content}
                              </p>

                              {/* Nested reply attachments */}
                              {nestedReply.attachments && nestedReply.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {nestedReply.attachments.map((attachment) => (
                                    <div key={attachment.id} className="inline-block border border-black/10 rounded-lg p-2 bg-white mr-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
                                          {attachment.type === 'image' ? (
                                            <svg className="w-2.5 h-2.5 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                          ) : (
                                            <svg className="w-2.5 h-2.5 text-dark-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-dark-blue truncate">{attachment.filename}</p>
                                        </div>
                                        <button
                                          onClick={() => window.open(attachment.url, '_blank')}
                                          className="text-xs px-2 py-0.5 rounded bg-light-heavy-blue text-white hover:bg-light-blue transition"
                                        >
                                          View
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Reply Form */}
        <section className="bg-white border border-black/5 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-dark-blue">
              {replyingToCommentId ? 'Add a reply' : 'Add a comment'}
            </h2>
            {replyingToCommentId && (
              <button
                onClick={() => setReplyingToCommentId(null)}
                className="text-xs px-2 py-1 rounded-md hover:bg-gray-100 border border-black/10 text-gray-600 transition"
              >
                Cancel reply
              </button>
            )}
          </div>
          {replyingToCommentId && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                Replying to comment by {replies.find(r => r.id === replyingToCommentId)?.author}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmitReply} className="flex flex-col gap-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={replyingToCommentId ? "Write your reply..." : "Write your comment..."}
              rows={4}
              className="rounded-lg bg-soft-white-blue border border-black/10 px-3 py-2 text-sm outline-none focus:border-light-light-blue focus:bg-white transition"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-dark-blue">Attachments (optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleReplyFileSelect}
                  className="text-xs"
                />
              </div>
              {replyAttachments.length > 0 && (
                <div className="space-y-1">
                  {replyAttachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs bg-soft-white-blue px-2 py-1 rounded">
                      <span className="truncate">{file.name}</span>
                      <span className="text-black/50">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                      <button
                        onClick={() => removeReplyAttachment(index)}
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
                {replyingToCommentId ? 'Post Reply' : 'Post Comment'}
              </button>
            </div>
          </form>
        </section>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Report Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black/70 mb-2">
                    Reason for reporting:
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Please explain why you're reporting this content..."
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
                      setReportingItem(null);
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
      </div>
    </div>
  );
}