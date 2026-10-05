import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ChevronRight, CircleAlert, Clock3, MapPin, MessageCircle, RefreshCw, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/features/core/workspace";
import { useOperations } from "@/features/core/operations-store";
import { formatLondon, relativeLondon } from "@/lib/time";
import { formatMoney } from "@/lib/format";
import { ChartCard, Sparkline, BarList } from "@/features/core/chart-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Cary Mission Control" },
      { name: "description", content: "Live operations dashboard for Cary removals across Cardiff and South Wales." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const [range, setRange] = useState<"today" | "week" | "month">("today"); const [chartMode, setChartMode] = useState<"trips" | "volume">("trips");
  const { attention, bookings, conversations, audit, resolveAttention } = useOperations();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayPlus3 = useMemo(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().slice(0, 10); }, []);
  const visibleBookings = useMemo(() => range === "today" ? bookings.filter((booking) => booking.moveAt.startsWith(todayStr)) : range === "week" ? bookings.filter((b) => { const d = b.moveAt.slice(0, 10); return d >= todayStr && d <= todayPlus3; }) : bookings, [bookings, range, todayStr, todayPlus3]);
  const rangeLabel = range === "today" ? "Today" : range === "week" ? "7 days" : "30 days";
  const activeBookings = bookings.filter((booking) => ["booked", "in_transit", "dispatched", "quotes_received"].includes(booking.status));
  const completedToday = bookings.filter((booking) => booking.status === "completed" && booking.moveAt.startsWith(todayStr)).length;
  const grossVolume = bookings.reduce((sum, booking) => sum + booking.total, 0);
  const feeRevenue = bookings.filter((booking) => booking.total > 0).length * 7;
  const kpis = [
    { label: "Active bookings", value: String(activeBookings.length), change: `${bookings.filter((booking) => booking.status === "in_transit").length} in transit`, detail: "Moves currently moving", tone: "live" },
    { label: "Completed today", value: String(completedToday), change: `${bookings.filter((booking) => booking.status === "booked").length} still booked`, detail: "London-day completion count", tone: "good" },
    { label: "Customer volume", value: formatMoney(grossVolume), change: `${bookings.length} total moves`, detail: "Customer totals, Cary fee included", tone: "neutral" },
    { label: "Cary fee revenue", value: formatMoney(feeRevenue), change: "£7 per paid move", detail: "Current booking ledger", tone: "good" },
  ];
  const tripRows = useMemo(() => [{ label: "Today", value: bookings.filter((booking) => booking.moveAt.startsWith(todayStr)).length, display: String(bookings.filter((booking) => booking.moveAt.startsWith(todayStr)).length) }, { label: "Next 3 days", value: bookings.filter((booking) => { const d = booking.moveAt.slice(0, 10); return d > todayStr && d <= todayPlus3; }).length, display: String(bookings.filter((booking) => { const d = booking.moveAt.slice(0, 10); return d > todayStr && d <= todayPlus3; }).length) }, { label: "Completed", value: bookings.filter((booking) => booking.status === "completed").length, display: String(bookings.filter((booking) => booking.status === "completed").length) }], [bookings, todayStr, todayPlus3]);
  const attentionAction = (item: (typeof attention)[number]) => {
    if (item.action === "Redispatch" && item.bookingRef) return <Button asChild size="sm" variant="link" className="h-auto p-0"><Link to="/bookings/$ref/assign" params={{ ref: item.bookingRef }} search={{}}>Assign mover</Link></Button>;
    if (item.action === "Review" && item.moverId) return <Button asChild size="sm" variant="link" className="h-auto p-0"><Link to="/movers/$id" params={{ id: item.moverId }}>Review documents</Link></Button>;
    if (item.action === "Send link" && item.bookingRef) return <Button asChild size="sm" variant="link" className="h-auto p-0"><Link to="/bookings/$ref" params={{ ref: item.bookingRef }} search={{}}>Open payment</Link></Button>;
    return <Button size="sm" variant="link" className="h-auto p-0" onClick={() => resolveAttention(item.id)}>{item.action}</Button>;
  };
  const now = new Date();
  const dayName = now.toLocaleDateString("en-GB", { weekday: "long" });
  const dateLabel = now.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <Workspace title="Overview">
      <section className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="micro-label">{dayName}, {dateLabel} · {rangeLabel}</p>
          <h2 className="mt-1 text-4xl font-semibold leading-none sm:text-5xl">{greeting}, Amelia.</h2>
          <p className="mt-3 text-sm text-muted-foreground">{visibleBookings.length} moves in view. <span className="font-medium text-foreground">{attention.length} need your attention.</span></p>
        </div>
        <div className="flex items-center gap-2">{(["today", "week", "month"] as const).map((period) => <Button key={period} size="sm" variant={range === period ? "default" : "outline"} onClick={() => setRange(period)}>{period === "today" ? "Today" : period === "week" ? "7 days" : "30 days"}</Button>)}</div>
      </section>

      <section className="mb-5 overflow-hidden rounded-lg border border-primary/20 bg-live-tint">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Activity size={17} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="pulse-dot size-2 rounded-full bg-live" />
              <p className="text-sm font-semibold">Pulse</p>
              <span className="rounded-full border border-live/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-live-foreground">Live</span>
            </div>
            <p className="mt-1 text-sm text-live-foreground">Scout is checking availability for Sian’s move while Dai is en route to Elin.</p>
          </div>
          <Link to="/inbox" className="text-left text-sm font-semibold text-live-foreground hover:underline">
            View live work <ChevronRight className="inline size-4" />
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="panel p-4">
            <p className="micro-label">{kpi.label}</p>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono text-2xl font-semibold tabular-nums">{kpi.value}</p>
              <span className={kpi.tone === "alert" ? "text-xs font-semibold text-danger" : kpi.tone === "live" || kpi.tone === "good" ? "text-xs font-semibold text-live-foreground" : "text-xs font-semibold text-muted-foreground"}>
                {kpi.change}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{kpi.detail}</p>
            <div className="mt-4">
              <Sparkline values={[35, 65, 42, 78, 58, 83, 69, 92]} />
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.8fr)]">
        <div className="space-y-6">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Live operations</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Today’s routes across Cardiff & South Wales</p>
              </div>
              <Button size="sm" variant={range === "today" ? "default" : "outline"} onClick={() => setRange("today")}>Next 24h</Button>
            </div>
            <div className="relative min-h-80 overflow-hidden bg-muted p-5">
              <div className="absolute inset-5 border border-border" />
              <svg viewBox="0 0 700 320" className="relative h-72 w-full" aria-label="Today’s moves map">
                <path d="M84 238 C160 80,255 220,336 126 S494 88,620 195" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeDasharray="6 7" />
                <path d="M130 85 C247 160,312 50,440 130 S537 235,640 250" fill="none" stroke="var(--live)" strokeWidth="2" strokeDasharray="6 7" />
                <circle cx="84" cy="238" r="7" fill="var(--live)" />
                <circle cx="336" cy="126" r="7" fill="var(--foreground)" />
                <circle cx="620" cy="195" r="7" fill="var(--danger)" />
                <circle cx="130" cy="85" r="7" fill="var(--foreground)" />
                <circle cx="440" cy="130" r="7" fill="var(--live)" />
              </svg>
              <div className="absolute bottom-5 left-5 border border-border bg-card p-3">
                <p className="font-mono text-xs font-semibold">CARY-8291</p>
                <p className="mt-1 text-xs text-muted-foreground">Elin Roberts · In transit</p>
              </div>
              <div className="absolute right-5 top-5 flex gap-2">
                <span className="border border-border bg-card px-2 py-1 text-[10px] font-medium">In transit</span>
                <span className="border border-border bg-card px-2 py-1 text-[10px] font-medium">Booked</span>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Today’s moves</p>
                <p className="mt-0.5 text-xs text-muted-foreground">London time</p>
              </div>
              <Link to="/bookings" className="text-xs font-semibold text-primary hover:underline">View bookings</Link>
            </div>
            <div className="divide-y divide-border">
              {visibleBookings.slice(0, 4).map((booking) => (
                <Link key={booking.ref} to="/bookings/$ref" params={{ ref: booking.ref }} search={{}} preload="intent" className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted">
                  <span className={booking.status === "in_transit" ? "grid size-8 place-items-center rounded-full bg-live-tint text-live-foreground" : "grid size-8 place-items-center rounded-full bg-muted text-muted-foreground"}>
                    <MapPin size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2">
                      <span className="font-mono text-xs font-semibold">{booking.ref}</span>
                      <span className="text-sm font-medium">{booking.customer}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{booking.route} · {booking.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold">{formatLondon(booking.moveAt)}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{relativeLondon(booking.moveAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><p className="text-sm font-semibold">Trip volume & customer volume</p><p className="mt-0.5 text-xs text-muted-foreground">Derived from the current booking ledger</p></div><div className="flex gap-1"><Button size="sm" variant={chartMode === "trips" ? "default" : "outline"} onClick={() => setChartMode("trips")}>Trips</Button><Button size="sm" variant={chartMode === "volume" ? "default" : "outline"} onClick={() => setChartMode("volume")}>Volume</Button></div></div>
            <div className="p-5"><BarList rows={chartMode === "trips" ? tripRows : [{ label: "Active moves", value: activeBookings.reduce((sum, booking) => sum + booking.total, 0), display: formatMoney(activeBookings.reduce((sum, booking) => sum + booking.total, 0)) }, { label: "All customer volume", value: grossVolume, display: formatMoney(grossVolume) }, { label: "Cary fee revenue", value: feeRevenue, display: formatMoney(feeRevenue) }]} /></div>
          </div>
        </div>
        <aside className="space-y-6">
          <div className="panel">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-sm font-semibold">Needs attention</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Four items waiting for you</p>
              </div>
              <Link to="/attention" search={{ view: "all" }} className="text-xs font-semibold text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {attention.slice(0, 3).map((item) => (
                <div className="p-4" key={item.id}>
                  <div className="flex gap-3">
                    <span className={item.tone === "danger" ? "mt-0.5 text-danger" : item.tone === "warning" ? "mt-0.5 text-warning" : "mt-0.5 text-muted-foreground"}>
                      <CircleAlert size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-5">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3" />{item.waiting}</span>
                        {attentionAction(item)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Recent activity</p>
                <p className="mt-0.5 text-xs text-muted-foreground">A calm log of today’s work</p>
              </div>
              <Link to="/notifications" className="text-xs font-semibold text-primary hover:underline">View updates</Link>
            </div>
            <ol className="mt-5 space-y-4">
              {[...audit.map((item) => item.title), "Payment received for CARY-8291", "Dai Evans marked as on the way", "Scout collected access details from James Patel", "Megan Price uploaded an insurance certificate"].slice(0, 4).map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className={index === 0 ? "mt-1 size-2 rounded-full bg-live" : "mt-1 size-2 rounded-full bg-border"} />
                  <p className="text-xs leading-5 text-muted-foreground">{item}<span className="ml-1.5 text-foreground">· {index * 9 + 6}m</span></p>
                </li>
              ))}
            </ol>
          </div>
          <div className="border border-border p-5">
            <p className="text-sm font-semibold">Nothing else needs you right now.</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">Let Scout continue the easy work while you keep the tricky moves moving.</p>
          </div>
        </aside>
      </section>
      <section className="panel mt-6 overflow-x-auto"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="text-sm font-semibold">Live trip board</p><p className="mt-0.5 text-xs text-muted-foreground">Active and upcoming moves</p></div><Link to="/bookings" className="text-xs font-semibold text-primary hover:underline">Open booking board</Link></div><table className="min-w-[780px] w-full text-left text-sm"><thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Ref</th><th className="px-5 py-3 font-medium">Customer</th><th className="px-5 py-3 font-medium">Mover</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Route</th><th className="px-5 py-3 font-medium">Fee</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead><tbody className="divide-y divide-border">{bookings.filter((booking) => ["booked", "in_transit", "payment_pending", "quotes_received"].includes(booking.status)).slice(0, 5).map((booking) => <tr key={booking.ref} className="hover:bg-muted"><td className="px-5 py-4"><Link className="font-mono text-xs font-semibold text-primary hover:underline" to="/bookings/$ref" params={{ ref: booking.ref }} search={{}}>{booking.ref}</Link></td><td className="px-5 py-4 text-xs">{booking.customer}</td><td className="px-5 py-4 text-xs">{booking.mover ?? "Searching movers"}</td><td className="px-5 py-4 text-xs capitalize">{booking.status.replace("_", " ")}</td><td className="px-5 py-4 text-xs">{booking.route}</td><td className="px-5 py-4 font-mono text-xs">{booking.total ? formatMoney(7) : "—"}</td><td className="px-5 py-4"><div className="flex gap-1"><Button asChild size="sm" variant="outline"><Link to="/bookings/$ref/assign" params={{ ref: booking.ref }} search={{}}><UserPlus />Assign</Link></Button><Button asChild size="icon" variant="ghost" aria-label={`Message ${booking.customer}`}><Link to="/inbox/$sessionId" params={{ sessionId: booking.customerId === "elin-roberts" ? "s1" : booking.customerId === "sian-morgan" ? "s3" : "s1" }}><MessageCircle /></Link></Button><Button asChild size="icon" variant="ghost" aria-label={`Redispatch ${booking.ref}`}><Link to="/bookings/$ref/assign" params={{ ref: booking.ref }} search={{}}><RefreshCw /></Link></Button></div></td></tr>)}</tbody></table></section>
      
      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Bookings per day" subtitle="Number of bookings created in the current period">
          <BarList rows={[{ label: "4 Oct", value: 8, display: "8" }, { label: "3 Oct", value: 6, display: "6" }, { label: "2 Oct", value: 5, display: "5" }]} />
        </ChartCard>
        <ChartCard title="Booking status" subtitle="Current booking mix">
          <BarList rows={[{ label: "Booked", value: 14, display: "14" }, { label: "In transit", value: 3, display: "3" }, { label: "Awaiting payment", value: 2, display: "2" }]} />
        </ChartCard>
      </section>
    </Workspace>
  );
}
