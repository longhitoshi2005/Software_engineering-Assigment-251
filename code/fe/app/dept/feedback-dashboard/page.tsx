"use client";

import React from "react";
import ClientRoleGuard from "@/app/coord/ClientRoleGuard";
import { Role } from "@/app/lib/role";

const FeedbackDashboard: React.FC = () => {
  const summary = [
    { label: "Positive", value: 151 },
    { label: "Neutral", value: 41 },
    { label: "Negative", value: 17 },
  ];
  const topIssues = [
    { tag: "pace", count: 12 },
    { tag: "examples", count: 9 },
    { tag: "scheduling", count: 7 },
  ];
  return (
    <ClientRoleGuard allowedRoles={[Role.DepartmentChair, Role.ProgramAdmin]} title="Feedback dashboard (DepartmentChair only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Feedback dashboard</h1>
        <p className="text-sm text-black/70 mt-1">Sentiment, scores, and recurring issues.</p>
      </section>

      <section className="grid md:grid-cols-3 gap-5">
        {summary.map((s) => (
          <div key={s.label} className="bg-white border border-soft-white-blue rounded-lg p-5">
            <div className="text-xs text-black/60">{s.label}</div>
            <div className="text-2xl font-semibold text-dark-blue mt-1">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <h2 className="text-base font-semibold text-dark-blue">Top issues</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {topIssues.map(i => (
            <span key={i.tag} className="inline-flex rounded-full px-3 py-1 text-xs border"
              style={{borderColor:"var(--color-soft-white-blue)", color:"var(--color-medium-light-blue)", background:"var(--color-white)"}}>
              #{i.tag} · {i.count}
            </span>
          ))}
        </div>
      </section>
      </div>
    </ClientRoleGuard>
  );
};

export default FeedbackDashboard;
