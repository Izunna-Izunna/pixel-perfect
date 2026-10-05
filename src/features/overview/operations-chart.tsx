import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Layers,
  ExternalLink,
  TableProperties,
  ArrowUpRight,
  Truck,
  PoundSterling,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/use-live-data";
import { useOperations } from "@/features/core/operations-store";
import { formatMoney } from "@/lib/format";

type ChartMetric = "trips" | "volume" | "revenue";
type ChartRange = "7d" | "14d" | "30d";
type ChartStyle = "bar" | "area";

export function OperationsChart() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useStats();
  const { bookings } = useOperations();

  const [metric, setMetric] = useState<ChartMetric>("trips");
  const [range, setRange] = useState<ChartRange>("14d");
  const [chartStyle, setChartStyle] = useState<ChartStyle>("bar");
  const [showTable, setShowTable] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // ── Transform & Merge Live Data ──
  const chartData = useMemo(() => {
    const rawPoints = stats?.chartPoints || [];

    // Fallback if backend hasn't loaded points yet
    const basePoints = rawPoints.length > 0 ? rawPoints : generateFallbackPoints(bookings);

    // Filter by range
    let sliceCount = 14;
    if (range === "7d") sliceCount = 7;
    if (range === "14d") sliceCount = 14;
    if (range === "30d") sliceCount = 30;

    const sliced = basePoints.slice(-sliceCount);

    return sliced.map((pt, idx) => {
      const trips = Number(pt.trips) || 0;
      const volume = Number(pt.volume) || 0;
      const revenue = trips > 0 ? trips * 7 : 0;

      // Find matching bookings for this day to enable linking & detailed tooltips
      const dayBookings = bookings.filter((b) => {
        if (!b.moveAt) return false;
        const bDate = b.moveAt.slice(0, 10);
        return pt.date.includes(bDate) || pt.dayLabel.includes(bDate) || (pt.shortDate === "Today" && isToday(b.moveAt));
      });

      return {
        ...pt,
        index: idx,
        trips,
        volume,
        revenue,
        bookingsCount: Math.max(trips, dayBookings.length),
        dayBookings,
      };
    });
  }, [stats, bookings, range]);

  // Aggregate stats for summary metrics
  const totalTrips = useMemo(() => chartData.reduce((acc, curr) => acc + curr.trips, 0), [chartData]);
  const totalVolume = useMemo(() => chartData.reduce((acc, curr) => acc + curr.volume, 0), [chartData]);
  const totalRevenue = useMemo(() => chartData.reduce((acc, curr) => acc + curr.revenue, 0), [chartData]);
  const peakDay = useMemo(() => {
    if (!chartData.length) return null;
    return [...chartData].sort((a, b) => (metric === "trips" ? b.trips - a.trips : b.volume - a.volume))[0];
  }, [chartData, metric]);

  const activeInTransit = useMemo(
    () => bookings.filter((b) => b.status === "in_transit" || b.status === "dispatched").length,
    [bookings]
  );

  // Handle clicking on bar/point to link to Bookings
  const handlePointClick = (entry: any) => {
    if (!entry) return;
    // Navigate to bookings board with query matching the day or open bookings board
    void navigate({
      to: "/bookings",
    });
  };

  return (
    <div className="panel overflow-hidden border border-border">
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">Operations & Moving Activity</h2>
            <span className="flex items-center gap-1 rounded-full bg-live-tint px-2 py-0.5 text-[11px] font-semibold text-live-foreground">
              <span className="pulse-dot size-1.5 rounded-full bg-live" /> Live
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Daily booking dispatch, trip velocity, and platform volume across Cardiff & South Wales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric Selector */}
          <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
            <button
              onClick={() => setMetric("trips")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
                metric === "trips"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck size={13} />
              <span>Trips</span>
            </button>
            <button
              onClick={() => setMetric("volume")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
                metric === "volume"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <PoundSterling size={13} />
              <span>Volume</span>
            </button>
            <button
              onClick={() => setMetric("revenue")}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
                metric === "revenue"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp size={13} />
              <span>Fee Revenue</span>
            </button>
          </div>

          {/* Range Selector */}
          <div className="flex rounded-md border border-border bg-muted/40 p-0.5 text-xs">
            {(["7d", "14d", "30d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  range === r
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "7d" ? "7 days" : r === "14d" ? "14 days" : "30 days"}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center gap-1">
            <Button
              variant={chartStyle === "bar" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setChartStyle("bar")}
              title="Bar Chart View"
            >
              <Layers size={14} className="mr-1" /> Bars
            </Button>
            <Button
              variant={chartStyle === "area" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setChartStyle("area")}
              title="Area Trend View"
            >
              <Activity size={14} className="mr-1" /> Trend
            </Button>
            <Button
              variant={showTable ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2.5 text-xs"
              onClick={() => setShowTable(!showTable)}
              title="Toggle Data Grid"
            >
              <TableProperties size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── SUMMARY KPI STRIP ── */}
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border bg-muted/20 sm:grid-cols-4 text-xs">
        <div className="p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground">Period Total</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
            {metric === "trips"
              ? `${totalTrips} moves`
              : metric === "volume"
              ? formatMoney(totalVolume)
              : formatMoney(totalRevenue)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">In selected {range} window</p>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground">Daily Average</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
            {metric === "trips"
              ? `${(totalTrips / Math.max(chartData.length, 1)).toFixed(1)} / day`
              : metric === "volume"
              ? formatMoney(totalVolume / Math.max(chartData.length, 1))
              : formatMoney(totalRevenue / Math.max(chartData.length, 1))}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Dispatched operations</p>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground">Peak Day</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
            {peakDay ? peakDay.shortDate : "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {peakDay ? `${peakDay.trips} trips (${formatMoney(peakDay.volume)})` : "No data"}
          </p>
        </div>

        <div className="p-3.5">
          <p className="text-[11px] font-medium text-muted-foreground">Fleet in Motion</p>
          <div className="mt-1 flex items-center gap-1.5 font-mono text-lg font-semibold text-live-foreground">
            <span className="size-2 rounded-full bg-live" />
            <span>{activeInTransit} in transit</span>
          </div>
          <Link
            to="/bookings"
            className="mt-0.5 inline-flex items-center text-[10px] font-semibold text-primary hover:underline"
          >
            Open live board <ArrowUpRight size={11} className="ml-0.5" />
          </Link>
        </div>
      </div>

      {/* ── VISUAL CHART CANVAS ── */}
      <div className="relative p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartStyle === "bar" ? (
              <BarChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    handlePointClick(e.activePayload[0].payload);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="shortDate"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => (metric === "trips" ? String(val) : `£${val}`)}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 4 }}
                  content={<CustomTooltip metric={metric} />}
                />
                <Bar
                  dataKey={metric}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  className="cursor-pointer transition-opacity"
                >
                  {chartData.map((entry, index) => {
                    const isHovered = hoveredIndex === index;
                    const isTodayVal = entry.shortDate === "Today";
                    const hasValue = entry[metric] > 0;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          isTodayVal
                            ? "hsl(var(--live))"
                            : hasValue
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground) / 0.2)"
                        }
                        opacity={hoveredIndex !== null && !isHovered ? 0.6 : 1}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : (
              <AreaChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -16, bottom: 4 }}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload.length) {
                    handlePointClick(e.activePayload[0].payload);
                  }
                }}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                <XAxis
                  dataKey="shortDate"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  dy={6}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(val) => (metric === "trips" ? String(val) : `£${val}`)}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip metric={metric} />} />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                  dot={{ r: 3, fill: "hsl(var(--primary))" }}
                  activeDot={{ r: 6, fill: "hsl(var(--live))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                  className="cursor-pointer"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* ── FOOTER INTERACTIVITY CALLOUT & DIRECT LINK ── */}
        <div className="mt-4 flex flex-col gap-2 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="flex size-2 rounded-full bg-primary" />
            <span>Interactive graph: click any bar or date point to jump directly into the filtered bookings board.</span>
          </div>
          <Link
            to="/bookings"
            className="flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <span>Open Bookings Ledger</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* ── OPTIONAL DATA TABLE VIEW ── */}
      {showTable && (
        <div className="border-t border-border bg-muted/10 p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5 text-right">Dispatched Trips</th>
                  <th className="p-2.5 text-right">Customer Moving Volume</th>
                  <th className="p-2.5 text-right">Cary Platform Fee</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {chartData.map((row) => (
                  <tr key={row.date} className="hover:bg-muted/50 transition-colors">
                    <td className="p-2.5 font-medium">{row.date}</td>
                    <td className="p-2.5 text-right font-mono">{row.trips}</td>
                    <td className="p-2.5 text-right font-mono font-semibold">{formatMoney(row.volume)}</td>
                    <td className="p-2.5 text-right font-mono text-live-foreground">{formatMoney(row.revenue)}</td>
                    <td className="p-2.5 text-right">
                      <Link
                        to="/bookings"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[11px]"
                      >
                        Inspect moves <ArrowUpRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CUSTOM TOOLTIP COMPONENT ──
function CustomTooltip({ active, payload, metric }: { active?: boolean; payload?: any[]; metric: ChartMetric }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-popover/95 p-3.5 shadow-xl backdrop-blur-md text-xs text-popover-foreground min-w-[200px]">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <p className="font-semibold text-foreground">{data.date}</p>
        {data.shortDate === "Today" && (
          <span className="rounded bg-live-tint px-1.5 py-0.2 text-[10px] font-bold text-live-foreground uppercase">
            Today
          </span>
        )}
      </div>

      <div className="mt-2.5 space-y-1.5 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Trips / Moves:</span>
          <span className="font-semibold text-foreground">{data.trips}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Moving Volume:</span>
          <span className="font-semibold text-foreground">{formatMoney(data.volume)}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 pt-1 text-[11px]">
          <span className="text-muted-foreground">Cary Revenue:</span>
          <span className="font-semibold text-live-foreground">{formatMoney(data.revenue)}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded bg-muted/60 px-2 py-1 text-[10px] font-semibold text-primary">
        <span>Click to view bookings</span>
        <ArrowUpRight size={12} />
      </div>
    </div>
  );
}

// ── Fallback points generator ──
function generateFallbackPoints(bookings: any[]) {
  const points = [];
  const now = Date.now();
  const dayMs = 86400000;

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    const dayLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const shortDate = i === 0 ? "Today" : dayLabel;
    const dateStr = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

    const dayBookings = bookings.filter((b) => {
      if (!b.moveAt) return false;
      const diff = Math.floor((now - new Date(b.moveAt).getTime()) / dayMs);
      return diff === i;
    });

    const trips = dayBookings.length;
    const volume = dayBookings.reduce((sum, b) => sum + (b.total || 0), 0);

    points.push({
      date: dateStr,
      shortDate,
      dayLabel,
      trips,
      volume,
    });
  }

  return points;
}

function isToday(isoString: string): boolean {
  if (!isoString) return false;
  const today = new Date().toISOString().slice(0, 10);
  return isoString.startsWith(today);
}
