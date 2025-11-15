"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { swalConfirm, swalSuccess } from "@/src/lib/swal";

type TutorSlot = {
  time: string;
  mode: string;
  remaining?: string;
};

type Tutor = {
  id?: number;
  name: string;
  role?: string;
  subject: string;
  department: string;
  match?: string;
  slots?: TutorSlot[];
  status?: string;
  style?: string;
};

function BookSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mock tutor data - in production this would come from URL params or API
  const [tutor] = useState<Tutor>({
    id: 1,
    name: "Nguyen T. A.",
    role: "Senior student – CSE",
    subject: "CO1001 – Programming Fundamentals",
    department: "Computer Science and Engineering",
    // mode string may contain multiple choices separated by '/' or '·'.
    // Examples: "Online / Campus 1", "Campus 2", "Online"
    slots: [
      { time: "Wed 14:00", mode: "Online / Campus 1", remaining: "2 left" },
      { time: "Fri 09:30", mode: "Campus 2", remaining: "1 left" },
    ],
    style: "Interactive problem-solving with whiteboard examples",
  });

  const [selectedSlot, setSelectedSlot] = useState<string>(
    tutor?.slots?.[0] ? `${tutor.slots[0].time} · ${tutor.slots[0].mode}` : ""
  );
  const [mode, setMode] = useState("");
  const [availableModes, setAvailableModes] = useState<{
    value: string;
    label: string;
  }[]>([]);
  const [note, setNote] = useState("");
  const [hasConflict] = useState(true);

  const handleBack = () => {
    // Prefer a browser back when available, otherwise go to the canonical list
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/student/find-tutor");
    }
  };

  // Redirect if no tutor data (in production)
  useEffect(() => {
    // In production, check if tutor data exists
    // if (!tutor) {
    //   router.replace("/student/find-tutor");
    // }
  }, []);

  // Helper: parse a slot.mode string into mode options
  const parseSlotModes = (modeStr: string) => {
    if (!modeStr) return [] as { value: string; label: string }[];
    // Split on common separators
    const parts = modeStr
      .split("/")
      .flatMap((p) => p.split("·"))
      .map((p) => p.trim())
      .filter(Boolean);

    const modes: { value: string; label: string }[] = [];
    for (const p of parts) {
      const lower = p.toLowerCase();
      if (lower.includes("online")) {
        if (!modes.find((m) => m.value === "online")) {
          modes.push({ value: "online", label: "Online (Meet/Zoom)" });
        }
      } else {
        // treat as offline location / campus / room
        const val = `offline:${p}`;
        if (!modes.find((m) => m.value === val)) {
          modes.push({ value: val, label: `In-person at ${p}` });
        }
      }
    }

    // If nothing parsed, default to both options
    if (modes.length === 0) {
      modes.push({ value: "offline:Campus 1", label: "In-person at Campus 1" });
      modes.push({ value: "online", label: "Online (Meet/Zoom)" });
    }

    return modes;
  };

  // When selectedSlot changes, derive available modes and default mode
  useEffect(() => {
    const slot = tutor.slots?.find((s) => `${s.time} · ${s.mode}` === selectedSlot);
    const modes = slot ? parseSlotModes(slot.mode) : [];
    setAvailableModes(modes);
    setMode(modes[0]?.value ?? "");
  }, [selectedSlot, tutor.slots]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tutor) return;

    // TODO: Add to backend/store
    swalSuccess("Booking submitted", "Tutor will see your request");
    router.push("/student/my-sessions");
  };

  if (!tutor) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-blue font-semibold mb-2">Loading session details...</p>
          <p className="text-sm text-black/60">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      {/* PAGE HEADER */}
      <header className="mb-5">
        <div className="mb-3">
          <button
            onClick={handleBack}
            className="text-sm font-semibold text-light-heavy-blue hover:underline inline-flex items-center gap-1"
          >
            ← Back
          </button>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Book a Session
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Reserve a 1:1 tutoring slot. You&apos;ll get confirmation by email and in
          your dashboard. Rescheduling/cancelling must follow campus rules
          (≥2h before start).
        </p>
      </header>

      {/* LAYOUT 2 COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {/* LEFT: FORM */}
        <section className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6">
          {/* HEADER */}
          <div className="mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-dark-blue">
                Session Details
              </h2>
              <span className="text-[11px] font-medium text-black/50">
                UC-03b · FR-SCH.02
              </span>
            </div>
            <p className="text-xs text-black/60 mt-1">
              Tutor must have published an available slot before booking.
            </p>
          </div>

          {/* TUTOR SUMMARY */}
          <div className="bg-soft-white-blue/70 border border-soft-white-blue rounded-lg p-3 mb-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-dark-blue">
                  {tutor.name}
                </p>
                <p className="text-xs text-black/60">{tutor.subject}</p>
                <p className="text-[11px] text-black/50 mt-1">
                  {tutor.department}
                </p>
              </div>
              <span className="inline-flex items-center rounded-md bg-light-light-blue/10 text-light-light-blue text-[11px] font-semibold px-2 py-[3px] border border-light-light-blue/50">
                Tutor selected
              </span>
            </div>
            <p className="text-[11px] text-black/60 mt-2 italic">
              &quot;{tutor.style || "Tutor's preferred teaching style is not specified."}&quot;
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STUDENT INFO */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                Student Name / ID
              </label>
              <input
                readOnly
                value="Nguyen M. Q. Khanh · 2352525"
                className="w-full rounded-md border border-black/5 bg-soft-white-blue/60 px-3 py-2 text-sm text-black/80 outline-none focus:ring-2 focus:ring-light-light-blue/70"
              />
              <p className="text-[11px] text-black/45 mt-1">
                Synced from HCMUT_DATACORE. You can&apos;t edit this here.
              </p>
            </div>

            {/* SLOT + MODE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Choose Time Slot
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                >
                  {tutor.slots?.map((s: TutorSlot) => {
                    const slotText = `${s.time} · ${s.mode}`;
                    return (
                      <option
                        key={slotText}
                        value={slotText}
                        disabled={s.remaining?.includes("FULL")}
                      >
                        {slotText}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-black/45 mt-1">
                  Only open slots appear here. Full slots are disabled.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-dark-blue block mb-1">
                  Mode
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70"
                >
                  {availableModes.length > 0 ? (
                    availableModes.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))
                  ) : (
                    <>
                      <option>In-person at campus</option>
                      <option>Online (Meet/Zoom)</option>
                    </>
                  )}
                </select>
                <p className="text-[11px] text-black/45 mt-1">
                  Some tutors only accept in-person for lab-heavy subjects.
                </p>
              </div>
            </div>

            {/* NOTE */}
            <div>
              <label className="text-xs font-semibold text-dark-blue block mb-1">
                What do you want to work on?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                placeholder="Example: I need help with recursion and pointer debugging from lab 03..."
                className="w-full rounded-md border border-black/5 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-light-light-blue/70 resize-y"
              />
              <p className="text-[11px] text-black/45 mt-1">
                Tutor will see this message before confirming.
              </p>
            </div>

            {/* CONFLICT WARNING */}
            {hasConflict && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
                <p className="text-xs font-semibold text-amber-700">Heads up</p>
                <p className="text-[11px] text-amber-700/80 mt-1">
                  You already have a session near this time. You can still
                  continue, but system may warn about back-to-back sessions.
                </p>
              </div>
            )}

            {/* CONFIRM BAR */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-black/5">
              <p className="text-[11px] text-black/55 max-w-[360px]">
                By clicking &quot;Request Session&quot;, the system will hold this slot,
                notify the tutor, and send reminders (24h & 1h before).
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-light-blue transition"
              >
                Request Session
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: SUMMARY / POLICY */}
        <aside className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-dark-blue">
                Booking Summary
              </h3>
              <p className="text-[11px] text-black/45">
                Draft · Not submitted
              </p>
            </div>
            <span className="text-[11px] text-black/45">FR-SCH.02</span>
          </div>

          <div className="bg-soft-white-blue/40 rounded-lg p-3 space-y-3 border border-soft-white-blue">
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Tutor</p>
              <p className="text-sm text-black/80">
                {tutor.name}
                <br />
                <span className="text-[11px] text-black/55">
                  {tutor.subject}
                </span>
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">
                Selected slot
              </p>
              <p className="text-sm text-black/80">{selectedSlot}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">Mode</p>
              <p className="text-sm text-black/80">{
                // display label for selected mode when available
                (availableModes.find((m) => m.value === mode)?.label) || mode
              }</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-dark-blue">
                Goal for session
              </p>
              <p className="text-sm text-black/80">
                {note || "— (no note)"}
              </p>
            </div>
          </div>

          <div className="bg-soft-white-blue/10 rounded-lg p-3 border border-dashed border-black/10">
            <p className="text-[11px] font-semibold text-dark-blue mb-1">
              Policy
            </p>
            <ul className="text-[11px] text-black/55 space-y-1 list-disc list-inside">
              <li>Reschedule/cancel ≥ 2h before start.</li>
              <li>System prevents double-booking of the same slot.</li>
              <li>Notifications sent to student & tutor automatically.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function BookSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookSessionContent />
    </Suspense>
  );
}
