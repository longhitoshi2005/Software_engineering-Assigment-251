"use client";

import { useMemo, useState } from "react";

type DayName =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type AvailabilitySlot = {
  id: string;
  day: DayName;
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
  mode: "Online" | "Offline";
};

const ALL_DAYS: DayName[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TutorAvailabilityPage() {
  // mock từ HTML cũ
  const [slots, setSlots] = useState<AvailabilitySlot[]>([
    {
      id: "s1",
      day: "Monday",
      start: "09:00",
      end: "10:30",
      mode: "Offline",
    },
    {
      id: "s2",
      day: "Monday",
      start: "14:00",
      end: "15:30",
      mode: "Online",
    },
    {
      id: "s3",
      day: "Wednesday",
      start: "13:30",
      end: "15:00",
      mode: "Offline",
    },
    {
      id: "s4",
      day: "Friday",
      start: "09:00",
      end: "10:30",
      mode: "Online",
    },
  ]);

  // form state
  const [newDay, setNewDay] = useState<DayName | "">("");
  const [newStart, setNewStart] = useState("10:30");
  const [newEnd, setNewEnd] = useState("12:00");
  const [newMode, setNewMode] = useState<"Online" | "Offline">("Online");

  // check conflict giả lập: trùng thứ 4 (Wednesday) và giao với 13:00–14:00
  const conflictMessage = useMemo(() => {
    if (newDay !== "Wednesday") return "";
    // convert to minutes
    const toMin = (t: string) => {
      const [hh, mm] = t.split(":").map(Number);
      return hh * 60 + mm;
    };
    const NEW_START = toMin(newStart);
    const NEW_END = toMin(newEnd);
    const FIX_START = toMin("13:00");
    const FIX_END = toMin("14:00");

    const overlap = NEW_START < FIX_END && NEW_END > FIX_START;
    return overlap
      ? "Your new slot overlaps with an official hour on Wednesday 13:00–14:00. Please adjust."
      : "";
  }, [newDay, newStart, newEnd]);

  const handleAddSlot = () => {
    if (!newDay) return;
    if (newStart >= newEnd) return;

    const newSlot: AvailabilitySlot = {
      id: `slot-${Date.now()}`,
      day: newDay,
      start: newStart,
      end: newEnd,
      mode: newMode,
    };

    setSlots((prev) => [...prev, newSlot]);
  };

  // group theo day để render giống HTML cũ
  const slotsByDay: Record<DayName, AvailabilitySlot[]> = ALL_DAYS.reduce(
    (acc, d) => {
      acc[d] = [];
      return acc;
    },
    {} as Record<DayName, AvailabilitySlot[]>
  );

  slots.forEach((s) => {
    slotsByDay[s.day].push(s);
  });

  // sort theo giờ
  ALL_DAYS.forEach((d) => {
    slotsByDay[d].sort((a, b) => (a.start > b.start ? 1 : -1));
  });

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 space-y-8">
      {/* HEADER */}
      <header>
        <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">
          Tutor Availability Setup
        </h1>
        <p className="text-sm text-black/70 mt-1 max-w-2xl">
          Manage your weekly availability for tutoring sessions. Students can
            only book in these slots.
        </p>
      </header>

      {/* main */}
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6">
        <div className="bg-white rounded-lg border border-black/5 p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-dark-blue mb-3">
            Current Weekly Availability
          </h2>

          {/* grid ngày */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_DAYS.slice(0, 5).map((day) => (
              <div key={day} className="bg-soft-white-blue/40 rounded-lg border border-black/5 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-dark-blue">{day}</p>
                  <span className="text-[0.6rem] text-black/40">
                    {slotsByDay[day].length} slot(s)
                  </span>
                </div>

                {slotsByDay[day].length === 0 ? (
                  <p className="text-[0.7rem] text-black/40 italic">
                    No slots for this day
                  </p>
                ) : (
                  <div className="space-y-2">
                    {slotsByDay[day].map((slot) => (
                      <div
                        key={slot.id}
                        className={`flex items-center justify-between gap-3 bg-white border rounded-md px-2 py-1.5 ${
                          slot.mode === "Online"
                            ? "border-light-blue border-l-4"
                            : "border-dark-blue border-l-4"
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold text-black">
                            {slot.start} – {slot.end}
                          </p>
                          <p className="text-[0.6rem] text-black/50">
                            {slot.mode}
                          </p>
                        </div>
                        {/* sau này có thể thêm nút xóa */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* form thêm slot */}
          <div className="mt-5 pt-4 border-t border-black/5">
            <p className="text-xs font-semibold text-dark-blue mb-3">
              Add new slot
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* day */}
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value as DayName | "")}
                className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              >
                <option value="">Day</option>
                {ALL_DAYS.slice(0, 5).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* start */}
              <input
                type="time"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              />

              {/* end */}
              <input
                type="time"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              />

              {/* mode */}
              <select
                value={newMode}
                onChange={(e) =>
                  setNewMode(e.target.value as "Online" | "Offline")
                }
                className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
              </select>

              {/* button */}
              <button
                type="button"
                onClick={handleAddSlot}
                className="bg-light-heavy-blue text-white rounded-md text-sm font-semibold px-3 py-2 hover:bg-light-blue transition"
              >
                + Add Slot
              </button>
            </div>

            {/* cảnh báo conflict */}
            {conflictMessage && (
              <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-[0.7rem] text-red-700">
                <b>Conflict detected:</b> {conflictMessage}
              </div>
            )}

            {/* save bar */}
            <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.65rem] text-black/45 max-w-md">
                Your changes will be synchronized with HCMUT_DATACORE.
                Students will only see available slots not conflicting with your
                official timetable.
              </p>
              <button
                type="button"
                className="bg-dark-blue text-white rounded-md text-sm font-semibold px-4 py-2 hover:bg-dark-light-blue transition"
              >
                Save availability
              </button>
            </div>
          </div>
        </div>

        {/* footer mini */}
        <div className="text-center text-[0.65rem] text-black/35 mt-6">
          HCMUT Tutor Support System · FR-SCH.01 Tutor Availability · Synced with Booking
        </div>
      </div>
    </div>
  );
}