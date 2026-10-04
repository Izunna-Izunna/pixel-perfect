import { Link, createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { movers } from "@/features/core/mock-data";
import { StatusBadge } from "@/features/core/status-badge";
import { Workspace } from "@/features/core/workspace";

export const Route = createFileRoute("/movers/")({
  head: () => ({ meta: [{ title: "Movers — Cary Mission Control" }, { name: "description", content: "Verified mover records for Cary operations." }, { property: "og:title", content: "Movers — Cary Mission Control" }, { property: "og:description", content: "Verified mover records for Cary operations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MoversPage,
});

function MoversPage() {
  return <Workspace title="Movers"><div className="flex items-end justify-between"><div><p className="micro-label">Records</p><h2 className="mt-1 text-2xl font-semibold">Movers <span className="font-mono text-base text-muted-foreground">{movers.length}</span></h2></div><Button disabled title="Adding a mover needs the connected back office">Add mover</Button></div><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{movers.map((mover) => <article className="panel p-5" key={mover.id}><div className="flex justify-between gap-4"><span className="grid size-10 place-items-center rounded-full bg-live-tint text-live-foreground"><Truck size={19} /></span><StatusBadge status={mover.status} /></div><Link to="/movers/$id" params={{ id: mover.id }} className="mt-4 block text-base font-semibold hover:text-primary">{mover.name}</Link><p className="mt-1 text-xs text-muted-foreground">{mover.businessName}</p><p className="mt-4 text-xs text-muted-foreground">{mover.vehicles.join(", ")}</p><div className="mt-5 flex items-end border-t border-border pt-4"><div className="flex-1"><p className="micro-label">Jobs</p><p className="mt-1 text-sm font-semibold">{mover.jobsCompleted}</p></div><div className="flex-1"><p className="micro-label">Rating</p><p className="mt-1 text-sm font-semibold">{mover.rating ?? "—"}</p></div><Button asChild size="sm" variant="link"><Link to="/movers/$id" params={{ id: mover.id }}>Open</Link></Button></div>{mover.status === "pending_verification" && <div className="mt-4 flex items-center gap-2 rounded-md bg-warning-tint p-2 text-xs text-warning"><ShieldCheck size={14} />Documents awaiting review</div>}</article>)}</div></Workspace>;
}