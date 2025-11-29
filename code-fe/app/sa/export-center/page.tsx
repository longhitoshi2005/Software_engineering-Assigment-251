"use client";

import React from "react";
import ClientRoleGuard from "@/components/ClientRoleGuard";
import { hasRole, Role } from '@/lib/role';
import { requestExport } from '@/lib/exports';

export default function SAExportCenter() {
  const handleParticipation = async () => {
    try {
      await requestExport('participation_pdf');
      // show minimal feedback
      alert('Participation export requested');
    } catch (err: any) {
      alert('Export failed: ' + (err?.message || String(err)));
    }
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.STUDENT_AFFAIRS]} title="SA Export Center">
      <div className="min-h-[calc(100vh-60px)] px-4 py-6 md:px-8">
        <header className="max-w-6xl mx-auto mb-4">
          <h1 className="text-2xl font-semibold text-dark-blue">SA Export Center</h1>
          <p className="text-sm text-black/70 mt-1">Exports related to student participation and SA reports.</p>
        </header>

        <main className="max-w-6xl mx-auto">
          <section className="bg-white border border-soft-white-blue rounded-lg p-5">
            <h2 className="text-base font-semibold text-dark-blue mb-3">Participation Reports</h2>
            <div className="flex gap-3 items-center">
              {hasRole(Role.STUDENT_AFFAIRS) ? (
                <button onClick={handleParticipation} className="px-4 py-2 bg-soft-white-blue border border-soft-white-blue rounded text-sm font-medium text-dark-blue hover:bg-blue-50 transition">Participation (PDF)</button>
              ) : (
                <div className="text-sm text-black/60">You do not have permission to create participation exports.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ClientRoleGuard>
  );
}
