"use client";

import React, { useState, useMemo } from "react";
import ClientRoleGuard from "@/components/ClientRoleGuard";
import { hasRole, Role } from '@/lib/role';
import { PERFORMANCE_METRICS, type PerformanceMetric } from '@/lib/mocks';

const PerformanceReports: React.FC = () => {
  const [timeframe, setTimeframe] = useState("monthly");

  const performanceMetrics = useMemo<PerformanceMetric[]>(() => PERFORMANCE_METRICS, []);

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↑";
      case "down": return "↓";
      default: return "→";
    }
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.DEPARTMENT_CHAIR, Role.PROGRAM_ADMIN]} title="Performance reports (DepartmentChair only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Performance reports</h1>
        <p className="text-sm text-black/70 mt-1">Track key performance indicators and trends.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex items-center gap-4 mb-6">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-soft-white-blue rounded-md text-sm"
          >
            <option value="weekly">Last 7 days</option>
            <option value="monthly">Last 30 days</option>
            <option value="quarterly">Last 3 months</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="border border-soft-white-blue rounded-lg p-4">
              <div className="text-sm text-black/60 mb-1">{metric.metric}</div>
              <div className="text-2xl font-semibold text-dark-blue mb-1">{metric.value}</div>
              <div className={`text-sm flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                <span>{getTrendIcon(metric.trend)}</span>
                <span>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-soft-white-blue pt-6">
          <h3 className="text-base font-semibold text-dark-blue mb-4">Detailed breakdown</h3>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-dark-blue mb-2">Match success rate by subject</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>Mathematics: 96%</div>
                <div>Physics: 92%</div>
                <div>Chemistry: 95%</div>
                <div>Biology: 93%</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-dark-blue mb-2">Response time distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>&lt; 1 hour: 45%</div>
                <div>1-2 hours: 30%</div>
                <div>2-4 hours: 20%</div>
                <div>&gt; 4 hours: 5%</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-dark-blue mb-2">Satisfaction by grade level</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>9th grade: 4.4/5</div>
                <div>10th grade: 4.5/5</div>
                <div>11th grade: 4.7/5</div>
                <div>12th grade: 4.6/5</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </ClientRoleGuard>
  );
};

export default PerformanceReports;
