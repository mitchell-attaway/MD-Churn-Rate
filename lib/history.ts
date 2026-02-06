import { existsSync, readFileSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type HistoryEntry = {
  id: string;
  uploadedAt: string;
  filename: string;
};

const HISTORY_DIR = path.join(process.cwd(), "data", "history");
const INDEX_PATH = path.join(HISTORY_DIR, "index.json");

export function getHistoryPath(id: string): string {
  return path.join(HISTORY_DIR, `${id}.csv`);
}

export function readHistoryIndex(): HistoryEntry[] {
  if (!existsSync(INDEX_PATH)) {
    return [];
  }
  try {
    const raw = readFileSync(INDEX_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.entries)) {
      return parsed.entries as HistoryEntry[];
    }
  } catch (error) {
    return [];
  }
  return [];
}

export async function writeHistoryIndex(entries: HistoryEntry[]): Promise<void> {
  await mkdir(HISTORY_DIR, { recursive: true });
  await writeFile(INDEX_PATH, JSON.stringify({ entries }, null, 2));
}

export function findHistoryEntry(id: string): HistoryEntry | undefined {
  return readHistoryIndex().find((entry) => entry.id === id);
}
