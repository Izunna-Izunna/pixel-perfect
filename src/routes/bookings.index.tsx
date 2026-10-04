import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownUp, MessageCircle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/features/core/workspace";
import { formatLondon } from "@/lib/time";
import { formatMoney } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useOperations } from "@/features/core/operations-store";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "Bookings — Cary Mission Control" },
      { name: "description", content: "Cary booking records and dispatch pipeline." },
    ],
  }),
  component: BookingList,
});

function BookingList() {
  const [query, setQuery] = useState(""); const [tab, setTab] = useState("All"); const [region, setRegion] = useState("All regions"); const [mover, setMover] = useState("All movers"); const [sort, setSort] = useState<"time" | "money">("time"); const { bookings, conversations, createBooking } = useOperations();
  const tabStatus: Record<string, string[]> = { All: [], Intake: ["draft"], Quoting: ["dispatched", "quotes_received", "quote_accepted"], "Awaiting payment": ["payment_pending"], Booked: ["booked"], "In transit": ["in_transit"], Completed: ["completed"], Cancelled: ["cancelled"] };
  const allowedStatuses = tabStatus[tab] ?? [];
  const movers = Array.from(new Set(bookings.map((booking) => booking.mover).filter(Boolean))) as string[];
  const regions = Array.from(new Set(bookings.map((booking) => booking.route.split(" ")[0])));
  const filtered = bookings.filter((booking) => `${booking.ref} ${booking.customer} ${booking.route}`.toLowerCase().includes(query.toLowerCase()) && (!allowedStatuses.length || allowedStatuses.includes(booking.status)) && (mover === "All movers" || booking.mover === mover) && (region === "All regions" || booking.route.startsWith(region))).sort((a, b) => sort === "money" ? b.total - a.total : a.moveAt.localeCompare(b.moveAt));
  return (
    <Workspace title="Bookings">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="micro-label">Records</p>
          <h2 className="mt-1 text-2xl font-semibold">Bookings <span className="font-mono text-base text-muted-foreground">{bookings.length}</span></h2>
        </div>
        <Button variant="outline" onClick={createBooking}><Plus />Create booking</Button>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm" variant={tab === "All" ? "default" : "outline"} onClick={() => setTab("All")}>All</Button>
        {["Intake", "Quoting", "Awaiting payment", "Booked", "In transit", "Completed", "Cancelled"].map((item) => (
          <Button key={item} variant={tab === item ? "default" : "outline"} size="sm" onClick={() => setTab(item)}>{item}</Button>
        ))}
      </div>
      
      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search ref, customer or postcode" />
      </div><div className="flex flex-wrap gap-2"><select aria-label="Filter by pickup region" className="h-10 border border-input bg-background px-3 text-sm" value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by mover" className="h-10 border border-input bg-background px-3 text-sm" value={mover} onChange={(event) => setMover(event.target.value)}><option>All movers</option>{movers.map((item) => <option key={item}>{item}</option>)}</select><Button size="sm" variant="outline" onClick={() => setSort(sort === "time" ? "money" : "time")}><ArrowDownUp />{sort === "time" ? "Move time" : "Customer total"}</Button></div></div>
      
      <div className="panel mt-5 overflow-x-auto">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Booking</th>
              <th className="px-5 py-3 font-medium">Route</th>
              <th className="px-5 py-3 font-medium">Move time</th>
              <th className="px-5 py-3 font-medium">Mover</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((booking) => (
              <tr key={booking.ref} className="hover:bg-muted">
                <td className="px-5 py-4">
                  <Link to="/bookings/$ref" params={{ ref: booking.ref }} search={{}} className="font-mono text-xs font-semibold text-primary hover:underline">
                    {booking.ref}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">{booking.customer}</p>
                </td>
                <td className="px-5 py-4 text-xs">{booking.route}</td>
                <td className="px-5 py-4 text-xs">{formatLondon(booking.moveAt)}</td>
                <td className="px-5 py-4 text-xs">
                  {booking.mover ?? <span className="text-muted-foreground">Unassigned</span>}
                </td>
                <td className="px-5 py-4 font-mono text-xs">
                  {booking.total ? formatMoney(booking.total) : "—"}
                </td>
                <td className="px-5 py-4">
                  <span className={
                    booking.status === "in_transit" 
                      ? "status-live rounded-full border px-2 py-1 text-[10px] font-semibold" 
                      : booking.status === "payment_pending" 
                        ? "status-warning rounded-full border px-2 py-1 text-[10px] font-semibold" 
                        : "rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                  }>
                    {booking.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1"><Button asChild size="sm" variant="outline"><Link to="/bookings/$ref/assign" params={{ ref: booking.ref }} search={{}}>{booking.mover ? "Reassign" : "Assign"}</Link></Button>{conversations.find((conversation) => conversation.contactId === booking.customerId) ? <Button asChild size="icon" variant="ghost" aria-label={`Message ${booking.customer}`}><Link to="/inbox/$sessionId" params={{ sessionId: conversations.find((conversation) => conversation.contactId === booking.customerId)?.id ?? "" }}><MessageCircle /></Link></Button> : <Button size="icon" variant="ghost" aria-label={`No conversation for ${booking.customer}`} disabled><MessageCircle /></Button>}</div>
                </td>
              </tr>
            ))}{!filtered.length && <tr><td className="px-5 py-12 text-center text-sm text-muted-foreground" colSpan={7}>No bookings match this view.</td></tr>}
          </tbody>
        </table>
      </div>
    </Workspace>
  );
}
