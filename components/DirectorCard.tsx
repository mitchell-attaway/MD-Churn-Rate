import Link from "next/link";
import ChurnWheel from "./ChurnWheel";
import { formatMoney, sum } from "@/lib/metrics";

export type DirectorCardProps = {
  name: string;
  href: string;
  months: string[];
  values: number[];
  changes: number[];
  partners: number;
  yearChurn: number;
  latestDrop: number;
  latestDropMoM: number;
};

export default function DirectorCard({
  name,
  href,
  months,
  values,
  changes,
  partners,
  yearChurn,
  latestDrop,
  latestDropMoM
}: DirectorCardProps) {
  const total = sum(values);
  return (
    <Link href={href} style={{ display: "block" }}>
      <div className="card" style={{ gap: 20 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h3>{name}</h3>
            <div className="small">{partners} partners</div>
            <div className="small">Latest drop: {formatMoney(latestDrop)}</div>
            <div className="small">Drop MoM: {formatMoney(latestDropMoM)}</div>
          </div>
          <div className="chip">{formatMoney(total)}</div>
        </div>
        <div className="row">
          <div className="chip">Year churn: {formatMoney(yearChurn)}</div>
        </div>
        <ChurnWheel
          title=""
          months={months}
          values={values}
          changes={changes}
          framed={false}
          showHeader={false}
        />
      </div>
    </Link>
  );
}
