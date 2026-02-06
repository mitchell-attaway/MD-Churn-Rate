import { formatMoney, formatPct, latestMonthIndex, sum } from "@/lib/metrics";

const COLORS = {
  positive: "#1d9a8a",
  neutral: "#f2b14b",
  negative: "#d64545"
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle)
  };
}

function describeDonutSegment(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, endAngle);
  const endInner = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z"
  ].join(" ");
}

function colorForChange(change: number) {
  if (change > 0.02) return COLORS.negative;
  if (change < -0.02) return COLORS.positive;
  return COLORS.neutral;
}

export type ChurnWheelProps = {
  title: string;
  months: string[];
  values: number[];
  changes: number[];
  framed?: boolean;
  showHeader?: boolean;
};

export default function ChurnWheel({
  title,
  months,
  values,
  changes,
  framed = true,
  showHeader = true
}: ChurnWheelProps) {
  const size = 170;
  const center = size / 2;
  const maxValue = Math.max(...values, 1);
  const baseInner = 28;
  const thickness = 52;
  const angleStep = (Math.PI * 2) / values.length;
  const total = sum(values);
  const latestIndex = latestMonthIndex(values);
  const latestChange = changes[latestIndex] ?? 0;

  const content = (
    <>
      {showHeader ? (
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3>{title}</h3>
            <div className="small">Churn Wheel</div>
          </div>
          <div className="emphasis">{formatMoney(total)}</div>
        </div>
      ) : null}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {values.map((value, index) => {
          const radius = baseInner + (value / maxValue) * thickness;
          const startAngle = -Math.PI / 2 + index * angleStep;
          const endAngle = startAngle + angleStep * 0.88;
          return (
            <path
              key={`${title}-${months[index]}`}
              d={describeDonutSegment(center, center, baseInner, radius, startAngle, endAngle)}
              fill={colorForChange(changes[index] ?? 0)}
              opacity={value === 0 ? 0.2 : 0.9}
            />
          );
        })}
        <circle cx={center} cy={center} r={baseInner - 6} fill="#fff7ed" />
        <text
          x={center}
          y={center - 4}
          textAnchor="middle"
          fontSize="12"
          fill="#4c4c4c"
        >
          Latest drop %
        </text>
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          fontSize="16"
          fontWeight="700"
          fill={colorForChange(latestChange)}
        >
          {formatPct(latestChange)}
        </text>
      </svg>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="small">{months[latestIndex]}</div>
        <div className="small">Drop vs baseline</div>
      </div>
    </>
  );

  if (!framed) {
    return <div>{content}</div>;
  }

  return <div className="card">{content}</div>;
}
