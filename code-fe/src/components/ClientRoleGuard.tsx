"use client";

import React from "react";
import { hasRole, getClientRole, Role } from "@/lib/role";

type Props = {
  allowedRoles: Role[];
  title?: string;
  children?: React.ReactNode;
};

export default function ClientRoleGuard({ allowedRoles, title, children }: Props) {
  const allowed = hasRole(...allowedRoles);

  if (allowed) return <>{children}</>;

  // Use the same outer container geometry as pages so SSR -> CSR markup matches.
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="p-6 bg-white border border-black/5 rounded-md shadow-sm max-w-3xl mx-auto mt-8">
        <h2 className="text-lg font-semibold">{title ?? "Access Denied"}</h2>
        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to view this page. If you need access, please contact the Program Admin.
        </p>
        <div className="mt-3 text-sm text-gray-500">
          <div>
            Required role(s): {allowedRoles.join(', ')}
          </div>
          <div>
            Current role: {getClientRole() ?? 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}