import Link from "next/link";
import { notFound } from "next/navigation";
import ChurnWheel from "@/components/ChurnWheel";
import BaselineDropTable from "@/components/BaselineDropTable";
import PartnerOrbit from "@/components/PartnerOrbit";
import PartnerPulseTable from "@/components/PartnerPulseTable";
import { requireSession } from "@/lib/auth";
import { loadDataset } from "@/lib/data";
import {
  baselineChanges,
  baselineDropSeries,
  deltaSeries,
  latestMonthIndex,
  slugify,
  totalByMonth,
  sum,
  formatMoney,
  formatPct,
  totalProjectedChurn
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function DirectorPage({
  params,
  searchParams
}: {
  params: { name: string };
  searchParams?: { snapshot?: string };
}) {
  const role = requireSession();
  const isAdmin = role === "admin";
  const snapshotId = isAdmin ? searchParams?.snapshot : undefined;
  const data = await loadDataset({ snapshotId });
  const director = data.mdList.find((md) => slugify(md) === params.name);
  if (!director) {
    notFound();
  }
  const rows = data.rows.filter((row) => row.md === director);
  const series = totalByMonth(rows, data.months);
  const baseline = sum(rows.map((row) => row.baseline));
  const changes = baselineChanges(series, baseline);
  const dropSeries = baselineDropSeries(series, baseline);
  const dropMoM = deltaSeries(dropSeries);
  const total = sum(series);
  const latestIndex = latestMonthIndex(series);
  const month = data.months[latestIndex];
  const latestChange = changes[latestIndex] ?? 0;
  const latestDrop = dropSeries[latestIndex] ?? 0;
  const latestDropMoM = dropMoM[latestIndex] ?? 0;
  const projectedChurn = totalProjectedChurn(rows);
  const companyHref = snapshotId ? `/?snapshot=${snapshotId}` : "/";
  const lastUpdatedLabel = data.meta.lastUpdated
    ? new Date(data.meta.lastUpdated).toLocaleString("en-US")
    : "Unknown";

  return (
    <div className="page">
      <div className="nav">
        <div className="row">
          <Link href={companyHref} className="chip">
            Company View
          </Link>
          <div className="chip">Director View</div>
          {isAdmin ? (
            <Link href="/upload" className="chip">
              Upload CSV
            </Link>
          ) : null}
          {isAdmin ? (
            <Link href="/history" className="chip">
              History
            </Link>
          ) : null}
        </div>
        <form action="/api/logout" method="post">
          <button className="button ghost" type="submit">
            Log out
          </button>
        </form>
      </div>

      <section className="hero">
        <h1>{director}</h1>
        <p>
          A partner-by-partner view of projected churn, revenue flow, and monthly momentum. Hover on
          the orbit to see each partner's current projection.
        </p>
        <div className="row">
          <div className="chip">Projected Total: {formatMoney(total)}</div>
          <div className="chip">Baseline: {formatMoney(baseline)}</div>
          <div className="chip">Baseline drop %: {formatPct(latestChange)}</div>
          <div className="chip">Latest baseline drop: {formatMoney(latestDrop)}</div>
          <div className="chip">Baseline drop MoM: {formatMoney(latestDropMoM)}</div>
          <div className="chip">Projected Year Churn: {formatMoney(projectedChurn)}</div>
          <div className="chip">Last updated: {lastUpdatedLabel}</div>
          <div className="chip">Source: {data.meta.source}</div>
          <div className="chip">{rows.length} partners</div>
        </div>
        {snapshotId ? (
          <div className="small">Viewing snapshot: {snapshotId}</div>
        ) : null}
      </section>

      <section className="grid">
        <ChurnWheel title={`${director} totals`} months={data.months} values={series} changes={changes} />
        <PartnerOrbit rows={rows} month={month} />
      </section>

      <section>
        <BaselineDropTable
          title="Baseline drop timeline"
          months={data.months}
          series={series}
          baseline={baseline}
        />
      </section>

      <section className="card">
        <div className="section-title">
          <h3>Partner Pulse Table</h3>
          <div className="small">Monthly projections at the partner level.</div>
        </div>
        <PartnerPulseTable rows={rows} months={data.months} />
      </section>
    </div>
  );
}
