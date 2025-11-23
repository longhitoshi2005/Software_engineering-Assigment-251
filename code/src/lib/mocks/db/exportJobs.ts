import type { ExportJob } from "@/types/exportJobs";

export const EXPORT_JOBS: ExportJob[] = [
  { id: 1, name: "Student data export", type: "CSV", status: "completed", created: "2024-01-15 09:00:00", size: "2.3 MB", downloadUrl: "/downloads/student-data-2024-01-15.csv" },
  { id: 2, name: "Session reports", type: "PDF", status: "processing", created: "2024-01-15 10:30:00", size: "Processing...", downloadUrl: null },
  { id: 3, name: "Tutor performance", type: "Excel", status: "completed", created: "2024-01-14 16:00:00", size: "1.8 MB", downloadUrl: "/downloads/tutor-performance-2024-01-14.xlsx" },
  { id: 4, name: "Feedback summary", type: "JSON", status: "failed", created: "2024-01-14 14:00:00", size: "Error", downloadUrl: null },
];
