"use client";

import React, { useState, useEffect } from "react";

// 1. Định nghĩa kiểu dữ liệu (phải khớp với dữ liệu trong file lib/mocks của bạn)
type Tutor = {
  id: string | number;
  fullName: string;      // Kiểm tra xem mock của bạn là 'fullName' hay 'name'
  subjects: string[];
  // Cấu trúc availability: { "YYYY-MM-DD": ["09:00-10:00", ...] }
  availability: Record<string, string[]>; 
  bookedSlots: string[];
};

const TutorsAvailability: React.FC = () => {
  // 2. State quản lý dữ liệu từ API
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State quản lý ngày đang chọn
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  // Tạo danh sách ngày giả lập (hoặc lấy dynamic từ hôm nay)
  const availableDates = ["2024-01-15", "2024-01-16", "2024-01-17"];

  // 3. Gọi API khi Component được tải
  useEffect(() => {
    async function fetchTutors() {
      try {
        const res = await fetch("/api/tutors"); // Gọi file route.ts bạn vừa đưa
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        
        // Kiểm tra dữ liệu trên console để chắc chắn nó đúng cấu trúc
        console.log("Data from API:", data); 

        setTutors(data);
      } catch (error) {
        console.error("Error loading tutors:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);

  // Hàm kiểm tra slot đã đặt
  const isSlotBooked = (tutor: Tutor, date: string, slot: string) => {
    // Cần kiểm tra bookedSlots có tồn tại không để tránh lỗi
    return tutor.bookedSlots?.includes(`${date} ${slot}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">
          Tutors availability
        </h1>
        <p className="text-sm text-black/70 mt-1">
          View and manage tutor schedules.
        </p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        {/* Date Selector */}
        <div className="flex items-center gap-4 mb-6">
          <label className="text-sm font-medium text-dark-blue">
            Select date:
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Nội dung chính: Loading hoặc Danh sách */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading tutor list...
          </div>
        ) : (
          <div className="space-y-6">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="border border-soft-white-blue rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {/* Chú ý: dùng tutor.fullName hoặc tutor.name tuỳ vào mock data */}
                    <h3 className="font-medium text-dark-blue">
                      {tutor.fullName || (tutor as any).name} 
                    </h3>
                    <p className="text-sm text-black/70">
                      {tutor.subjects?.join(", ")}
                    </p>
                  </div>
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Schedule session
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-dark-blue mb-2">
                    Available slots on{" "}
                    {new Date(selectedDate).toLocaleDateString()}:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {/* Render slots */}
                    {tutor.availability && tutor.availability[selectedDate] ? (
                      tutor.availability[selectedDate].map((slot) => {
                        const booked = isSlotBooked(tutor, selectedDate, slot);
                        return (
                          <span
                            key={slot}
                            className={`text-xs px-3 py-1 rounded-full border ${
                              booked
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }`}
                          >
                            {slot} {booked ? "(booked)" : ""}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-black/50 italic">
                        No slots available
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {tutors.length === 0 && (
              <p className="text-center text-gray-500">No tutors found.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default TutorsAvailability;