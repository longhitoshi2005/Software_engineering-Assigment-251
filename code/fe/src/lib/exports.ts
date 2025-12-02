import { getClientRole } from './role';

export async function requestExport(reportType: string, filters?: Record<string, any>) {
  // client helper: get user's role via centralized helper (mock auth)
  const role = typeof window !== 'undefined' ? getClientRole() : null;

  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
  };
  if (role) headers['x-user-role'] = String(role);

  const res = await fetch('/api/exports', {
    method: 'POST',
    headers,
    body: JSON.stringify({ reportType, filters }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || 'export_failed');
  }

  // For this mock API we return CSV directly; convert to blob and trigger download
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportType}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { ok: true };
}
