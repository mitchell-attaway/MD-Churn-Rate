import Link from "next/link";
import ChurnWheel from "@/components/ChurnWheel";
import BaselineDropTable from "@/components/BaselineDropTable";
import DirectorCard from "@/components/DirectorCard";
import { loadDataset } from "@/lib/data";
import { requireSession } from "@/lib/auth";
import {
  baselineChanges,
  baselineDropSeries,
  deltaSeries,
  formatMoney,
  formatPct,
  latestMonthIndex,
  slugify,
  totalByMonth,
  sum,
  totalProjectedChurn
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams?: { snapshot?: string };
}) {
  const role = requireSession();
  const isAdmin = role === "admin";
  const snapshotId = isAdmin ? searchParams?.snapshot : undefined;
  const data = await loadDataset({ snapshotId });
  const companySeries = totalByMonth(data.rows, data.months);
  const companyBaseline = sum(data.rows.map((row) => row.baseline));
  const companyChanges = baselineChanges(companySeries, companyBaseline);
  const companyTotal = sum(companySeries);
  const companyDropSeries = baselineDropSeries(companySeries, companyBaseline);
  const companyDropMoM = deltaSeries(companyDropSeries);
  const projectedChurn = totalProjectedChurn(data.rows);
  const latestIndex = latestMonthIndex(companySeries);
  const latestChange = companyChanges[latestIndex] ?? 0;
  const latestDrop = companyDropSeries[latestIndex] ?? 0;
  const latestDropMoM = companyDropMoM[latestIndex] ?? 0;
  const snapshotSuffix = snapshotId ? `?snapshot=${snapshotId}` : "";
  const lastUpdatedLabel = data.meta.lastUpdated
    ? new Date(data.meta.lastUpdated).toLocaleString("en-US")
    : "Unknown";

  return (
    <div className="page">
      <div className="nav">
        <div className="row">
          <div className="chip">Company View</div>
          <div className="chip">{data.rows.length} partners</div>
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
        <h1>Churn Constellation</h1>
        <p>
          A creative view of projected churn and revenue motion across all marketing directors. Each
          wheel is built from monthly revenue streams and colored by baseline drop.
        </p>
        <div className="row">
          <div className="chip">Projected Total: {formatMoney(companyTotal)}</div>
          <div className="chip">Projected Year Churn: {formatMoney(projectedChurn)}</div>
          <div className="chip">Baseline: {formatMoney(companyBaseline)}</div>
          <div className="chip">Baseline drop %: {formatPct(latestChange)}</div>
          <div className="chip">Latest baseline drop: {formatMoney(latestDrop)}</div>
          <div className="chip">Baseline drop MoM: {formatMoney(latestDropMoM)}</div>
          <div className="chip">Last updated: {lastUpdatedLabel}</div>
          <div className="chip">Source: {data.meta.source}</div>
        </div>
        {snapshotId ? (
          <div className="small">Viewing snapshot: {snapshotId}</div>
        ) : null}
      </section>

      <section className="grid">
        <ChurnWheel
          title="Company"
          months={data.months}
          values={companySeries}
          changes={companyChanges}
        />
      </section>

      <section>
        <BaselineDropTable
          title="Company baseline drop timeline"
          months={data.months}
          series={companySeries}
          baseline={companyBaseline}
        />
      </section>

      <section>
        <div className="section-title">
          <h2>Marketing Directors</h2>
          <div className="small">Select a director to see partner-level projections.</div>
        </div>
        <div className="grid">
          {data.mdList.map((md) => {
            const mdRows = data.rows.filter((row) => row.md === md);
            const mdSeries = totalByMonth(mdRows, data.months);
            const mdBaseline = sum(mdRows.map((row) => row.baseline));
            const mdChanges = baselineChanges(mdSeries, mdBaseline);
            const mdDropSeries = baselineDropSeries(mdSeries, mdBaseline);
            const mdDropMoM = deltaSeries(mdDropSeries);
            const mdLatestIndex = latestMonthIndex(mdSeries);
            const mdLatestDrop = mdDropSeries[mdLatestIndex] ?? 0;
            const mdLatestDropMoM = mdDropMoM[mdLatestIndex] ?? 0;
            const mdYearChurn = totalProjectedChurn(mdRows);
            return (
              <DirectorCard
                key={md}
                name={md}
                href={`/director/${slugify(md)}${snapshotSuffix}`}
                months={data.months}
                values={mdSeries}
                changes={mdChanges}
                partners={mdRows.length}
                yearChurn={mdYearChurn}
                latestDrop={mdLatestDrop}
                latestDropMoM={mdLatestDropMoM}
              />
            );
          })}
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3>How churn is computed</h3>
            <div className="small">
              We color each month by its baseline drop percentage. Baseline drop MoM shows the
              change in monthly drop versus the prior month.
            </div>
          </div>
          {data.mdList.length > 0 ? (
            <Link className="button secondary" href={`/director/${slugify(data.mdList[0])}${snapshotSuffix}`}>
              Sample director view
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
