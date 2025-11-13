"use client";

import React from "react";
import { hasRole, getClientRole, Role } from "@/app/lib/role";

type Props = {
  allowedRoles: Role[];
  title?: string;
  children?: React.ReactNode;
};

export default function ClientRoleGuard({ allowedRoles, title, children }: Props) {
  const allowed = hasRole(...allowedRoles);

  if (allowed) return <>{children}</>;

  return (
    <div className="p-6 bg-white border border-black/5 rounded-md shadow-sm max-w-3xl mx-auto mt-8">
      <h2 className="text-lg font-semibold">{title ?? "Không có quyền truy cập"}</h2>
      <p className="mt-2 text-sm text-gray-600">
        Bạn không có quyền xem trang này. Nếu cần quyền truy cập, vui lòng liên hệ ProgramAdmin.
      </p>
      <div className="mt-3 text-sm text-gray-500">
        <div>Yêu cầu vai trò: {allowedRoles.join(', ')}</div>
        <div>Vai trò hiện tại: {getClientRole() ?? 'None'}</div>
      </div>
    </div>
  );
}
