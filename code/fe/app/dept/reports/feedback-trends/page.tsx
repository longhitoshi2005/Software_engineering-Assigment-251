"use client";

import React from "react";

export default function FeedbackTrends() {
  // This file was moved from coord/feedback-issues and kept as an aggregated report
  // intended for DepartmentChair. It preserves the previous aggregated UI.
  const issues = [
    { id: 1, title: "Session pacing too fast", category: "pace", severity: "high", count: 12, lastReported: "2024-01-15" },
    { id: 2, title: "Need more examples", category: "examples", severity: "medium", count: 9, lastReported: "2024-01-14" },
    { id: 3, title: "Scheduling conflicts", category: "scheduling", severity: "low", count: 7, lastReported: "2024-01-13" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Feedback Trends</h1>
        <p className="text-sm text-black/70 mt-1">Aggregated feedback trends and counts (Department-level view).</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="border border-soft-white-blue rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-dark-blue">{issue.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-black/60">
                    <span>Category: {issue.category}</span>
                    <span>Severity: {issue.severity}</span>
                    <span>Reports: {issue.count}</span>
                    <span>Last: {issue.lastReported}</span>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">View details</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
