"use client";

import React, { useState, useMemo } from "react";
import ClientRoleGuard from "@/src/components/ClientRoleGuard";
import { addRole, editRole, deleteRole } from "@/app/admin/actions";
import { hasRole, Role } from "@/src/lib/role";
import { ROLES, PERMISSIONS, RoleDef } from '@/src/lib/mocks';

const RBAC: React.FC = () => {
  const roles = useMemo<RoleDef[]>(() => ROLES, []);
  const permissions = PERMISSIONS;

  return (
    <ClientRoleGuard allowedRoles={[Role.PROGRAM_ADMIN]} title="Role management (Admin only)">
      <div className="flex flex-col gap-6">
      <section className="bg-white border border-soft-white-blue rounded-lg px-5 py-4">
        <h1 className="text-lg md:text-xl font-semibold text-dark-blue">Role-based access control</h1>
        <p className="text-sm text-black/70 mt-1">Manage coordinator roles and permissions.</p>
      </section>

      <section className="bg-white border border-soft-white-blue rounded-lg p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-dark-blue">Roles</h2>
          <button onClick={() => addRole()} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
            Add role
          </button>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="border border-soft-white-blue rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-dark-blue">{role.name}</h3>
                  <p className="text-sm text-black/70 mt-1">{role.description}</p>
                  <p className="text-xs text-black/60 mt-1">{role.users} users assigned</p>
                </div>
                  <div className="flex gap-2">
                  <button onClick={() => editRole(role.id)} className="px-3 py-1 text-sm border border-soft-white-blue rounded hover:bg-gray-50">
                    Edit
                  </button>
                  <button onClick={() => deleteRole(role.id)} className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-dark-blue mb-2">Permissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((perm) => {
                    const permInfo = permissions.find(p => p.key === perm);
                    return (
                      <span key={perm} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {permInfo?.label || perm}
                      </span>
                    );
                  })}
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

export default RBAC;
