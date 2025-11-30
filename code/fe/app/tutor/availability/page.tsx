"use client";

import { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { LocationMode, LocationModeLabels } from "@/types/location";
import { AvailabilitySlot, DaySlot } from "@/types/availability";

export default function TutorAvailabilityPage() {
  const [slots, setSlots] = useState<DaySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // form state - changed to specific date instead of day name
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:30");
  const [newEnd, setNewEnd] = useState("12:00");
  const [selectedModes, setSelectedModes] = useState<LocationMode[]>([LocationMode.ONLINE]);

  // Load current user's availability on mount
  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      // Get current tutor profile to get tutor_id
      const tutorRes = await fetch("http://localhost:8000/tutors/me", {
        method: "GET",
        credentials: "include", // Important: Send cookies with request
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("Tutor response status:", tutorRes.status);
      
      if (!tutorRes.ok) {
        if (tutorRes.status === 401) {
          Swal.fire({
            icon: "error",
            title: "Not Authenticated",
            text: "Please login first",
          });
          window.location.href = "/auth/login";
          return;
        }
        const errorData = await tutorRes.json().catch(() => ({}));
        console.error("Tutor fetch error:", errorData);
        throw new Error(errorData.detail || "Failed to get tutor profile");
      }
      
      const tutorData = await tutorRes.json();
      console.log("Tutor data:", tutorData);
      setCurrentUserId(tutorData.id);
      
      // Get tutor's availability slots
      const availRes = await fetch(`http://localhost:8000/availability/${tutorData.id}`, {
        method: "GET",
        credentials: "include", // Important: Send cookies with request
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      console.log("Availability response status:", availRes.status);
      
      if (!availRes.ok) {
        const errorData = await availRes.json().catch(() => ({}));
        console.error("Availability fetch error:", errorData);
        throw new Error(errorData.detail || "Failed to load availability");
      }
      
      const backendSlots: AvailabilitySlot[] = await availRes.json();
      
      // Convert backend slots to DaySlot format for UI
      const uiSlots: DaySlot[] = backendSlots.map((slot) => {
        const startDate = new Date(slot.start_time);
        const endDate = new Date(slot.end_time);
        
        // Format as "DD/MM/YYYY - Day Name"
        const dayStr = startDate.toLocaleDateString("en-GB", { 
          day: "2-digit", 
          month: "2-digit", 
          year: "numeric",
          weekday: "long"
        });
        
        const startTime = startDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const endTime = endDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        
        return {
          id: `ui-${slot.id}`,
          backendId: slot.id,
          day: dayStr,
          start: startTime,
          end: endTime,
          allowed_modes: slot.allowed_modes,
        };
      });
      
      setSlots(uiSlots);
    } catch (error) {
      console.error("Error loading availability:", error);
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Could not load your availability slots",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Date",
        text: "Please select a date",
      });
      return;
    }
    
    if (newStart >= newEnd) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Time",
        text: "Start time must be before end time",
      });
      return;
    }

    if (selectedModes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Mode",
        text: "Please select at least one location mode",
      });
      return;
    }

    try {
      // Parse selected date
      const targetDate = new Date(newDate);
      
      // Set start time
      const [startHour, startMin] = newStart.split(":").map(Number);
      const startDateTime = new Date(targetDate);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      // Set end time
      const [endHour, endMin] = newEnd.split(":").map(Number);
      const endDateTime = new Date(targetDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      const response = await fetch("http://localhost:8000/availability/", {
        method: "POST",
        credentials: "include", // Important: Send cookies with request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          allowed_modes: selectedModes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create slot");
      }

      Swal.fire({
        icon: "success",
        title: "Slot Added",
        text: "Availability slot created successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      // Reload availability
      await loadAvailability();
      
      // Reset form
      setNewDate("");
      setNewStart("10:30");
      setNewEnd("12:00");
      setSelectedModes([LocationMode.ONLINE]);
    } catch (error: any) {
      console.error("Error creating slot:", error);
      Swal.fire({
        icon: "error",
        title: "Creation Failed",
        text: error.message || "Could not create availability slot",
      });
    }
  };

  // Group slots by date for display
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, DaySlot[]> = {};
    
    slots.forEach((slot) => {
      const dateKey = slot.day; // Already formatted as readable date
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    
    // Sort slots within each date by start time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => (a.start > b.start ? 1 : -1));
    });
    
    return grouped;
  }, [slots]);

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
        {loading ? (
          <div className="bg-white rounded-lg border border-black/5 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-light-blue"></div>
            <p className="mt-3 text-sm text-black/50">Loading availability...</p>
          </div>
        ) : (
        <div className="bg-white rounded-lg border border-black/5 p-4 lg:p-5">
          <h2 className="text-sm font-semibold text-dark-blue mb-3">
            Current Weekly Availability
          </h2>

          {/* display slots grouped by date */}
          <div className="space-y-4">
            {Object.keys(slotsByDate).length === 0 ? (
              <p className="text-sm text-black/40 italic text-center py-8">
                No availability slots created yet. Add your first slot below.
              </p>
            ) : (
              Object.entries(slotsByDate).map(([date, dateSlots]) => (
                <div key={date} className="bg-soft-white-blue/40 rounded-lg border border-black/5 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-dark-blue">{date}</p>
                    <span className="text-[0.6rem] text-black/40">
                      {dateSlots.length} slot(s)
                    </span>
                  </div>

                  <div className="space-y-2">
                    {dateSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex flex-col gap-1 bg-white border border-light-blue/30 border-l-4 border-l-light-blue rounded-md px-2 py-1.5"
                      >
                        <div>
                          <p className="text-xs font-semibold text-black">
                            {slot.start} – {slot.end}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {slot.allowed_modes.map((mode) => (
                              <span
                                key={mode}
                                className="text-[0.6rem] px-1.5 py-0.5 rounded bg-light-blue/10 text-light-heavy-blue border border-light-blue/30"
                              >
                                {LocationModeLabels[mode]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* form thêm slot */}
          <div className="mt-5 pt-4 border-t border-black/5">
            <p className="text-xs font-semibold text-dark-blue mb-3">
              Add new slot
            </p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* date */}
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Don't allow past dates
                className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-light-blue/40"
              />

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

              {/* modes */}
              <div className="border border-black/10 rounded-md px-2 py-2 text-sm bg-white md:col-span-2">
                <p className="text-[0.65rem] text-black/50 mb-1">Location Modes:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(LocationModeLabels).map(([mode, label]) => (
                    <label key={mode} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedModes.includes(mode as LocationMode)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModes([...selectedModes, mode as LocationMode]);
                          } else {
                            setSelectedModes(selectedModes.filter(m => m !== mode));
                          }
                        }}
                        className="w-3 h-3 accent-light-blue"
                      />
                      <span className="text-xs">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* button */}
              <button
                type="button"
                onClick={handleAddSlot}
                className="bg-light-heavy-blue text-white rounded-md text-sm font-semibold px-3 py-2 hover:bg-light-blue transition"
              >
                + Add Slot
              </button>
            </div>

            {/* info bar */}
            <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[0.65rem] text-black/45 max-w-md">
                Your availability slots are saved automatically. Students can only book within these time slots.
              </p>
            </div>
          </div>
        </div>
        )}

        {/* footer mini */}
        <div className="text-center text-[0.65rem] text-black/35 mt-6">
          HCMUT Tutor Support System · FR-SCH.01 Tutor Availability · Synced with Booking
        </div>
      </div>
    </div>
  );
}