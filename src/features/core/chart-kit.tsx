import { Download, TableProperties } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [showData, setShowData] = useState(false);
  return <section className="border-t border-border py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => setShowData(!showData)} aria-pressed={showData}><TableProperties />View data</Button><Button variant="ghost" size="sm" aria-label={`Download ${title} data`}><Download /></Button></div></div>{children}{showData && <div className="mt-4 overflow-x-auto border border-border"><table className="w-full text-left text-xs"><thead className="bg-muted"><tr><th className="p-2">Period</th><th className="p-2">Value</th></tr></thead><tbody><tr><td className="p-2">Current period</td><td className="p-2 font-mono">Available in mock data</td></tr></tbody></table></div>}</section>;
}

export function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1); const min = Math.min(...values); const range = Math.max(max - min, 1);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${28 - ((value - min) / range) * 22}`).join(" ");
  return <svg viewBox="0 0 100 32" className="h-8 w-full" role="img" aria-label="Recent trend"><polyline fill="none" stroke="var(--foreground)" strokeWidth="2" points={points} vectorEffect="non-scaling-stroke" /></svg>;
}

export function BarList({ rows }: { rows: Array<{ label: string; value: number; display: string }> }) { const max = Math.max(...rows.map((row) => row.value), 1); return <div className="mt-5 space-y-3">{rows.map((row) => <div key={row.label} className="grid grid-cols-[8rem_1fr_auto] items-center gap-3 text-xs"><span className="truncate text-muted-foreground">{row.label}</span><span className="h-2 overflow-hidden bg-muted"><span className="block h-full bg-foreground" style={{ width: `${(row.value / max) * 100}%` }} /></span><span className="font-mono tabular-nums">{row.display}</span></div>)}</div>; }