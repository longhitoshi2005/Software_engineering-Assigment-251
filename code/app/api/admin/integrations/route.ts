import { NextResponse } from "next/server";
import { integrations } from "@/lib/mocks/db/integration";

export async function GET() {
  return NextResponse.json(integrations);
}
