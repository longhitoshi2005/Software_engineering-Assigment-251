"use client";
// Lightweight loader + helpers for SweetAlert2 via CDN
// Loads https://cdn.jsdelivr.net/npm/sweetalert2@11 on demand and exposes small helpers
const CDN = "https://cdn.jsdelivr.net/npm/sweetalert2@11";
let _swalPromise: Promise<any> | null = null;

function loadSwal(): Promise<any> {
  if (_swalPromise) return _swalPromise;
  _swalPromise = new Promise((resolve, reject) => {
    if ((globalThis as any).Swal) return resolve((globalThis as any).Swal);
    const s = document.createElement("script");
    s.src = CDN;
    s.async = true;
    s.onload = () => {
      resolve((globalThis as any).Swal);
    };
    s.onerror = (e) => reject(new Error("Failed to load SweetAlert2 from CDN"));
    document.head.appendChild(s);
  });
  return _swalPromise;
}

export async function swalFire(options: any) {
  const Swal = await loadSwal();
  return Swal.fire(options);
}

export async function swalSuccess(title = "Saved", text?: string) {
  return swalFire({ title, text, icon: "success", confirmButtonText: "OK" });
}

export async function swalError(title = "Error", text?: string) {
  return swalFire({ title, text, icon: "error", confirmButtonText: "OK" });
}

export async function swalInfo(title = "Info", text?: string) {
  return swalFire({ title, text, icon: "info", confirmButtonText: "OK" });
}

export async function swalConfirm(title = "Are you sure?", text?: string, opts?: any) {
  const res = await swalFire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: (opts && opts.confirmText) || "Yes",
    cancelButtonText: (opts && opts.cancelText) || "Cancel",
  });
  return !!res.isConfirmed;
}

const swalHelpers = {
  loadSwal,
  fire: swalFire,
  success: swalSuccess,
  error: swalError,
  info: swalInfo,
  confirm: swalConfirm,
};

export default swalHelpers;
