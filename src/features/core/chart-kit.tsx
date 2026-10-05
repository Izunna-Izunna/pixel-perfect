import { Download, TableProperties, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function ChartCard({
  title,
  subtitle,
  children,
  linkTo,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  linkTo?: string;
}) {
  const [showData, setShowData] = useState(false);
  return (
    <section className="border-t border-border py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            {linkTo && (
              <Link to={linkTo} className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
                <span>View all</span> <ExternalLink size={11} />
              </Link>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowData(!showData)}
            aria-pressed={showData}
          >
            <TableProperties size={14} className="mr-1" />
            View data
          </Button>
        </div>
      </div>
      {children}
      {showData && (
        <div className="mt-4 overflow-x-auto border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="p-2">Metric / Period</th>
                <th className="p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Current period ledger</td>
                <td className="p-2 font-mono">Live operational data</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values
    .map(
      (value, index) =>
        `${(index / Math.max(values.length - 1, 1)) * 100},${
          28 - ((value - min) / range) * 22
        }`
    )
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" role="img" aria-label="Recent trend">
      <polyline
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BarList({
  rows,
  onRowClick,
}: {
  rows: Array<{ label: string; value: number; display: string; to?: string }>;
  onRowClick?: (row: { label: string; value: number; display: string }) => void;
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="mt-5 space-y-3">
      {rows.map((row) => {
        const content = (
          <div
            key={row.label}
            onClick={() => onRowClick?.(row)}
            className={`group grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-xs rounded px-1.5 py-1 -mx-1.5 transition-colors ${
              row.to || onRowClick ? "cursor-pointer hover:bg-muted/70" : ""
            }`}
          >
            <span className="truncate text-muted-foreground group-hover:text-foreground font-medium">
              {row.label}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-foreground transition-all group-hover:bg-primary"
                style={{ width: `${Math.min(100, (row.value / max) * 100)}%` }}
              />
            </span>
            <span className="font-mono tabular-nums font-semibold group-hover:text-primary">
              {row.display}
            </span>
          </div>
        );

        if (row.to) {
          return (
            <Link key={row.label} to={row.to} className="block no-underline">
              {content}
            </Link>
          );
        }

        return content;
      })}
    </div>
  );
}