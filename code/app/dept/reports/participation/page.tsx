"use client";

export default function Page() {
  const rows = [
    { course: "CO1001", students: 812, covered: "92%", notes: "High usage around midterms" },
    { course: "MA1001", students: 604, covered: "88%", notes: "Improve off-peak slots" },
  ];
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Participation Report</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">Student participation, coverage and trends.</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-soft-white-blue">
              <th className="text-left py-2 px-3">Course</th>
              <th className="text-left py-2 px-3">Participants</th>
              <th className="text-left py-2 px-3">Coverage</th>
              <th className="text-left py-2 px-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.course} className="border-b border-soft-white-blue hover:bg-soft-white-blue/50">
                <td className="py-3 px-3 font-medium text-dark-blue">{r.course}</td>
                <td className="py-3 px-3">{r.students}</td>
                <td className="py-3 px-3">{r.covered}</td>
                <td className="py-3 px-3">{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
