import { NextResponse } from "next/server";
import { updateExportJob } from "@/lib/mocks/db/export";

export async function POST(req: Request) {
  const { id } = await req.json();

  updateExportJob(id, { status: "Canceled" });

  return NextResponse.json({ ok: true });
}
