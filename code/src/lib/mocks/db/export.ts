// lib/mocks/db/exports.ts

export type ExportJobStatus =
  | "Done"
  | "Queued"
  | "Processing"
  | "Failed"
  | "Canceled"
  | "Timeout";

export interface ExportJob {
  id: string;
  name: string;
  at: string; // already formatted manually
  status: ExportJobStatus;
}

// STATIC MOCK DATA with fully manual timestamp formatting
export let EXPORT_JOBS: ExportJob[] = [
  {
    id: "E-090",
    name: "Departmental Report (CSV)",
    at: "11/01/2025, 09:15 PM",
    status: "Done",
  },
  {
    id: "E-091",
    name: "Participation Report (PDF)",
    at: "11/02/2025, 08:05 AM",
    status: "Queued",
  },
  {
    id: "E-092",
    name: "Audit Logs (CSV)",
    at: "11/02/2025, 09:40 AM",
    status: "Processing",
  },
  {
    id: "E-093",
    name: "System Errors (JSON)",
    at: "11/02/2025, 10:05 AM",
    status: "Failed",
  },
];

// Helpers
export const getJobs = () => EXPORT_JOBS;

export const addExportJob = (job: ExportJob) => {
  EXPORT_JOBS = [job, ...EXPORT_JOBS];
};

export const updateExportJob = (id: string, data: Partial<ExportJob>) => {
  EXPORT_JOBS = EXPORT_JOBS.map((j) => (j.id === id ? { ...j, ...data } : j));
};

// Manual timestamp generator WITHOUT formatter
export function generateManualTimestamp(): string {
  const d = new Date();

  let mm = (d.getMonth() + 1).toString().padStart(2, "0");
  let dd = d.getDate().toString().padStart(2, "0");
  let yyyy = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const hh = hours.toString().padStart(2, "0");

  return `${mm}/${dd}/${yyyy}, ${hh}:${minutes} ${ampm}`;
}

// Create job using manual timestamp builder
export function createJob(name: string): ExportJob {
  return {
    id: `E-${Date.now().toString().slice(-3)}`,
    name,
    at: generateManualTimestamp(),
    status: "Queued",
  };
}
