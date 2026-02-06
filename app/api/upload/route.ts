import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRoleFromSessionValue, getSessionCookieName } from "@/lib/auth";
import { getHistoryPath, readHistoryIndex, writeHistoryIndex } from "@/lib/history";

export const runtime = "nodejs";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = cookies().get(getSessionCookieName())?.value;
  const role = getRoleFromSessionValue(session);
  if (!role) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ ok: false, error: "invalid_type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const targetPath = path.join(process.cwd(), "data", "churn.csv");
  await writeFile(targetPath, buffer);

  const timestamp = new Date().toISOString();
  const snapshotId = timestamp.replace(/[:.]/g, "-").replace(/Z$/, "");
  const historyDir = path.join(process.cwd(), "data", "history");
  await mkdir(historyDir, { recursive: true });
  const historyPath = getHistoryPath(snapshotId);
  await writeFile(historyPath, buffer);

  const entries = readHistoryIndex();
  entries.unshift({ id: snapshotId, uploadedAt: timestamp, filename: file.name });
  await writeHistoryIndex(entries.slice(0, 60));

  const lastUpdatePath = path.join(process.cwd(), "data", "last-update.json");
  await writeFile(lastUpdatePath, JSON.stringify({ updatedAt: timestamp }, null, 2));

  return NextResponse.json({ ok: true });
}
