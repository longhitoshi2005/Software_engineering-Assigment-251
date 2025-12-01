"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";

interface Session {
  id: string;
  start_time: string;
  end_time: string;
}

interface TutorSessionCalendarProps {
  sessions: Session[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function TutorSessionCalendar({
  sessions,
  selectedDate,
  onDateSelect,
}: TutorSessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get all dates that have sessions
  const sessionDates = sessions.map((session) =>
    format(parseISO(session.start_time), "yyyy-MM-dd")
  );

  const hasSession = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return sessionDates.includes(dateStr);
  };

  const getSessionCount = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return sessionDates.filter((d) => d === dateStr).length;
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.25rem' }} className="mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Monday

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const cloneDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isSelected = selectedDate && isSameDay(day, selectedDate);
      const isToday = isSameDay(day, new Date());
      const dayHasSession = hasSession(day);
      const count = getSessionCount(day);

      days.push(
        <button
          key={day.toString()}
          onClick={() => onDateSelect && onDateSelect(cloneDay)}
          disabled={!isCurrentMonth}
          className={`
            relative aspect-square p-1 rounded-lg transition-all
            ${!isCurrentMonth ? "text-gray-300 cursor-not-allowed" : "text-gray-900 hover:bg-gray-100"}
            ${isSelected ? "bg-blue-100 ring-2 ring-blue-500" : ""}
            ${isToday && !isSelected ? "ring-1 ring-blue-300" : ""}
          `}
        >
          <div className="text-sm">
            {format(day, "d")}
          </div>
          {dayHasSession && isCurrentMonth && (
            <div style={{ position: 'absolute', bottom: '0.25rem', left: '50%', transform: 'translateX(-50%)' }}>
              <div style={{ width: '6px', height: '6px', backgroundColor: '#3B82F6', borderRadius: '50%' }} />
            </div>
          )}
        </button>
      );
      day = addDays(day, 1);
    }

    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '0.25rem' }}>{days}</div>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 mt-2">
          Total sessions: {sessions.length}
        </div>
      </div>
    </div>
  );
}
