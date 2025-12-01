import { NextResponse } from "next/server";
import { addExportJob, createJob } from "@/lib/mocks/db/export";

export async function POST(req: Request) {
  const { name } = await req.json();

  const job = createJob(name);
  addExportJob(job);

  return NextResponse.json(job);
}
