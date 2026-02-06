import { MonthKey, PartnerRow } from "@/lib/data";
import { formatMoney } from "@/lib/metrics";

function buildSparkline(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  return values
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function PartnerPulseTable({
  rows,
  months
}: {
  rows: PartnerRow[];
  months: MonthKey[];
}) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Partner</th>
          <th>Baseline</th>
          <th>Projected Total</th>
          <th>Monthly Pulse</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const values = months.map((month) => row.months[month] ?? 0);
          const points = buildSparkline(values, 120, 36);
          return (
            <tr key={row.partner}>
              <td>{row.partner}</td>
              <td>{formatMoney(row.baseline)}</td>
              <td>{formatMoney(row.totalRevenue)}</td>
              <td>
                <svg className="sparkline" viewBox="0 0 120 36">
                  <polyline
                    fill="none"
                    stroke="#1d9a8a"
                    strokeWidth="2"
                    points={points}
                  />
                  <polyline
                    fill="none"
                    stroke="#f06b4f"
                    strokeWidth="2"
                    points={points}
                    opacity={0.2}
                  />
                </svg>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
