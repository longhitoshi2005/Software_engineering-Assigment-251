import { NextResponse } from "next/server";
import { adminSystemTasks, runAdminTaskMock } from "@/lib/mocks/db/adminSystemTasks";

export async function POST(req: Request) {
  const { taskName, simulateFailure, resultText } = await req.json();

  if (!taskName) {
    return NextResponse.json(
      { error: "Missing taskName" },
      { status: 400 }
    );
  }

  const found = adminSystemTasks.find((t) => t.name === taskName);
  if (!found) {
    return NextResponse.json(
      { error: `Task '${taskName}' not found` },
      { status: 404 }
    );
  }

  const status = simulateFailure ? "Failed" : "Success";

  const finalResult =
    resultText ??
    (simulateFailure
      ? "FAILED: simulated error"
      : taskName.includes("cleanup")
      ? "OK (8 MB freed)"
      : "OK (stored in dc-hcmut-bucket-02)");

  const entry = runAdminTaskMock(taskName, finalResult, status as any);

  return NextResponse.json({
    success: true,
    message: `Task '${taskName}' executed.`,
    data: entry,
  });
}
