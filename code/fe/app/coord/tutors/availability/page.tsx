"use client";

import React, { useState, useMemo } from "react";

const TutorsAvailability: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  const tutors = useMemo(() => [
    {
      id: 1,
      name: "Dr. Sarah Smith",
      subjects: ["Mathematics", "Physics"],
      availability: {
        "2024-01-15": ["09:00-10:00", "14:00-15:00", "16:00-17:00"],
        "2024-01-16": ["10:00-11:00", "15:00-16:00"],
        "2024-01-17": ["08:00-09:00", "13:00-14:00", "17:00-18:00"],
      } as Record<string, string[]>,
      bookedSlots: ["2024-01-15 14:00-15:00"]
    },
    {
      id: 2,
      name: "Prof. Michael Johnson",
      subjects: ["Chemistry", "Biology"],
      availability: {
        "2024-01-15": ["11:00-12:00", "15:00-16:00"],
        "2024-01-16": ["09:00-10:00", "14:00-15:00", "16:00-17:00"],
        "2024-01-17": ["10:00-11:00", "15:00-16:00"],
      } as Record<string, string[]>,
      bookedSlots: ["2024-01-16 14:00-15:00"]
    },
    {
      id: 3,
      name: "Ms. Emily Davis",
      subjects: ["English", "History"],
      availability: {
        "2024-01-15": ["13:00-14:00", "17:00-18:00"],
        "2024-01-16": ["11:00-12:00", "16:00-17:00"],
        "2024-01-17": ["09:00-10:00", "14:00-15:00"],
      } as Record<string, string[]>,
      bookedSlots: [] as string[]
    },
  ], []);

  const availableDates = ["2024-01-15", "2024-01-16", "2024-01-17"];

  const isSlotBooked = (tutor: any, date: string, slot: string) => {
    return tutor.bookedSlots.includes(`${date} ${slot}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Tutors availability</h1>
        <p className="text-sm text-black/70 mt-1">View and manage tutor schedules.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-dark-blue">Select date:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          {tutors.map((tutor) => (
            <div key={tutor.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-dark-blue">{tutor.name}</h3>
                  <p className="text-sm text-black/70">{tutor.subjects.join(", ")}</p>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Schedule session
                </button>
              </div>

              <div>
                <h4 className="text-sm font-medium text-dark-blue mb-2">Available slots on {new Date(selectedDate).toLocaleDateString()}:</h4>
                <div className="flex flex-wrap gap-2">
                  {tutor.availability[selectedDate]?.map((slot) => {
                    const booked = isSlotBooked(tutor, selectedDate, slot);
                    return (
                      <span
                        key={slot}
                        className={`text-xs px-3 py-1 rounded-full ${
                          booked
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {slot} {booked ? "(booked)" : "(available)"}
                      </span>
                    );
                  }) || (
                    <span className="text-xs text-black/60">No availability</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TutorsAvailability;