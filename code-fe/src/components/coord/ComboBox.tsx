"use client";

import React, { useState, useEffect } from "react";
import type { Tutor } from "@/lib/mocks";
import type { RankedTutor } from "@/types/matching";

export default function ComboBox({ rankedTutors, value, onChangeText, onSelect, onOptionHover }: {
  // rankedTutors: list of tutors with score & justifications (highest first)
  rankedTutors: RankedTutor[];
  value: string;
  onChangeText: (v: string) => void;
  onSelect: (t: Tutor) => void;
  onOptionHover?: (t: Tutor | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);
  // keep a ref to the latest onOptionHover callback so effects and handlers
  // can call the current function without forcing effect deps to include it.
  const onOptionHoverRef = React.useRef(onOptionHover);
  useEffect(() => {
    onOptionHoverRef.current = onOptionHover;
  }, [onOptionHover]);

  const safeRanked = rankedTutors ?? [];
  const term = (value || "").trim().toLowerCase();
  const filtered = safeRanked.filter((r) => {
    const name = (r.tutorName ?? "").toLowerCase();
    if (!term) return true;
    return (
      r.tutorId.toLowerCase().includes(term) ||
      name.includes(term) ||
      `${r.tutorId} — ${name}`.includes(term)
    );
  }).slice(0, 12);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    // reset highlight when filter changes
    setHighlight(0);
    // notify no hovered option when filter changes
    onOptionHoverRef.current?.(null);
  }, [term]);

  // when highlight changes (keyboard navigation), notify preview update
  useEffect(() => {
    const r = filtered[highlight];
    if (r) onOptionHoverRef.current?.({ id: r.tutorId, name: r.tutorName } as Tutor);
    else onOptionHoverRef.current?.(null);
  }, [highlight, filtered]);

  return (
    <div ref={ref}>
      <input
        type="text"
        value={value}
        onChange={(e) => { onChangeText(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
            setOpen(true);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filtered[highlight]) {
              const r = filtered[highlight];
              onSelect({ id: r.tutorId, name: r.tutorName } as Tutor);
              setOpen(false);
            }
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className="w-full border border-black/10 rounded-md px-3 py-2 text-sm"
        placeholder="Search by tutor name or id"
        aria-autocomplete="list"
      />

      {open && filtered.length > 0 && (
        <ul role="listbox" className="absolute z-40 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto">
          {filtered.map((r, i) => (
            <li
              key={r.tutorId}
              role="option"
              aria-selected={highlight === i}
              onMouseEnter={() => { setHighlight(i); onOptionHoverRef.current?.({ id: r.tutorId, name: r.tutorName } as Tutor); }}
              onMouseDown={(e) => { e.preventDefault(); /* prevent blur before click */ }}
              onMouseLeave={() => { onOptionHoverRef.current?.(null); }}
                onClick={() => {
                // map back to Tutor shape expected by callers
                onSelect({ id: r.tutorId, name: r.tutorName } as Tutor);
                setOpen(false);
                onOptionHoverRef.current?.(null);
              }}
              title={r.justifications.join("; ")}
              className={`px-3 py-2 cursor-pointer ${highlight === i ? 'bg-gray-100' : ''}`}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">{r.tutorId} — {r.tutorName}</div>
                <div className="text-sm text-blue-600 font-semibold">{Math.round(r.matchScore * 100)}%</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
