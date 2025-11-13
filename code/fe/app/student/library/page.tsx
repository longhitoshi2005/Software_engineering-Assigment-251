"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { swalError, swalSuccess, swalConfirm } from "@/app/lib/swal";
import { LIBRARY_RESOURCES, RECENT_SESSIONS, AVAILABLE_COURSES } from "@/app/lib/mocks";

type LibraryResource = {
  id: string;
  title: string;
  type: "PDF" | "Question Bank" | "Slides" | "Internal";
  department: string;
  source: "HCMUT_LIBRARY" | "Tutor Uploaded";
  access: "ALLOWED" | "RESTRICTED";
};

const mockResources: LibraryResource[] = LIBRARY_RESOURCES as LibraryResource[];
const mockRecentSessions = RECENT_SESSIONS;

export default function LibraryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | LibraryResource["type"]>("ALL");
  const [selectedForAttach, setSelectedForAttach] = useState<LibraryResource | null>(null);
  const [attached, setAttached] = useState<
    { resourceId: string; sessionId: string; sessionTitle: string }[]
  >([]);
  const [showAttachedModal, setShowAttachedModal] = useState(false);
  const availableCourses = AVAILABLE_COURSES;
  const [selectedAttachCourse, setSelectedAttachCourse] = useState<string | null>(null);
  const [myLibrary, setMyLibrary] = useState<LibraryResource[]>([]);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [permissionReason, setPermissionReason] = useState("");

  const filtered = mockResources.filter((r) => {
    const okQuery =
      !query ||
      r.title.toLowerCase().includes(query.toLowerCase()) ||
      r.department.toLowerCase().includes(query.toLowerCase());
    const okType = typeFilter === "ALL" ? true : r.type === typeFilter;
    return okQuery && okType;
  });

  const handleAttach = async (resource: LibraryResource) => {
    // nếu restricted thì thôi, mock: chỉ báo
    if (resource.access === "RESTRICTED") {
      await swalError("Access denied by HCMUT_LIBRARY", "Please request access from coordinator.");
      return;
    }
    setSelectedForAttach(resource);
    setShowAttachedModal(true);
  };

  const confirmAttach = (sessionId: string) => {
    if (!selectedForAttach) return;
    const sess = mockRecentSessions.find((s) => s.id === sessionId);
    if (!sess) return;
    setAttached((prev) => [
      {
        resourceId: selectedForAttach.id,
        sessionId: sess.id,
        sessionTitle: sess.title,
      },
      ...prev,
    ]);
    setSelectedForAttach(null);
  };

  const handleAddToMyLibrary = (res: LibraryResource) => {
    setMyLibrary((prev) => {
      if (prev.find((r) => r.id === res.id)) return prev;
      return [{ ...res }, ...prev];
    });
  };

  const handleDeleteMyLibrary = (id: string) => {
    setMyLibrary((prev) => prev.filter((r) => r.id !== id));
  };

  const handleViewMyLibrary = (id: string) => {
    const res = myLibrary.find((r) => r.id === id);
    if (res) {
      // Navigate to viewer page with resource data
      router.push(`/student/library/view/${id}`);
    }
  };

  const handleViewResource = (resource: LibraryResource) => {
    if (resource.access === "RESTRICTED") {
      setShowPermissionForm(true);
    } else {
      router.push(`/student/library/view/${resource.id}`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-5">
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
            Library Resources
          </h1>
          <p className="text-sm text-black/70 mt-1">
            Search official HCMUT materials and attach them to your tutoring sessions.
          </p>
        </header>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN - Main Library */}
        <div className="flex-1 space-y-6">
          {/* SEARCH + FILTER BAR */}
          <div className="bg-white rounded-lg border border-black/5 p-4 flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1">
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Search library
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Calculus I problem set, Digital Systems lab notes..."
                className="w-full border border-black/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-light-light-blue"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as LibraryResource["type"] | "ALL")
                }
                className="border border-black/10 rounded-md px-3 py-2 text-sm bg-white"
              >
                <option value="ALL">All</option>
                <option value="PDF">PDF</option>
                <option value="Question Bank">Question Bank</option>
                <option value="Slides">Slides</option>
                <option value="Internal">Internal</option>
              </select>
            </div>
          </div>

          {/* RESULTS */}
          <div className="space-y-3">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-lg border border-black/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-blue truncate">
                    {res.title}
                  </p>
                  <p className="text-xs text-black/50 flex flex-wrap gap-2">
                    <span>{res.type}</span>
                    <span>· {res.department}</span>
                    <span>· {res.source}</span>
                  </p>
                  <p className="text-[0.65rem] text-black/40">
                    {res.access === "ALLOWED"
                      ? "Access: Allowed – you can attach this to a session."
                      : "Access: Restricted – follow HCMUT_LIBRARY policy."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleViewResource(res)}
                    className="px-3 py-1.5 rounded-md bg-white border border-black/10 text-xs font-medium hover:bg-soft-white-blue"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleAttach(res)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      res.access === "ALLOWED"
                        ? "bg-light-heavy-blue text-white hover:bg-light-blue"
                        : "bg-black/10 text-black/30 cursor-not-allowed"
                    }`}
                  >
                    Attach to session
                  </button>
                  <button
                    onClick={() => handleAddToMyLibrary(res)}
                    className="px-3 py-1.5 rounded-md bg-white border border-black/10 text-xs font-semibold hover:bg-amber-50 hover:border-amber-300 flex items-center gap-1"
                  >
                    Add to My Library
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <p className="text-sm text-black/40 italic">
                No resources match your search / filter.
              </p>
            )}
          </div>

          {/* ATTACHED HISTORY */}
          

          {/* FOOTER NOTE */}
          <p className="text-[0.65rem] text-black/40 text-center pb-8">
            Synced with HCMUT_LIBRARY (mock). Access rules follow university policy.{" "}
            Data from DATACORE + Library integration. Specs: FR-INT.04, UC-06d.
          </p>
        </div>

        {/* RIGHT COLUMN - My Library Panel */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-4 bg-white rounded-lg border border-black/5 p-4 space-y-4 min-h-[120px]">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-dark-blue">My Library</h2>
              <span className="text-xs font-medium text-black/50 bg-soft-white-blue px-2 py-1 rounded">
                {myLibrary.length}
              </span>
            </div>

            {myLibrary.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <div className="text-3xl opacity-50">📚</div>
                <p className="text-sm font-medium text-black/60">My Library is empty</p>
                <p className="text-xs text-black/40">
                  Add resources from the main list using &quot;Add to My Library&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {myLibrary.map((item) => (
                  <div
                    key={item.id}
                    className="bg-soft-white-blue/30 rounded-md p-3 space-y-2 border border-black/5"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-dark-blue line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[0.65rem] text-black/50">
                        <span className="px-1.5 py-0.5 bg-white rounded">{item.type}</span>
                        <span>{item.department}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewMyLibrary(item.id)}
                        className="flex-1 px-2 py-1 rounded text-xs font-medium bg-white border border-black/10 hover:bg-light-heavy-blue hover:text-white hover:border-light-heavy-blue transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteMyLibrary(item.id)}
                        className="px-2 py-1 rounded text-xs font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {attached.length > 0 && (
            <section className="bg-white rounded-lg border border-black/5 p-4 mt-6">
              <h2 className="text-sm font-semibold text-dark-blue mb-2">
                Recently attached
              </h2>
              <ul className="space-y-2">
                {attached.map((a) => (
                  <li key={a.resourceId + a.sessionId} className="text-xs text-black/70">
                    <span className="font-medium">{a.resourceId}</span> →{" "}
                    <span>{a.sessionTitle}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[0.6rem] text-black/40 mt-2">
                These attachments will appear in session summary / progress log so tutors
                and coordinators can review. (Mock)
              </p>
            </section>
          )}
        </div>
      </div>

      {/* ATTACH MODAL */}
      {selectedForAttach && showAttachedModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-semibold text-dark-blue">
              Attached courses for {"\""}{selectedForAttach.title}{"\""}
            </h3>
            <p className="text-xs text-black/60">
              Manage attachments for this resource. You can remove existing attachments
              or attach to another course below.
            </p>

            {/* existing attachments for this resource */}
            <div className="space-y-2">
              {attached.filter(a => a.resourceId === selectedForAttach.id).length > 0 ? (
                <ul className="space-y-2">
                  {attached.filter(a => a.resourceId === selectedForAttach.id).map((a) => (
                    <li key={a.sessionId} className="flex items-center justify-between border p-2 rounded">
                      <div>
                        <div className="font-semibold text-dark-blue">{a.sessionTitle}</div>
                        <div className="text-xs text-black/60">Attached to session/course</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const ok = await swalConfirm('Remove attachment', `Remove from ${a.sessionTitle}?`);
                            if (!ok) return;
                            setAttached((prev) => prev.filter((x) => !(x.resourceId === a.resourceId && x.sessionId === a.sessionId)));
                            await swalSuccess('Removed', 'Attachment removed (mock)');
                          }}
                          className="px-3 py-1 text-sm border rounded text-red-600 bg-white hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-black/60">No attachments yet for this resource.</p>
              )}
            </div>

            <div className="pt-3 border-t mt-3">
              <label className="block text-sm text-black/70 mb-2">Attach to a course/session</label>
              <div className="flex gap-2">
                <select
                  value={selectedAttachCourse || ''}
                  onChange={(e) => setSelectedAttachCourse(e.target.value || null)}
                  className="flex-1 rounded-md border px-3 py-2"
                >
                  <option value="">Select course...</option>
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={async () => {
                    if (!selectedAttachCourse) {
                      await swalError('Select a course', 'Please choose a course to attach.');
                      return;
                    }
                    const course = availableCourses.find((c) => c.id === selectedAttachCourse)!;
                    if (attached.some((c) => c.resourceId === selectedForAttach.id && c.sessionId === course.id)) {
                      await swalError('Already attached', 'This resource is already attached to the selected course.');
                      return;
                    }
                    setAttached((prev) => [{ resourceId: selectedForAttach.id, sessionId: course.id, sessionTitle: course.name }, ...prev]);
                    setSelectedAttachCourse(null);
                    await swalSuccess('Attached', `Resource attached to ${course.name} (mock).`);
                  }}
                  className="px-3 py-2 bg-light-heavy-blue text-white rounded-md"
                >
                  Attach
                </button>
              </div>
            </div>

            <div className="mt-4 text-right">
              <button onClick={() => { setShowAttachedModal(false); setSelectedForAttach(null); }} className="px-4 py-2 border rounded">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSION REQUEST MODAL */}
      {showPermissionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-dark-blue mb-4">Request Access Permission</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-2">
                  Reason for requesting access:
                </label>
                <textarea
                  value={permissionReason}
                  onChange={(e) => setPermissionReason(e.target.value)}
                  placeholder="Please explain why you need access to this resource..."
                  className="w-full p-3 border border-black/20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-light-heavy-blue"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    // Mock function - does nothing currently
                    await swalSuccess("Permission request submitted (mockup)");
                    setShowPermissionForm(false);
                    setPermissionReason("");
                  }}
                  disabled={!permissionReason.trim()}
                  className="flex-1 px-4 py-2 bg-light-heavy-blue text-white rounded hover:bg-light-blue transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowPermissionForm(false);
                    setPermissionReason("");
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
