import Link from "next/link";
import Image from "next/image";
import BackButton from "@/components/BackButton";
import TUTORS from "@/lib/tutors";
type Feedback = { id: number; rating: number; comment: string; date: string };

export default function TutorProfilePage(props: any) {
  // Use a loose `props: any` to avoid generated Next.js type mismatches between
  // Promise-wrapped PageProps and plain params during the build-time type checks.
  // At runtime we still read params.id as before.
  const id = String(props?.params?.id);
  const tutor = TUTORS.find((t) => t.id === id);

  if (!tutor) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-blue font-semibold mb-2">Tutor not found</p>
          <p className="text-sm text-black/60">The tutor profile you requested does not exist.</p>
          <div className="mt-4">
            <Link href="/student/find-tutor" className="text-light-heavy-blue underline">
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-soft-white-blue px-4 py-6 md:px-8">
      <div className="mb-3">
        <BackButton />
      </div>
      <header className="mb-4 flex items-center gap-4">
        {tutor.image && (
          <Image src={tutor.image} alt={`${tutor.fullName || tutor.name} avatar`} width={80} height={80} className="w-20 h-20 rounded-full object-cover" />
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-dark-blue">{tutor.fullName || tutor.name}</h1>
          <p className="text-sm text-black/70 mt-1">{tutor.role} · {tutor.subject}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        <section className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold text-dark-blue">Core information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] text-black/60">Full name</p>
              <p className="text-sm text-black/80">{tutor.fullName || tutor.name}</p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">Student ID</p>
              <p className="text-sm text-black/80">{tutor.studentId || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">Email</p>
              <p className="text-sm text-black/80">{tutor.email || "(hidden)"}</p>
            </div>
            <div>
              <p className="text-[11px] text-black/60">Faculty / Major</p>
              <p className="text-sm text-black/80">{tutor.faculty || tutor.department}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-dark-blue mt-4">Expertise & teaching</h3>
          <div>
            <p className="text-[11px] text-black/60">Summary</p>
            <p className="text-sm text-black/80">{tutor.expertise || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-black/60 mt-2">Detailed expertise</p>
            <p className="text-sm text-black/80">{tutor.detailedExpertise || "—"}</p>
          </div>
          <div>
            <p className="text-[11px] text-black/60 mt-2">Preferences (from tutor)</p>
            <p className="text-sm text-black/80 italic">{tutor.preferences || "—"}</p>
            <p className="text-sm text-black/80 mt-1">{tutor.detailedPreferences || "—"}</p>
          </div>

          <h3 className="text-lg font-semibold text-dark-blue mt-4">Full availability</h3>
          {tutor.fullAvailability && tutor.fullAvailability.length > 0 ? (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              {tutor.fullAvailability.map((iso) => (
                <div key={iso} className="border border-soft-white-blue rounded-md p-2">
                  <p className="text-sm font-semibold">{formatDate(iso)}</p>
                  <p className="text-xs text-black/60">{/* mode unknown in mock; could be added */}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-black/60">No full availability published.</p>
          )}

          <div className="mt-4">
            <Link href={`/student/book-session?tutorId=${tutor.id}`} className="inline-flex items-center rounded-md bg-light-heavy-blue text-white text-sm font-semibold px-4 py-2 hover:bg-light-blue transition">
              Book session
            </Link>
          </div>
        </section>

        <aside className="bg-white rounded-xl border border-black/5 shadow-sm p-4 md:p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-dark-blue">Quick info</h3>
            <p className="text-[11px] text-black/55 mt-2">Match: {tutor.match}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark-blue">Stats</h4>
            <p className="text-[11px] text-black/55 mt-1">Sessions completed: <span className="text-black/80">{tutor.sessionsCompleted ?? 0}</span></p>
            <p className="text-[11px] text-black/55 mt-1">Average rating: <span className="text-black/80">{tutor.averageRating ? tutor.averageRating.toFixed(1) : "—"}</span></p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-dark-blue">Recent feedback</h4>
            {tutor.feedbacks && tutor.feedbacks.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {tutor.feedbacks.slice(0, 3).map((f) => (
                  <li key={f.id} className="text-[11px] text-black/70">“{f.comment}” <span className="text-[10px] text-black/45">· {formatDate(f.date)}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-black/60 mt-2">No feedback yet.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
