import { MonthKey } from "@/lib/data";
import { formatMoney, formatPct } from "@/lib/metrics";

export default function BaselineDropTable({
  title,
  months,
  series,
  baseline
}: {
  title: string;
  months: MonthKey[];
  series: number[];
  baseline: number;
}) {
  return (
    <div className="card">
      <div className="section-title">
        <h3>{title}</h3>
        <div className="small">Baseline drop by month.</div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Projected revenue</th>
            <th>Baseline drop</th>
            <th>Drop %</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month, index) => {
            const value = series[index] ?? 0;
            const drop = baseline - value;
            const dropPct = baseline ? drop / baseline : 0;
            return (
              <tr key={month}>
                <td>{month}</td>
                <td>{formatMoney(value)}</td>
                <td>{formatMoney(drop)}</td>
                <td>{formatPct(dropPct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
