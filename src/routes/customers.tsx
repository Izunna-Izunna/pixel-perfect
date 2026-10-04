import { Link, createFileRoute } from "@tanstack/react-router";
import { Flag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookings, customers } from "@/features/core/mock-data";
import { Workspace } from "@/features/core/workspace";
import { formatMoney, maskPhone } from "@/lib/format";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Cary Mission Control" }, { name: "description", content: "Customer records and move history for Cary." }, { property: "og:title", content: "Customers — Cary Mission Control" }, { property: "og:description", content: "Customer records and move history for Cary." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return <Workspace title="Customers"><p className="micro-label">Records</p><h2 className="mt-1 text-2xl font-semibold">Customers <span className="font-mono text-base text-muted-foreground">{customers.length}</span></h2><div className="panel mt-6 overflow-hidden"><div className="divide-y divide-border">{customers.map((customer) => { const moves = bookings.filter((booking) => booking.customerId === customer.id); const spend = moves.reduce((total, booking) => total + booking.total, 0); return <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-5" key={customer.id}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground"><UserRound size={18} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Link to="/customers/$id" params={{ id: customer.id }} className="truncate text-sm font-semibold hover:text-primary">{customer.name}</Link>{customer.flags.map((flag) => <span key={flag} className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{flag}</span>)}</div><p className="mt-1 truncate text-xs text-muted-foreground">{maskPhone(customer.phone)} · {moves.length} move{moves.length === 1 ? "" : "s"} · {spend ? formatMoney(spend) : "No payment yet"}</p></div><Button asChild size="sm" variant="outline"><Link to="/customers/$id" params={{ id: customer.id }}>Open</Link></Button></article>; })}</div></div><div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-muted/50 p-4 text-xs text-muted-foreground"><Flag size={15} />Phone numbers stay masked until an operator deliberately reveals them inside a profile.</div></Workspace>;
}