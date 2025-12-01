"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { LocationMode, LocationModeLabels } from "@/types/location";
import { AvailabilitySlot } from "@/types/availability";
import { formatDateWithYear, formatTime, createLocalDateTime } from "@/lib/dateUtils";
import { Trash2, Plus, Calendar, Clock } from "lucide-react";
import { BASE_API_URL } from "@/config/env";

export default function TutorAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // form state
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:30");
  const [newEnd, setNewEnd] = useState("13:00");
  const [selectedModes, setSelectedModes] = useState<LocationMode[]>([LocationMode.ONLINE]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      
      const tutorRes = await fetch(`${BASE_API_URL}/tutors/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
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
        throw new Error("Failed to get tutor profile");
      }
      
      const tutorData = await tutorRes.json();
      
      const availRes = await fetch(`${BASE_API_URL}/availability/${tutorData.id}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!availRes.ok) {
        throw new Error("Failed to load availability");
      }
      
      const backendSlots: AvailabilitySlot[] = await availRes.json();
      setSlots(backendSlots);
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
      const startDateTime = createLocalDateTime(newDate, newStart);
      const endDateTime = createLocalDateTime(newDate, newEnd);

      const response = await fetch(`${BASE_API_URL}/availability/`, {
        method: "POST",
        credentials: "include",
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

      setShowAddModal(false);
      await loadAvailability();
      
      // Reset form
      setNewDate("");
      setNewStart("10:30");
      setNewEnd("13:00");
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

  const handleDeleteSlot = async (slotId: string) => {
    const result = await Swal.fire({
      title: "Delete Availability?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${BASE_API_URL}/availability/${slotId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete slot");
      }

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Availability slot deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      await loadAvailability();
    } catch (error: any) {
      console.error("Error deleting slot:", error);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: error.message || "Could not delete availability slot",
      });
    }
  };

  const toggleMode = (mode: LocationMode) => {
    if (selectedModes.includes(mode)) {
      setSelectedModes(selectedModes.filter(m => m !== mode));
    } else {
      setSelectedModes([...selectedModes, mode]);
    }
  };

  // Convert date format from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateVN = (isoString: string): string => {
    const date = new Date(isoString + 'Z');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDayOfWeek = (isoString: string): string => {
    const date = new Date(isoString + 'Z');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Current Weekly Availability</h1>
            <p className="text-gray-600 mt-1">Manage your available time slots for tutoring sessions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Availability
          </button>
        </div>

        {/* Slots List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {slots.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No availability slots yet</p>
              <p className="text-gray-400 mt-2">
                Click &quot;Add Availability&quot; to create your first slot
                </p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Day</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location Modes</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {slots.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateVN(slot.start_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{getDayOfWeek(slot.start_time)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {slot.allowed_modes.map((mode) => (
                            <span
                              key={mode}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {LocationModeLabels[mode]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {slot.is_booked ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Booked
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete slot"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Availability Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Availability Slot</h2>
            
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date (DD/MM/YYYY)
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Location Modes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location Modes
                </label>
                <div className="space-y-2">
                  {Object.values(LocationMode).map((mode) => (
                    <label
                      key={mode}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModes.includes(mode)}
                        onChange={() => toggleMode(mode)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {LocationModeLabels[mode]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
