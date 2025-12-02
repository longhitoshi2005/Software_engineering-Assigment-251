"use client";

import { swalConfirm, swalSuccess, swalFire, swalInfo } from "@/lib/swal";
import { requestExport } from "@/lib/exports";

export async function connectIntegration(id: number) {
  const ok = await swalConfirm("Connect integration?", `Connect integration #${id}?`);
  if (!ok) return;
  await swalSuccess("Connected", `Integration #${id} connected.`);
}

export async function disconnectIntegration(id: number) {
  const ok = await swalConfirm("Disconnect integration?", `Disconnect integration #${id}?`);
  if (!ok) return;
  await swalSuccess("Disconnected", `Integration #${id} disconnected.`);
}

export async function setupIntegration(id: number) {
  await swalInfo("Setup", `Open setup flow for integration #${id}.`);
}

export async function addRole() {
  const { value: roleName } = await swalFire({ title: "Create new role", input: 'text', inputLabel: 'Role name', inputPlaceholder: 'e.g. Coordinator Lead' });
  if (!roleName) return;
  await swalSuccess("Role created", `Role '${roleName}' created (mock).`);
}

export async function editRole(id: number) {
  const { value: roleName } = await swalFire({ title: "Edit role", input: 'text', inputLabel: 'Role name', inputPlaceholder: 'Updated role name' });
  if (!roleName) return;
  await swalSuccess("Role updated", `Role ${id} updated to '${roleName}' (mock).`);
}

export async function deleteRole(id: number) {
  const ok = await swalConfirm("Delete role?", `Permanently delete role #${id}?`);
  if (!ok) return;
  await swalSuccess("Deleted", `Role ${id} deleted (mock).`);
}

export async function newExport() {
  const { value: exportType } = await swalFire({ title: "Create export", input: 'select', inputOptions: { workload: 'Workload', audit: 'Audit logs', students: 'Students' }, inputPlaceholder: 'Select export type' });
  if (!exportType) return;
  await requestExport(exportType as string).then(() => swalSuccess('Export', `Export '${exportType}' started (mock).`)).catch((e) => swalFire({ title: 'Error', text: String(e), icon: 'error' }));
}

export async function exportAudit() {
  await requestExport('audit').then(() => swalSuccess('Export', 'Audit export started (mock).')).catch((e) => swalFire({ title: 'Error', text: String(e), icon: 'error' }));
}

export async function exportWorkload() {
  await requestExport('workload').then(() => swalSuccess('Export', 'Workload export started (mock).')).catch((e) => swalFire({ title: 'Error', text: String(e), icon: 'error' }));
}
