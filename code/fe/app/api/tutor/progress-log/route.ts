import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  addProgressLog,
  listProgressLogs,
  type ProgressLogAttachment,
  type ProgressLogStatus,
} from "@/lib/tutorData";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const uploadRoot = path.join(process.cwd(), "uploads", "progress-logs");

async function persistFile(file: File): Promise<ProgressLogAttachment> {
  await fs.mkdir(uploadRoot, { recursive: true });
  const extSafeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${crypto.randomUUID()}-${extSafeName}`;
  const filePath = path.join(uploadRoot, filename);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return {
    name: file.name,
    size: file.size,
    path: filePath,
    contentType: file.type || undefined,
  };
}

async function handleMultipart(request: Request) {
  const formData = await request.formData();
  const attachments: ProgressLogAttachment[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      const stored = await persistFile(value);
      attachments.push(stored);
    }
  }

  const sessionId = formData.get("sessionId")?.toString() || formData.get("session")?.toString() || "";
  const summary = formData.get("summary")?.toString() || "";
  const nextPlan = formData.get("nextPlan")?.toString() || null;
  const understanding = formData.get("understanding")?.toString() || null;
  const engagement = formData.get("engagement")?.toString() || null;
  const status = (formData.get("status")?.toString() as ProgressLogStatus | null) ?? undefined;

  if (!sessionId || !summary) {
    return NextResponse.json({ success: false, error: "sessionId and summary required" }, { status: 400 });
  }

  const entry = await addProgressLog({
    sessionId,
    summary,
    nextPlan,
    understanding,
    engagement,
    attachments,
    status,
  });

  return NextResponse.json({ success: true, data: entry }, { status: 201 });
}

export async function POST(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    try {
      return await handleMultipart(request);
    } catch (error) {
      return NextResponse.json({ success: false, error: "failed to parse upload" }, { status: 400 });
    }
  }

  try {
    const body = await request.json();
    const { sessionId, summary, nextPlan, understanding, engagement, attachments, status } = body ?? {};
    if (!sessionId || !summary) {
      return NextResponse.json({ success: false, error: "sessionId and summary required" }, { status: 400 });
    }
    const entry = await addProgressLog({
      sessionId,
      summary,
      nextPlan: nextPlan ?? null,
      understanding: understanding ?? null,
      engagement: engagement ?? null,
      attachments,
      status,
    });
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "invalid request payload" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const unauth = requireAuth(request);
  if (unauth) return unauth;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId") || undefined;
  const logs = await listProgressLogs(sessionId ?? undefined);
  return NextResponse.json({ success: true, data: logs });
}
