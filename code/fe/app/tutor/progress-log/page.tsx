"use client";

import { useState } from "react";

type TutorSession = {
  id: string;
  studentName: string;
  course: string;
  time: string;
  topic: string;
  status: "completed" | "pending" | "in-progress";
};
import { TUTOR_SESSIONS } from "../../lib/mocks";
import { swalSuccess, swalError } from "@/app/lib/swal"; // ⬅️ dùng cho báo lỗi file (nếu có)

const mockSessions: TutorSession[] = TUTOR_SESSIONS as TutorSession[];

export default function TutorProgressLogPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(mockSessions[0].id);

  const selectedSession = mockSessions.find((s) => s.id === selectedSessionId)!;

  const handleSaveDraft = async () => {
    await swalSuccess("Draft saved", "Your progress log draft has been saved.");
  };

  const handleSubmit = async () => {
    await swalSuccess("Progress Log submitted", "Your progress log has been submitted.");
  };

  /* =======================
     ATTACHMENTS (ONLY EDITED PART)
     - Giới hạn: tối đa 5 file, mỗi file ≤ 10MB
     - Định dạng: .pdf .doc .docx
     - Click vào label sẽ mở picker (không thêm nút mới)
  ======================= */
  const [attachments, setAttachments] = useState<File[]>([]);
  const MAX_FILES = 5;
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPT_EXT = [".pdf", ".doc", ".docx"];

  // dedup theo name+size+lastModified
  const dedup = (arr: File[]) => {
    const seen = new Set<string>();
    return arr.filter((f) => {
      const k = `${f.name}|${f.size}|${f.lastModified}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const isAcceptedExt = (name: string) => {
    const lower = name.toLowerCase();
    return ACCEPT_EXT.some((ext) => lower.endsWith(ext));
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const picked = Array.from(e.target.files || []);
    // reset để có thể chọn lại cùng 1 file lần sau
    e.currentTarget.value = "";

    if (!picked.length) return;

    const valid = picked.filter((f) => isAcceptedExt(f.name) && f.size <= MAX_SIZE);
    if (valid.length !== picked.length) {
      try {
        await swalError?.(
          "Some files were rejected",
          "Only PDF/DOC/DOCX up to 10MB each are allowed."
        );
      } catch {
        alert("Some files were rejected: only PDF/DOC/DOCX ≤10MB each are allowed.");
      }
    }

    setAttachments((prev) => dedup([...prev, ...valid]).slice(0, MAX_FILES));
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };
  /* ======================= */

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-8">
      {/* HEADER */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">Tutor Progress Log</h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          After each tutoring session, record the mentee&apos;s progress. This is visible to
          coordinators and used for department reports.
        </p>
      </header>

      {/* main content */}
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-0 flex flex-col gap-6 lg:flex-row">
        {/* LEFT: list sessions to log */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-3">
          <div className="text-xs font-semibold text-dark-light-blue uppercase tracking-wide">
            Sessions to log
          </div>
          <div className="bg-white rounded-lg border border-black/5 divide-y divide-black/5">
            {mockSessions.map((sess) => {
              const active = sess.id === selectedSessionId;
              return (
                <button
                  key={sess.id}
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`w-full text-left px-3 py-3 transition ${
                    active
                      ? "bg-soft-white-blue/80 border-l-4 border-l-light-heavy-blue"
                      : "hover:bg-soft-white-blue/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-dark-blue">
                      {sess.studentName.split("·")[0]}
                    </span>
                    <span
                      className={`text-[0.65rem] px-2 py-1 rounded-full ${
                        sess.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : sess.status === "in-progress"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {sess.status === "completed"
                        ? "Completed"
                        : sess.status === "in-progress"
                        ? "In progress"
                        : "Pending"}
                    </span>
                  </div>
                  <div className="text-[0.65rem] text-black/50">{sess.course}</div>
                  <div className="text-[0.6rem] text-black/40 mt-1 line-clamp-1">{sess.time}</div>
                </button>
              );
            })}
          </div>

          <div className="text-[0.65rem] text-black/40">
            Tip: this list is usually filtered to &ldquo;sessions in last 48h&rdquo; hoặc
            &ldquo;sessions without log&rdquo;.
          </div>
        </aside>

        {/* RIGHT: form */}
        <main className="flex-1 space-y-5">
          {/* session summary */}
          <div className="bg-white rounded-lg border border-black/5 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-dark-blue">
                  {selectedSession.studentName}
                </h2>
                <p className="text-xs text-black/60">{selectedSession.course}</p>
              </div>
              <div className="text-[0.65rem] text-black/50 text-right">
                Session ID: <span className="font-mono">{selectedSession.id}</span>
              </div>
            </div>
            <div className="text-xs text-black/60">
              {selectedSession.time}
              <br />
              Topic: <span className="text-black/80">{selectedSession.topic}</span>
            </div>
            <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2 text-[0.65rem] text-amber-700">
              Once submitted, this log is visible to coordinator / department. You can edit within
              24h.
            </div>
          </div>

          {/* form */}
          <form className="bg-white rounded-lg border border-black/5 p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* understanding */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-dark-blue">
                  Understanding level
                </label>
                <select className="border border-black/10 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-blue/40">
                  <option>Excellent – fully grasped</option>
                  <option>Good – can apply</option>
                  <option>Fair – needs more practice</option>
                  <option>Poor – struggled</option>
                </select>
                <p className="text-[0.65rem] text-black/40">
                  Used for student progress analytics.
                </p>
              </div>

              {/* engagement */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-dark-blue">Engagement</label>
                <select className="border border-black/10 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-blue/40">
                  <option>Highly engaged</option>
                  <option>Moderate</option>
                  <option>Passive</option>
                  <option>Distracted / Unfocused</option>
                </select>
                <p className="text-[0.65rem] text-black/40">
                  Low engagement can trigger coordinator follow-up.
                </p>
              </div>
            </div>

            {/* summary */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-dark-blue">Session summary</label>
              <textarea
                rows={3}
                defaultValue="Student could trace recursion stack correctly by the end. Needs follow-up on pointer-to-pointer usage."
                className="border border-black/10 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              />
              <p className="text-[0.65rem] text-black/40">
                This will appear in student dashboard + coordinator reports.
              </p>
            </div>

            {/* next plan */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-dark-blue">
                Next recommendation / plan (optional)
              </label>
              <textarea
                rows={2}
                placeholder="Example: practice recursion problems 7–10, review memory model next session."
                className="border border-black/10 rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              />
            </div>

            {/* file upload (FIXED) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-dark-blue">Attach file (optional)</label>

              {/* input ẩn + gắn với label bằng htmlFor để click mở picker */}
              <input
                id="progress-log-attachments"           // <-- liên kết với label
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={onFileChange}                  // <-- handler validate + dedup + limit
              />

              <label
                htmlFor="progress-log-attachments"       // <-- click vào label sẽ trigger input
                className="border border-dashed border-light-blue/70 rounded-md px-4 py-4 text-center text-sm text-light-blue/90 cursor-pointer bg-soft-white-blue/40 hover:bg-soft-white-blue/80 transition"
                title="Upload PDF/DOC/DOCX (max 10MB each, up to 5 files)"
              >
                📎 Click to upload notes or summary files (PDF, DOCX)
              </label>

              {/* danh sách file đã chọn */}
              {attachments.length > 0 && (
                <div className="space-y-1 mt-1">
                  {attachments.map((file, idx) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}-${idx}`}
                      className="flex items-center gap-2 text-xs bg-soft-white-blue px-2 py-1 rounded"
                    >
                      <span className="truncate">{file.name}</span>
                      <span className="text-black/50">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="ml-auto text-red-500 hover:text-red-700"
                        aria-label={`Remove ${file.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <p className="text-[0.65rem] text-black/40">
                    Max {MAX_FILES} files, ≤ {(MAX_SIZE / 1024 / 1024).toFixed(0)}MB each · PDF/DOC/DOCX
                  </p>
                </div>
              )}

              <p className="text-[0.65rem] text-black/40">
                Attach lab notes, summary, or exercise sheets used in this session.
              </p>
            </div>

            {/* action bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5">
              <p className="text-[0.65rem] text-black/40">
                FR-FBK.02 – Progress Recording · Auto-timestamped · Editable 24h
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveDraft()}
                  className="px-3 py-2 rounded-md text-sm bg-white border border-light-blue/40 text-light-blue hover:bg-soft-white-blue/60"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="px-3 py-2 rounded-md text-sm bg-light-heavy-blue text-white hover:bg-light-blue transition"
                >
                  Submit progress log
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      {/* footer mini */}
      <div className="text-center text-[0.65rem] text-black/35 py-6">
        HCMUT Tutor Support System · Tutor Progress Log · Dept-audit enabled
      </div>
    </div>
  );
}
