"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { swalSuccess, swalConfirm, swalError } from "@/src/lib/swal";
import { LIBRARY_RESOURCES } from "@/src/lib/mocks";
import Link from "next/link";
import QuestionBankViewer from "@/app/components/QuestionBankViewer";
import type { LibraryResource } from "@/src/types";



// Lightweight markdown -> HTML renderer for mock Question Bank content.
function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function mdToHtml(md: string) {
  if (!md) return "";

  // handle fenced code blocks first
  md = md.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre class="bg-gray-900 text-white p-3 rounded overflow-auto"><code>${escapeHtml(code)}</code></pre>`;
  });

  const blocks = md.split(/\n\s*\n/);
  let html = "";

  const inline = (text: string) => {
    // bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // inline code `code`
    text = text.replace(/`([^`]+)`/g, "<code class=\"bg-gray-100 rounded px-1 text-sm\">$1</code>");
    // simple links [text](url)
    text = text.replace(/\[(.*?)\]\((.*?)\)/g, "<a class='text-light-heavy-blue hover:underline' href='$2'>$1</a>");
    return text;
  };

  for (const block of blocks) {
    const b = block.trim();
    if (!b) continue;

    // headings
    const hMatch = b.match(/^(#{1,6})\s+(.*)$/m);
    if (hMatch) {
      const level = Math.min(6, hMatch[1].length);
      const tag = `h${level}`;
      html += `<${tag} class="font-semibold text-dark-blue mt-4 mb-2">${inline(escapeHtml(hMatch[2]))}</${tag}>`;
      continue;
    }

    const lines = b.split(/\n/).map(l => l.trim());
    const isUL = lines.every(l => l.startsWith("- "));
    const isOL = lines.every(l => /^\d+\.\s+/.test(l));

    if (isUL) {
      html += '<ul class="list-disc pl-6 mt-2 space-y-1">';
      for (const li of lines) html += `<li>${inline(escapeHtml(li.replace(/^-\s?/, '')))}</li>`;
      html += '</ul>';
      continue;
    }

    if (isOL) {
      html += '<ol class="list-decimal pl-6 mt-2 space-y-1">';
      for (const li of lines) html += `<li>${inline(escapeHtml(li.replace(/^\d+\.\s?/, '')))}</li>`;
      html += '</ol>';
      continue;
    }

    // paragraphs
    const paragraph = lines.map(l => inline(escapeHtml(l))).join('<br/>');
    html += `<p class="text-sm text-black/80 leading-relaxed mt-2">${paragraph}</p>`;
  }

  return html;
}

export default function ViewLibraryResourcePage() {
  const params = useParams();
  const router = useRouter();
  const [resource, setResource] = useState<LibraryResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [permissionReason, setPermissionReason] = useState("");
  // My library and attachments state (mock)
  const [isInMyLibrary, setIsInMyLibrary] = useState(false);
  const [attachedCourses, setAttachedCourses] = useState<{ id: string; name: string }[]>([]);
  const [showAttachedModal, setShowAttachedModal] = useState(false);
  const availableCourses = [
    { id: 'MA1001', name: 'Calculus I (MA1001)' },
    { id: 'CS3011', name: 'Operating Systems (CS3011)' },
    { id: 'EE2002', name: 'Digital Systems (EE2002)' },
  ];
  const [selectedAttachCourse, setSelectedAttachCourse] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call to fetch resource
    const fetchResource = () => {
      const id = params.id as string;
      const foundResource = LIBRARY_RESOURCES.find((r: any) => r.id === id);

      if (foundResource) {
        setResource(foundResource as LibraryResource);
      } else {
        // Resource not found, redirect to library
        router.push('/student/library');
      }
      setLoading(false);
    };

    fetchResource();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-light-heavy-blue mx-auto"></div>
              <p className="text-sm text-black/60">Loading resource...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 space-y-4">
            <p className="text-lg text-red-600">Resource not found</p>
            <Link
              href="/student/library"
              className="inline-block px-4 py-2 bg-light-heavy-blue text-white rounded hover:bg-light-blue transition"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link
              href="/student/library"
              className="text-sm text-light-heavy-blue hover:text-light-blue transition flex items-center gap-2"
            >
              ← Back to Library
            </Link>
            <h1 className="text-2xl font-semibold text-dark-blue">{resource.title}</h1>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              resource.access === "ALLOWED"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}>
              {resource.access}
            </span>
          </div>
        </div>

        {/* Resource metadata */}
        <div className="bg-white rounded-lg border border-black/5 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-black/50 font-medium">Type</p>
              <p className="text-dark-blue">{resource.type}</p>
            </div>
            <div>
              <p className="text-black/50 font-medium">Department</p>
              <p className="text-dark-blue">{resource.department}</p>
            </div>
            <div>
              <p className="text-black/50 font-medium">Source</p>
              <p className="text-dark-blue">{resource.source}</p>
            </div>
            <div>
              <p className="text-black/50 font-medium">Access</p>
              <p className={`font-medium ${
                resource.access === "ALLOWED" ? "text-green-600" : "text-red-600"
              }`}>
                {resource.access}
              </p>
            </div>
          </div>
        </div>

        {/* Content viewer */}
        <div className="bg-white rounded-lg border border-black/5 overflow-hidden">
          {resource.access === "ALLOWED" ? (
            <div className="p-6">
              {resource.type === "PDF" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark-blue">Document Viewer</h3>
                    <div className="flex items-center gap-2">
                      {isInMyLibrary ? (
                        <button
                          onClick={async () => {
                            const ok = await swalConfirm('Remove from My Library', 'Remove this resource from your library?');
                            if (!ok) return;
                            setIsInMyLibrary(false);
                            setAttachedCourses([]);
                            await swalSuccess('Removed', 'Resource removed from your library (mock).');
                          }}
                          className="px-3 py-1 border rounded-md bg-white text-black text-sm hover:bg-black/5 transition"
                        >
                          Remove from my library
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            setIsInMyLibrary(true);
                            await swalSuccess('Added', 'Resource added to your library (mock).');
                          }}
                          className="px-3 py-1 bg-light-heavy-blue text-white rounded-md text-sm hover:bg-light-blue transition"
                        >
                          Add to my library
                        </button>
                      )}

                      <button
                        onClick={() => setShowAttachedModal(true)}
                        className="px-3 py-1 border rounded-md bg-white text-black text-sm hover:bg-black/5 transition"
                      >
                        Attached({attachedCourses.length})
                      </button>
                    </div>
                  </div>

                  {/* Inline PDF viewer */}
                  <div className="border border-black/10 rounded-lg overflow-hidden">
                    <iframe
                      src="/example.pdf#view=FitH"
                      className="w-full h-[800px] md:h-[900px]"
                      title={resource.title}
                    />
                  </div>
                </div>
                ) : (
                // Render Question Bank with interactive viewer component
                resource.type === "Question Bank" ? (
                  <QuestionBankViewer content={resource.content || ""} />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {resource.content}
                    </pre>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-6">
              {resource.type === "PDF" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-dark-blue">Document Preview</h3>
                      <p className="text-sm text-black/60">First 3 pages only</p>
                    </div>
                    <button
                      onClick={() => setShowPermissionForm(true)}
                      className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
                    >
                      Ask for Permission
                    </button>
                  </div>
                  <div className="border border-black/10 rounded-lg overflow-hidden bg-gray-50">
                    <iframe
                      src="/example.pdf#page=1&zoom=100&view=FitH&pagemode=none"
                      className="w-full h-[400px]"
                      title={resource.title}
                    />
                    <div className="p-3 bg-yellow-50 border-t border-yellow-200">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <span>⚠️</span>
                        This preview shows only the first 3 pages. Request permission to view the complete document.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="text-6xl opacity-50">🔒</div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-dark-blue">Content Restricted</h3>
                    <p className="text-sm text-black/60 max-w-md mx-auto">
                      This content is restricted. Request permission to access.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPermissionForm(true)}
                    className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                  >
                    Ask for Permission
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permission Request Modal */}
        {showPermissionForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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

        {/* Attached courses modal */}
        {showAttachedModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Attached courses</h3>
              <div className="space-y-3">
                {attachedCourses.length > 0 ? (
                  <ul className="space-y-2">
                    {attachedCourses.map((c) => (
                      <li key={c.id} className="flex items-center justify-between border p-2 rounded">
                        <div>
                          <div className="font-semibold text-dark-blue">{c.name}</div>
                          <div className="text-xs text-black/60">Attached to session/course</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const ok = await swalConfirm('Remove attachment', `Remove from ${c.name}?`);
                              if (!ok) return;
                              setAttachedCourses((prev) => prev.filter((x) => x.id !== c.id));
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
                  <p className="text-sm text-black/60">No attachments yet.</p>
                )}

                <div className="pt-3 border-t mt-3">
                  <label className="block text-sm text-black/70 mb-2">Attach to another course</label>
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
                        if (attachedCourses.some((c) => c.id === course.id)) {
                          await swalError('Already attached', 'This resource is already attached to the selected course.');
                          return;
                        }
                        setAttachedCourses((prev) => [...prev, course]);
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
                  <button onClick={() => setShowAttachedModal(false)} className="px-4 py-2 border rounded">Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-black/40 pb-8">
          Resource ID: {resource.id} • Synced with HCMUT_LIBRARY • Data from DATACORE
        </div>
      </div>
    </div>
  );
}