import { existsSync, readFileSync, statSync } from "fs";
import path from "path";

const LAST_UPDATE_PATH = path.join(process.cwd(), "data", "last-update.json");

export function readLastUpdate(): string | null {
  if (!existsSync(LAST_UPDATE_PATH)) {
    return null;
  }
  try {
    const raw = readFileSync(LAST_UPDATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (typeof parsed?.updatedAt === "string") {
      return parsed.updatedAt;
    }
  } catch (error) {
    return null;
  }
  return null;
}

export function fileMtime(filePath: string): string | null {
  if (!existsSync(filePath)) {
    return null;
  }
  try {
    return statSync(filePath).mtime.toISOString();
  } catch (error) {
    return null;
  }
}
