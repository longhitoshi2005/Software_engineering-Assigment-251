"use client";

import { useEffect, useState } from "react";

export default function SADashboardPage() {
  const [participation, setParticipation] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [escalations, setEscalations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---- LOAD API DATA ----
  useEffect(() => {
    async function loadData() {
      try {
        const [
          participationRes,
          statsRes,
          escalationsRes,
          activitiesRes,
        ] = await Promise.all([
          fetch("/api/sa/participation").then((r) => r.json()),
          fetch("/api/sa/training-credit").then((r) => r.json()),
          fetch("/api/sa/escalation").then((r) => r.json()),
          fetch("/api/sa/activity").then((r) => r.json()),
        ]);

        setParticipation(participationRes);
        setStats(statsRes);
        setEscalations(escalationsRes);
        setActivities(activitiesRes);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-10">

      {/* -------------------- HEADER -------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-dark-blue">Student Affairs Dashboard</h1>
        <p className="text-black/70 text-sm mt-1 max-w-3xl">
          Monitor participation, tutoring progress, escalations, and semester training credits.
        </p>
      </header>

      {/* -------------------- SUMMARY CARDS -------------------- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <DashboardCard
          title="Pending Participation"
          value={participation.length}
          desc="Records awaiting SA approval."
        />

        <DashboardCard
          title="Training Credits Issued"
          value={stats ? stats.approvedCredits : "..."}
          desc="This semester."
        />

        <DashboardCard
          title="Pending Reviews"
          value={stats ? stats.pendingReviews : "..."}
          desc="SA validation waiting."
        />

        <DashboardCard
          title="Escalations"
          value={escalations.length}
          desc="Cases requiring SA attention."
        />

      </section>

      {/* -------------------- PENDING PARTICIPATION -------------------- */}
      <section className="bg-white border border-soft-white-blue rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Pending Participation</h2>

        {loading ? (
          <p className="text-black/60">Loading...</p>
        ) : participation.length === 0 ? (
          <p className="text-black/60 text-sm">No pending participation records.</p>
        ) : (
          <div className="space-y-3">
            {participation.map((p: any) => (
              <div
                key={p.id}
                className="p-3 bg-soft-white-blue/40 border border-soft-white-blue rounded-lg"
              >
                <p className="text-dark-blue font-medium text-sm">
                  {p.studentName} — {p.course}
                </p>
                <p className="text-xs text-black/60">Tutor: {p.tutor}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* -------------------- ESCALATIONS -------------------- */}
      <section className="bg-white border border-soft-white-blue rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Escalations</h2>

        {loading ? (
          <p className="text-black/60">Loading...</p>
        ) : (
          <div className="space-y-3">
            {escalations.map((e: any) => (
              <div
                key={e.id}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800 font-semibold">{e.issue}</p>
                <p className="text-xs text-black/60">Severity: {e.severity}</p>
                <p className="text-xs text-black/60">Student ID: {e.studentId}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* -------------------- RECENT ACTIVITIES -------------------- */}
      <section className="bg-white border border-soft-white-blue rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-dark-blue mb-4">Recent Activities</h2>

        {loading ? (
          <p className="text-black/60">Loading...</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a: any, index: number) => (
              <ActivityItem
                key={index}
                title={a.title}
                detail={a.detail}
                time={a.time}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

/* -------------------- COMPONENTS -------------------- */

function DashboardCard({ title, value, desc }: any) {
  return (
    <div className="bg-white border border-soft-white-blue rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-black/60">{title}</p>
      <h2 className="text-3xl font-semibold text-dark-blue mt-1">{value}</h2>
      <p className="text-xs text-black/50 mt-1">{desc}</p>
    </div>
  );
}

function ActivityItem({ title, detail, time }: any) {
  return (
    <div className="p-3 bg-soft-white-blue/40 border border-soft-white-blue rounded-lg">
      <p className="text-sm text-dark-blue font-medium">{title}</p>
      <p className="text-xs text-black/60">{detail}</p>
      <p className="text-xs text-black/50 mt-1">{time}</p>
    </div>
  );
}
