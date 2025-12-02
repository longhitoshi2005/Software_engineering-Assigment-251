export type ExportJob = {
  id: string;
  name: string;
  at: string;
  status: "Done" | "Queued" | "Processing" | "Failed";
};

export let EXPORT_JOBS: ExportJob[] = [
  {
    id: "E-201",
    name: "Departmental (PDF)",
    at: "2025-10-21 21:15",
    status: "Done",
  },
  {
    id: "E-202",
    name: "Participation (CSV)",
    at: "2025-10-22 08:05",
    status: "Queued",
  },
];

// helper để thêm job mới
export function addExportJob(job: ExportJob) {
  EXPORT_JOBS = [job, ...EXPORT_JOBS];
}
