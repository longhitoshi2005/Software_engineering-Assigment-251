"use client";
import React, { useState } from 'react';
import { hasRole, Role } from '@/src/lib/role';
import { requestExport } from '@/src/lib/exports';

export default function DeptExportControls() {
  const [loading, setLoading] = useState(false);
  const canExport = hasRole(Role.DEPARTMENT_CHAIR);

  const handleExport = async () => {
    setLoading(true);
    try {
      await requestExport('dept_summary');
      // ideally swal success — keep simple
      alert('Export started / downloaded');
    } catch (err:any) {
      alert('Export failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!canExport) {
    return (
      <div className="text-sm text-black/60">Bạn không có quyền xuất báo cáo khoa.</div>
    );
  }

  return (
    <div className="mt-4">
      <button
        onClick={handleExport}
        disabled={loading}
        className="text-sm font-semibold rounded-lg px-3 py-2"
        style={{ background: 'var(--color-light-heavy-blue)', color: 'var(--color-white)' }}
      >
        {loading ? 'Exporting...' : 'Export Department CSV'}
      </button>
    </div>
  );
}
