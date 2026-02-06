import { MONTHS, MonthKey, PartnerRow } from "./data";

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function totalByMonth(rows: PartnerRow[], months: MonthKey[] = MONTHS): number[] {
  return months.map((month) =>
    rows.reduce((sum, row) => sum + (row.months[month] ?? 0), 0)
  );
}

export function momChanges(series: number[]): number[] {
  return series.map((value, index) => {
    if (index === 0) {
      return 0;
    }
    const prev = series[index - 1];
    if (!prev) {
      return 0;
    }
    return (value - prev) / prev;
  });
}

export function baselineChanges(series: number[], baseline: number): number[] {
  if (!baseline) {
    return series.map(() => 0);
  }
  return series.map((value) => (baseline - value) / baseline);
}

export function baselineDropSeries(series: number[], baseline: number): number[] {
  return series.map((value) => baseline - value);
}

export function deltaSeries(series: number[]): number[] {
  return series.map((value, index) => {
    if (index === 0) {
      return 0;
    }
    return value - series[index - 1];
  });
}

export function totalProjectedChurn(rows: { baselineX12: number; totalRevenue: number }[]): number {
  return rows.reduce((acc, row) => acc + (row.baselineX12 - row.totalRevenue), 0);
}

export function latestMonthIndex(series: number[]): number {
  if (series.length === 0) {
    return 0;
  }
  for (let i = series.length - 1; i >= 0; i -= 1) {
    if (series[i] !== 0) {
      return i;
    }
  }
  return series.length - 1;
}

export function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0);
}

export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
