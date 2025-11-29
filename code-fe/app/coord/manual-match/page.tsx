"use client";

import React, { useMemo, useState, useEffect } from "react";

import { STUDENTS, TUTORS, type Student, type Tutor } from '@/lib/mocks';
import ComboBox from '@/components/coord/ComboBox';
import type { RankedTutor } from '@/types/matching';

const ManualMatch: React.FC = () => {
  // Read query params from window.location to avoid Next.js suspense requirement for useSearchParams

  const [form, setForm] = useState({ studentId: "", tutorId: "", course: "", reason: "", slot: "" });
  const [tutorSearch, setTutorSearch] = useState("");
  const student = useMemo(() => STUDENTS.find((s) => s.id === form.studentId), [form.studentId]);
  const tutor = useMemo(() => TUTORS.find((t) => t.id === form.tutorId), [form.tutorId]);
  const [assigned, setAssigned] = useState<Record<string, unknown> | null>(null);
  const [suggestionContext, setSuggestionContext] = useState<any | null>(null);
  const [previewedTutor, setPreviewedTutor] = useState<Tutor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // compute ranked tutors based on selected student/course or suggestionContext
  const rankedTutors: RankedTutor[] = useMemo(() => {
    const studentReq = suggestionContext?.request?.course || form.course || "";
    const note = (suggestionContext?.request?.note || "").toString().toLowerCase();
    // helper: score expertise match
    function expertiseScore(t: Tutor) {
      if (!t.expertise) return 0;
      const keys = (studentReq + ' ' + note).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      let score = 0;
      for (const k of keys) {
        if (t.expertise.map(e => e.toLowerCase()).some(e => e.includes(k))) score += 0.25;
      }
      return Math.min(score, 0.6);
    }

    function availabilityScore(t: Tutor) {
      try {
        const pref = (suggestionContext?.request?.preferredTime || "").toLowerCase();
        if (!pref || !t.slots || t.slots.length === 0) return 0;
        for (const s of t.slots) {
          if (pref.includes(s.time.split(' ')[0].toLowerCase()) || s.time.toLowerCase().includes(pref.split(' ')[0])) return 0.2;
        }
        return 0;
      } catch (e) { return 0; }
    }

    function workloadScore(t: Tutor) {
      if (!t.workload) return 0;
      const ratio = t.workload.current / Math.max(1, t.workload.max);
      // lower ratio -> higher score
      return Math.max(0, 0.2 * (1 - ratio));
    }

    return TUTORS.map((t) => {
      const e = expertiseScore(t);
      const a = availabilityScore(t);
      const w = workloadScore(t);
      const base = 0.2;
      let score = Math.min(1, base + e + a + w);
      const justifications: string[] = [];
      if (e > 0) justifications.push(`Expertise match (+${Math.round(e*100)}%)`);
      if (a > 0) justifications.push(`Availability overlap`);
      if (w > 0) justifications.push(`Low workload (+${Math.round(w*100)}%)`);
      if (!t.expertise || t.expertise.length === 0) justifications.push("No explicit expertise listed");
      return { tutorId: t.id, tutorName: t.name, matchScore: score, justifications } as RankedTutor;
    }).sort((a,b) => b.matchScore - a.matchScore);
  }, [form.course, suggestionContext]);

  // determine which tutor to show in Inspector: hovered one, or selected one
  const tutorToDisplay = useMemo(() => previewedTutor || tutor, [previewedTutor, tutor]);

  // find match info for the tutorToDisplay
  const displayMatchInfo = useMemo(() => {
    if (!tutorToDisplay) return null;
    return rankedTutors.find((rt) => rt.tutorId === tutorToDisplay.id) ?? null;
  }, [tutorToDisplay, rankedTutors]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const studentIdParam = params.get("studentId");
    const suggestedTutorIdParam = params.get("suggestedTutorId");
    if (studentIdParam) {
      setForm((prev) => ({ ...prev, studentId: studentIdParam }));
    }
    if (suggestedTutorIdParam) {
      setForm((prev) => ({ ...prev, tutorId: suggestedTutorIdParam }));
      const matched = TUTORS.find((t) => t.id === suggestedTutorIdParam);
      if (matched) setTutorSearch(`${matched.id} — ${matched.name}`);
    }
    // Read suggestion context from sessionStorage (set by Review & Assign flows)
    try {
      const raw = sessionStorage.getItem("suggestionContext");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSuggestionContext(parsed);
        // do not remove automatically; keep it for debugging/audit if needed
      }
    } catch (err) {
      // ignore
    }
    // only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async () => {
    if (!form.studentId || !form.tutorId || !form.reason) {
      // simple feedback in UI flow
      window.alert("Please provide required fields (student, tutor, reason)");
      return;
    }
    // Call the stubbed API to persist the assignment and record audit info.
    const payload = {
      studentId: form.studentId,
      tutorId: form.tutorId,
      course: form.course,
      reason: form.reason,
      slot: form.slot,
      suggestionContext: suggestionContext || null,
    };

    setAssigned(null);
    setIsSubmitting(true);
    // include demo auth headers so server can derive coordinatorId and enforce RBAC
    const headers: Record<string,string> = { 'Content-Type': 'application/json' };
    try {
      const { getClientRole } = await import('@/lib/role');
      const role = getClientRole();
      if (role) headers['x-user-role'] = String(role);
    } catch (e) {}
    try {
      const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
      if (email) headers['x-user-id'] = String(email);
    } catch (e) {}

    fetch('/api/assignments', { method: 'POST', headers, body: JSON.stringify(payload) })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();
        setAssigned(data.record);
        // clear suggestionContext after successful assign to avoid stale per-tab state
        try { sessionStorage.removeItem('suggestionContext'); } catch (e) { /* ignore */ }
      })
      .catch((err) => {
        console.error('Assign error', err);
        window.alert('Failed to persist assignment. See console for details.');
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">

            <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Manual Match
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Create a tutor-student pairing manually when AI matching fails. Reason is required and will be logged.
        </p>
      </header>

      <main className="max-w-5xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
        
        <section className="bg-white rounded-lg border border-black/5 p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Student ID</label>
            <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" placeholder="e.g. 2352525" />
            <p className="text-[0.7rem] text-black/40 mt-1">Type student ID to auto-fill.</p>
          </div>

            <div className="relative">
            <label className="block text-xs font-semibold text-dark-blue mb-1">Tutor (search or select)</label>
            <ComboBox
              rankedTutors={rankedTutors}
              value={tutorSearch}
              onChangeText={(v) => {
                setTutorSearch(v);
                const matched = TUTORS.find((t) => {
                  const name = (t.name ?? "");
                  return `${t.id} — ${name}` === v || String(t.id).toLowerCase() === v.toLowerCase() || name.toLowerCase() === v.toLowerCase();
                });
                if (matched) setForm((p) => ({ ...p, tutorId: String(matched.id) }));
                else setForm((p) => ({ ...p, tutorId: "" }));
              }}
              onSelect={(t) => {
                setForm((p) => ({ ...p, tutorId: String((t as any).id) }));
                setTutorSearch(`${(t as any).id} — ${(t as any).name}`);
              }}
            />
            <p className="text-[0.7rem] text-black/40 mt-1">Type to search tutors or pick from the dropdown. Selection will fill the Tutor field.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Course</label>
            <input value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" placeholder="e.g. CO1001" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Reason (required)</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm min-h-20" />
            <p className="text-[0.7rem] text-black/40 mt-1">Explain why manual match is needed. This is mandatory and will be stored in the audit trail.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Optional slot suggestion</label>
            <input value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" placeholder="e.g. Thu 10:00 — Room B1" />
          </div>

          <div className="flex gap-2">
            <button onClick={handleAssign} disabled={!form.reason || isSubmitting} className="bg-light-heavy-blue text-white px-4 py-2 rounded-md disabled:opacity-50">{isSubmitting ? 'Assigning...' : 'Assign Now'}</button>
            <button onClick={() => setForm({ studentId: "", tutorId: "", course: "", reason: "", slot: "" })} className="bg-white border border-black/10 px-4 py-2 rounded-md">Reset</button>
          </div>
        </section>

        <aside className="bg-white rounded-lg border border-black/5 p-4 space-y-4">
          <h2 className="text-sm font-semibold text-dark-blue">Tutor Inspector</h2>

          {/* Student Context */}
          <div className="bg-soft-white-blue/40 border border-black/5 rounded-md p-3 space-y-2">
            <p className="text-[0.7rem] font-semibold text-dark-blue">Student Request</p>
            {student ? (
              <>
                <p className="text-sm font-medium">{(student as any).name ?? (student as any).fullName ?? student.id} ({student.id})</p>
                <p className="text-xs text-black/70">{(student as any).program ?? ""}</p>
                <p className="text-xs text-black/70 mt-1 font-semibold">Course:</p>
                <p className="text-xs text-black/70">{form.course || suggestionContext?.request?.course || "N/A"}</p>
                <p className="text-xs text-black/70 mt-1 font-semibold">Student Note:</p>
                <p className="text-xs text-black/70 italic">{suggestionContext?.request?.note || "N/A"}</p>
              </>
            ) : (
              <p className="text-sm text-black/40">Type a Student ID to see details.</p>
            )}
          </div>

          {/* Dynamic Tutor Inspector */}
          <div className="bg-soft-white-blue/40 border border-black/5 rounded-md p-3 space-y-2">
            <p className="text-[0.7rem] font-semibold text-dark-blue">Tutor Details (Hover or Select)</p>
            {tutorToDisplay ? (
              <>
                <p className="text-sm font-medium">{tutorToDisplay.name} ({tutorToDisplay.id})</p>
                <p className="text-xs text-black/70">Status: {tutorToDisplay.status}</p>
                <p className="text-xs text-black/70">Workload: {tutorToDisplay.workload?.current ?? "-"} / {tutorToDisplay.workload?.max ?? "-"}</p>
                <p className="text-xs text-black/70 mt-1 font-semibold">Expertise:</p>
                <p className="text-xs text-black/70">{(tutorToDisplay.expertise || []).join(', ') || "N/A"}</p>

                {displayMatchInfo && (
                  <div className="mt-2 pt-2 border-t border-black/10">
                    <p className="text-xs text-black/70 font-semibold">AI Match Score: <span className="text-lg font-bold text-blue-600">{Math.round(displayMatchInfo.matchScore * 100)}%</span></p>
                    <ul className="text-xs text-black/70 list-disc list-inside mt-1">
                      {displayMatchInfo.justifications.map((j, i) => <li key={i}>{j}</li>)}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-black/40">Hover or select a tutor to see details.</p>
            )}
          </div>

          {/* Assignment Preview */}
          {assigned && (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-md">
              <p className="text-sm font-semibold text-dark-blue">Assigned (Mock)</p>
              <pre className="text-xs text-black/70 mt-2">{JSON.stringify(assigned, null, 2)}</pre>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default ManualMatch;