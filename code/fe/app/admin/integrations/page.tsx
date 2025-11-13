"use client";

import React, { useState, useMemo } from "react";
import { hasRole, Role } from '@/app/lib/role';
import ClientRoleGuard from "@/app/coord/ClientRoleGuard";
import { connectIntegration, disconnectIntegration, setupIntegration } from "@/app/admin/actions";
import { INTEGRATIONS, Integration } from '@/app/lib/mocks';

const Integrations: React.FC = () => {
  const integrations = useMemo<Integration[]>(() => INTEGRATIONS, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-100 text-green-800";
      case "disconnected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getActionButton = (status: string, id: number) => {
    switch (status) {
      case "connected":
        return <button onClick={() => disconnectIntegration(id)} className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">Disconnect</button>;
      case "disconnected":
        return <button onClick={() => connectIntegration(id)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Connect</button>;
      case "pending":
        return <button onClick={() => setupIntegration(id)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">Setup</button>;
      default:
        return null;
    }
  };

  return (
    <ClientRoleGuard allowedRoles={[Role.ProgramAdmin]} title="Integrations (Admin only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Integrations</h1>
        <p className="text-sm text-black/70 mt-1">Manage third-party service connections.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-dark-blue mb-1">{integration.name}</h3>
                  <p className="text-sm text-black/70 mb-2">{integration.description}</p>
                  <div className="flex items-center gap-4 text-xs text-black/60">
                    <span>Last sync: {integration.lastSync}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(integration.status)}`}>
                    {integration.status}
                  </span>
                  {hasRole(Role.Coordinator, Role.ProgramAdmin) ? getActionButton(integration.status, integration.id) : <div className="text-sm text-black/60">Integration controls are for Coordinators/Program Admins.</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </ClientRoleGuard>
  );
};

export default Integrations;
