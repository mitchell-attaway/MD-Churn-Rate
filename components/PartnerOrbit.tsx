import { MonthKey, PartnerRow } from "@/lib/data";
import { formatMoney } from "@/lib/metrics";

function polarPosition(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

export default function PartnerOrbit({
  rows,
  month
}: {
  rows: PartnerRow[];
  month: MonthKey;
}) {
  if (rows.length === 0) {
    return (
      <div className="card">
        <h3>Partner Orbit</h3>
        <div className="small">No partners found for this director.</div>
      </div>
    );
  }
  const maxValue = Math.max(
    ...rows.map((row) => row.months[month] ?? 0),
    1
  );
  const size = 420;
  const center = size / 2;

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h3>Partner Orbit</h3>
          <div className="small">{month} projected revenue by partner</div>
        </div>
        <div className="chip">{rows.length} partners</div>
      </div>
      <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
        <div
          style={{
            position: "absolute",
            top: center - 40,
            left: center - 40,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#1d9a8a",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 14,
            textAlign: "center",
            boxShadow: "0 18px 30px rgba(0,0,0,0.18)"
          }}
        >
          {month}
        </div>
        {rows.map((row, index) => {
          const value = row.months[month] ?? 0;
          const radius = 70 + (index % 5) * 40;
          const position = polarPosition(index, rows.length, radius);
          const bubbleSize = 14 + (value / maxValue) * 36;
          const top = center + position.y - bubbleSize / 2;
          const left = center + position.x - bubbleSize / 2;
          return (
            <div
              key={row.partner}
              title={`${row.partner}: ${formatMoney(value)}`}
              style={{
                position: "absolute",
                top,
                left,
                width: bubbleSize,
                height: bubbleSize,
                borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #f2b14b, #f06b4f)",
                opacity: value === 0 ? 0.3 : 0.9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#1a1a1a",
                padding: 4
              }}
            >
              {row.partner.slice(0, 2)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
