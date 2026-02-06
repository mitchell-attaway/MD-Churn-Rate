import { existsSync, readFileSync } from "fs";
import path from "path";
import { parseCsv } from "./csv";
import { findHistoryEntry, getHistoryPath } from "./history";
import { fileMtime, readLastUpdate } from "./lastUpdate";

export type MonthKey =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export const MONTHS: MonthKey[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export type PartnerRow = {
  active: boolean;
  md: string;
  partner: string;
  baseline: number;
  months: Record<MonthKey, number>;
  totalRevenue: number;
  baselineX12: number;
  variance: number;
};

export type DatasetMeta = {
  source: "local" | "sheet" | "snapshot";
  lastUpdated?: string;
  snapshotId?: string;
};

export type Dataset = {
  months: MonthKey[];
  rows: PartnerRow[];
  mdList: string[];
  meta: DatasetMeta;
};

const INVALID_MD = new Set(["", "#REF!", "#N/A"]);

function parseMoney(value: string): number {
  const trimmed = value.replace(/\s/g, "").replace(/\$/g, "");
  if (!trimmed || trimmed === "-" || trimmed === "-") {
    return 0;
  }
  const negative = trimmed.includes("(") && trimmed.includes(")");
  const cleaned = trimmed.replace(/[(),]/g, "");
  const num = Number.parseFloat(cleaned);
  if (Number.isNaN(num)) {
    return 0;
  }
  return negative ? -num : num;
}

export async function loadDataset(options?: { snapshotId?: string }): Promise<Dataset> {
  const filePath = path.join(process.cwd(), "data", "churn.csv");
  const sheetUrl = process.env.SHEET_CSV_URL;
  const snapshotIdRaw = options?.snapshotId?.trim();
  const snapshotId = snapshotIdRaw && /^[0-9T:-]+$/.test(snapshotIdRaw) ? snapshotIdRaw : undefined;

  let raw = "";
  let meta: DatasetMeta = { source: "local", lastUpdated: readLastUpdate() ?? fileMtime(filePath) ?? undefined };

  if (snapshotId) {
    const snapshotPath = getHistoryPath(snapshotId);
    if (existsSync(snapshotPath)) {
      raw = readFileSync(snapshotPath, "utf8");
      const entry = findHistoryEntry(snapshotId);
      meta = {
        source: "snapshot",
        snapshotId,
        lastUpdated: entry?.uploadedAt ?? fileMtime(snapshotPath) ?? undefined
      };
    }
  }

  if (!raw && sheetUrl) {
    try {
      const response = await fetch(sheetUrl, { cache: "no-store" });
      raw = await response.text();
      meta = { source: "sheet", lastUpdated: meta.lastUpdated };
    } catch (error) {
      raw = readFileSync(filePath, "utf8");
    }
  }

  if (!raw) {
    raw = readFileSync(filePath, "utf8");
  }
  const rows = parseCsv(raw);
  if (rows.length < 3) {
    return { months: MONTHS, rows: [], mdList: [], meta };
  }

  const headerMonths = rows[1]
    .slice(4, 16)
    .map((value) => value.trim())
    .filter(Boolean) as MonthKey[];

  const months = headerMonths.length === 12 ? headerMonths : MONTHS;

  const dataRows: PartnerRow[] = [];
  for (let i = 2; i < rows.length; i += 1) {
    const row = rows[i];
    const activeRaw = row[0]?.trim();
    const md = row[1]?.trim();
    const partner = row[2]?.trim();
    if (!md || INVALID_MD.has(md) || !partner) {
      continue;
    }
    const baseline = parseMoney(row[3] ?? "");
    const monthValues = row.slice(4, 16).map((value) => parseMoney(value ?? ""));
    const totalRevenue = parseMoney(row[16] ?? "");
    const baselineX12 = parseMoney(row[17] ?? "");
    const variance = parseMoney(row[18] ?? "");

    const monthMap = months.reduce((acc, key, idx) => {
      acc[key] = monthValues[idx] ?? 0;
      return acc;
    }, {} as Record<MonthKey, number>);

    dataRows.push({
      active: activeRaw === "TRUE",
      md,
      partner,
      baseline,
      months: monthMap,
      totalRevenue,
      baselineX12,
      variance
    });
  }

  const mdList = Array.from(new Set(dataRows.map((row) => row.md))).sort();

  return { months, rows: dataRows, mdList, meta };
}
