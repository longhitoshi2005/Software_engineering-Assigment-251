"use client";

import React, { useMemo, useState } from "react";

import { STUDENTS, TUTORS, type Student, type Tutor } from '@/app/lib/mocks';

const ManualMatch: React.FC = () => {
  const [form, setForm] = useState({ studentId: "", tutorId: "", course: "", reason: "", slot: "" });
  const student = useMemo(() => STUDENTS.find((s) => s.id === form.studentId), [form.studentId]);
  const tutor = useMemo(() => TUTORS.find((t) => t.id === form.tutorId), [form.tutorId]);
  const [assigned, setAssigned] = useState<Record<string, unknown> | null>(null);

  const handleAssign = () => {
    if (!form.studentId || !form.tutorId || !form.reason) {
      // simple feedback in UI flow
      window.alert("Please provide required fields (student, tutor, reason)");
      return;
    }
    const record = { ...form, id: `MAN-${Date.now()}` };
    setAssigned(record);
    // TODO: call API + log
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">Manual Match</h1>
        <p className="text-sm text-black/70 mt-1 max-w-3xl">Create a tutor–student pairing manually when AI matching fails. Reason is required and will be logged. (FR-MAT.04)</p>
      </header>

      <main className="max-w-5xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-6">
        <section className="bg-white rounded-lg border border-black/5 p-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Student ID</label>
            <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" placeholder="e.g. 2352525" />
            <p className="text-[0.7rem] text-black/40 mt-1">Type student ID to auto-fill.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-blue mb-1">Tutor ID</label>
            <input value={form.tutorId} onChange={(e) => setForm({ ...form, tutorId: e.target.value })} className="w-full border border-black/10 rounded-md px-3 py-2 text-sm" placeholder="e.g. t-1" />
            <p className="text-[0.7rem] text-black/40 mt-1">Type tutor ID to auto-fill.</p>
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
            <button onClick={handleAssign} className="bg-light-heavy-blue text-white px-4 py-2 rounded-md">Assign Now</button>
            <button onClick={() => setForm({ studentId: "", tutorId: "", course: "", reason: "", slot: "" })} className="bg-white border border-black/10 px-4 py-2 rounded-md">Reset</button>
          </div>
        </section>

        <aside className="bg-white rounded-lg border border-black/5 p-4">
          <h2 className="text-sm font-semibold text-dark-blue">Auto-fill preview</h2>
          <div className="bg-soft-white-blue/40 border border-black/5 rounded-md p-3 mt-3 space-y-2">
            <div>
              <p className="text-[0.7rem] font-semibold">Student</p>
              <p className="text-sm">{student ? `${student.id} — ${student.name}` : "—"}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold">Tutor</p>
              <p className="text-sm">{tutor ? `${tutor.id} — ${tutor.name}` : "—"}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold">Course</p>
              <p className="text-sm">{form.course || "—"}</p>
            </div>
            <div>
              <p className="text-[0.7rem] font-semibold">Slot suggestion</p>
              <p className="text-sm">{form.slot || "—"}</p>
            </div>
          </div>

          {assigned && (
            <div className="mt-4 bg-emerald-50 border border-emerald-100 p-3 rounded-md">
              <p className="text-sm font-semibold text-dark-blue">Assigned</p>
              <pre className="text-xs text-black/70 mt-2">{JSON.stringify(assigned, null, 2)}</pre>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
};

export default ManualMatch;