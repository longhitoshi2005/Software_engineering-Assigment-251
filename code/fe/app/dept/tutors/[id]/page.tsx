type Profile = { id: string; name: string; bio: string; courses: string[]; rating: string; hours: number };

const DB: Record<string, Profile> = {
  tutor01: { id: "tutor01", name: "Nguyen A", bio: "C/C++ focus; helps freshmen.", courses: ["CO1001","PH1001"], rating: "4.8", hours: 62 },
  tutor02: { id: "tutor02", name: "Tran B", bio: "Calculus and linear algebra.", courses: ["MA1001"], rating: "4.5", hours: 38 },
  tutor03: { id: "tutor03", name: "Le C", bio: "Digital logic and systems.", courses: ["EE2002","CO1001"], rating: "4.7", hours: 70 },
};

export default async function Page({ params }: { params?: Promise<{ id: string }> }) {
  const resolved = params ? (await params) : { id: '' };
  const p = DB[resolved.id] ?? { id: resolved.id, name: resolved.id, bio: "N/A", courses: [], rating: "-", hours: 0 };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-dark-blue">Tutor Profile</h1>
        <p className="text-sm md:text-base text-black/70 mt-1">{p.id}</p>
      </header>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5 space-y-2">
        <div className="text-lg font-semibold text-dark-blue">{p.name}</div>
        <div className="text-sm text-black/70">{p.bio}</div>
        <div className="text-sm">Courses: <span className="text-black/80">{p.courses.join(", ") || "—"}</span></div>
        <div className="text-sm">Rating: <span className="font-semibold">{p.rating}</span></div>
        <div className="text-sm">Accumulated Hours: <span className="font-semibold">{p.hours}h</span></div>
      </section>
    </div>
  );
}
