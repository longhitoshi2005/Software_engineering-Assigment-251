"use client";

export default function TutorFeedbackFromStudentsPage() {
  const rows = [
    { id: "F-501", session: "S-1994", student: "23531xx", score: 5, text: "Very clear explanation!", at: "Yesterday" },
    { id: "F-502", session: "S-1990", student: "23529xx", score: 4, text: "Helpful examples.", at: "Oct 31" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Feedback from Students</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Filter by session / score / time.</p>
      </header>

      {/* Feedback Table */}
      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-soft-white-blue">
              <th className="py-2 pr-4 font-semibold text-dark-blue">Session</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Student</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Score</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">Comment</th>
              <th className="py-2 pr-4 font-semibold text-dark-blue">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-b border-soft-white-blue last:border-0">
                <td className="py-3 pr-4">{r.session}</td>
                <td className="py-3 pr-4">{r.student}</td>
                <td className="py-3 pr-4">{r.score}</td>
                <td className="py-3 pr-4">{r.text}</td>
                <td className="py-3 pr-4">{r.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}