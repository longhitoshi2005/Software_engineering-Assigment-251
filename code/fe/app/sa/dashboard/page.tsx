"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SADashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch("/api/sa/training-credit").then((r) => r.json()),
        fetch("/api/sa/activity").then((r) => r.json()),
      ]);

      setStats(statsRes);
      setActivities(activitiesRes);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <div className="bg-[#eef2fa] min-h-screen py-6 px-4 md:px-10 space-y-10">

      {/* ---------------- TOP HEADER TITLE ---------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#0b1e49]">Student Affairs Dashboard</h1>
        <p className="text-sm text-[#6b7280] mt-1">
          Term 2025-1 • Today: {new Date().toLocaleDateString()}
        </p>
      </header>

      {/* ---------------- PROGRAM OVERVIEW ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <OverviewCard 
          title="Total Participants"
          value="342"
          change="+12% vs Last Term"
        />

        <OverviewCard 
          title="Eligible Students"
          value="287"
          change="+8% vs Last Term"
        />

        <OverviewCard 
          title="Sessions Completed"
          value="1456"
          change="+15% vs Last Term"
        />

        <OverviewCard 
          title="Avg Feedback Rate"
          value="89%"
          change="+3% vs Last Term"
        />
      </section>

      {/* ---------------- SYSTEM ALERTS ---------------- */}
      <section className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <h2 className="text-lg font-semibold text-[#0b1e49] mb-4">System Alerts</h2>

        <AlertBox 
          type="warning"
          message="3 tutors have overbooked sessions this week."
        />

        <AlertBox 
          type="info"
          message="12 students have not submitted session feedback yet."
        />

        <AlertBox 
          type="info"
          message="5 students are near eligibility threshold (need 1 more session)."
        />
      </section>

      {/* ---------------- QUICK ACTIONS ---------------- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <QuickActionButton 
          label="View Participation Report"
          onClick={() => router.push("/sa/participation")}
        />

        <QuickActionButton 
          label="Check Eligibility"
          onClick={() => router.push("/sa/eligibility")}
        />

        <QuickActionButton 
          label="Export Reports"
          onClick={() => router.push("/sa/export-center")}
        />

      </section>

      <button
        onClick={() => router.push("/sa/export-center")}
        className="w-full md:w-auto bg-[#0b5ed7] hover:bg-[#094db0] text-white px-6 py-3 rounded-lg shadow-md font-medium flex items-center gap-2"
      >
        📄 Export Summary Report
      </button>

      {/* ---------------- RECENT ACTIVITY ---------------- */}
      <section className="bg-white rounded-xl p-6 shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#0b1e49]">Recent Activity</h2>
          <button className="text-sm text-[#0b5ed7] hover:underline">View All Logs</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activities.slice(0, 3).map((a: any, i: number) => (
            <ActivityCard
              key={i}
              title={a.title}
              time={a.time}
              by="sa_admin"
            />
          ))}
        </div>
      </section>

    </div>
  );
}

/* --------------------------------------------------------
    COMPONENTS
-------------------------------------------------------- */

function OverviewCard({ title, value, change }: any) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-[#0b1e49] mt-1">{value}</h2>
      <p className="text-sm text-green-600 mt-1">{change}</p>
    </div>
  );
}

function AlertBox({ message, type }: any) {
  const styles =
    type === "warning"
      ? "bg-yellow-100 border-yellow-300 text-yellow-800"
      : "bg-blue-100 border-blue-300 text-blue-800";

  return (
    <div className={`p-3 rounded-md border mb-2 ${styles}`}>
      {message}
    </div>
  );
}

function QuickActionButton({ label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-300 w-full py-4 rounded-lg shadow hover:bg-gray-100 transition text-[#0b1e49] font-medium"
    >
      {label}
    </button>
  );
}

function ActivityCard({ title, time, by }: any) {
  return (
    <div className="bg-[#eef1f7] p-4 rounded-lg border border-gray-300">
      <p className="text-sm font-medium text-[#0b1e49]">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{time}</p>
      <p className="text-xs text-gray-500 mt-1">By: {by}</p>
    </div>
  );
}
