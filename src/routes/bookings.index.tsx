import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/features/core/workspace";
import { bookings } from "@/features/core/mock-data";
import { formatLondon } from "@/lib/time";
import { formatMoney } from "@/lib/format";
import { Input } from "@/components/ui/input";

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
  return (
    <Workspace title="Bookings">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="micro-label">Records</p>
          <h2 className="mt-1 text-2xl font-semibold">Bookings <span className="font-mono text-base text-muted-foreground">{bookings.length}</span></h2>
        </div>
        <Button disabled title="Creating a booking needs the connected back office"><Plus />Create booking</Button>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="sm">All</Button>
        {["Intake", "Quoting", "Awaiting payment", "Booked", "In transit"].map((tab) => (
          <Button key={tab} variant="outline" size="sm">{tab}</Button>
        ))}
      </div>
      
      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search ref, customer or postcode" />
      </div>
      
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
            {bookings.map((booking) => (
              <tr key={booking.ref} className="hover:bg-muted">
                <td className="px-5 py-4">
                  <Link to="/bookings/$ref" params={{ ref: booking.ref }} className="font-mono text-xs font-semibold text-primary hover:underline">
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
                  <Button asChild size="sm" variant="outline">
                    <Link to="/bookings/$ref/assign" params={{ ref: booking.ref }}>
                      {booking.mover ? "Reassign" : "Assign"}
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Workspace>
  );
}
