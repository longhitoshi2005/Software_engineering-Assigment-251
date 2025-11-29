type Profile = { id: string; name: string; major: string; history: { session: string; course: string; result: string }[] };

const DB: Record<string, Profile> = {
  "2352525": {
    id: "2352525",
    name: "Khanh",
    major: "CSE",
    history: [
      { session: "S-2101", course: "CO1001", result: "Completed; improved pointers" },
      { session: "S-2050", course: "PH1001", result: "Follow-up suggested" },
    ],
  },
  "2353001": {
    id: "2353001",
    name: "Minh",
    major: "CSE",
    history: [
      { session: "S-2102", course: "MA1001", result: "Pending confirmation" },
    ],
  },
};

export default async function Page({ params }: { params?: Promise<{ id: string }> }) {
  const resolved = params ? (await params) : { id: '' };
  const s = DB[resolved.id] ?? { id: resolved.id, name: resolved.id, major: "-", history: [] };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Student Profile</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">{s.id}</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-2">
        <div className="text-lg font-semibold text-dark-blue">{s.name}</div>
        <div className="text-sm text-black/70">Major: {s.major}</div>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue mb-2">Session History</h2>
        {s.history.length === 0 ? (
          <div className="text-sm text-black/60">No records.</div>
        ) : (
          <ul className="space-y-2 text-sm">
            {s.history.map((h, i)=>(
              <li key={i} className="p-3 border border-soft-white-blue rounded bg-soft-white-blue/50">
                <div className="font-medium text-dark-blue">{h.session}</div>
                <div className="text-black/70">{h.course} · {h.result}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
