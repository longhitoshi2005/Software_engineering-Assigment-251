"use client";

export default function TutorSessionsTodayPage() {
  const today = [
    { id: "S-3001", time: "09:00", student: "23531xx", course: "MA1001", room: "C2-301" },
    { id: "S-3002", time: "14:00", student: "23535xx", course: "CO1001", room: "B4-205" },
  ];
  const week = [
    { id: "S-3003", day: "Tue", time: "10:30", course: "CO2002" },
    { id: "S-3004", day: "Thu", time: "13:30", course: "CO2002" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Your Sessions (Today / Week)</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Quick view for upcoming sessions.</p>
      </header>

      {/* Sessions Grid */}
      <section className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">Today</h2>
          <ul className="mt-3 space-y-2">
            {today.map((s) => (
              <li key={s.id} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-sm font-semibold text-dark-blue">{s.time} — {s.course}</div>
                <div className="text-xs text-black/70">Student {s.student} · {s.room}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-soft-white-blue rounded-lg p-5">
          <h2 className="text-base font-semibold text-dark-blue">This week</h2>
          <ul className="mt-3 space-y-2">
            {week.map((s) => (
              <li key={s.id} className="bg-soft-white-blue rounded-lg p-3">
                <div className="text-sm font-semibold text-dark-blue">{s.day} {s.time} — {s.course}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}