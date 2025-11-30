import { NextResponse } from "next/server";
import { getJobs } from "@/lib/mocks/db/export";

export async function GET() {
  return NextResponse.json(getJobs());
}
