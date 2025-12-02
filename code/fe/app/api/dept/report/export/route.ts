import { ensureDeptRole } from "@/lib/ensureRole";
import {
  departmentalData,
  participationData,
  workloadData,
  performanceData,
  feedbackTrendsData,
} from "@/lib/reports-data";

export function GET(req: Request) {
  const guard = ensureDeptRole(req.headers);
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "departmental";
  const format = searchParams.get("format") || "json";

  const sources: any = {
    departmental: departmentalData,
    participation: participationData,
    workload: workloadData,
    performance: performanceData,
    feedback: feedbackTrendsData,
  };

  const data = sources[type];
  if (!data) {
    return new Response(JSON.stringify({ error: "Invalid report type" }), {
      status: 400,
    });
  }

  if (format === "json") {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // CSV MODE -------------------------
  let csv = "";
  if (type === "departmental") {
    csv = "attendance,totalSessions,performanceIndex\n";
    csv += `${data.attendance},${data.totalSessions},${data.performanceIndex}`;
  }

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${type}.csv"`,
    },
  });
}
