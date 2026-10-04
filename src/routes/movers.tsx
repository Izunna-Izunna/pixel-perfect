import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Workspace } from "@/features/core/workspace";
import { Button } from "@/components/ui/button";

const movers = [
  { name: "Dai Evans", phone: "+44 7•• ••• 1234", vehicles: "Luton van, Transit", status: "Verified", jobs: 48, rating: "4.9" },
  { name: "Megan Price", phone: "+44 7•• ••• 6721", vehicles: "Transit Custom", status: "Pending verification", jobs: 0, rating: "—" },
  { name: "Gower Vans", phone: "+44 7•• ••• 0918", vehicles: "Luton van", status: "Verified", jobs: 76, rating: "4.8" },
  { name: "Vale Moves", phone: "+44 7•• ••• 8173", vehicles: "Sprinter", status: "Suspended", jobs: 12, rating: "4.4" }
];

export const Route = createFileRoute("/movers")({
  head: () => ({
    meta: [
      { title: "Movers — Cary Mission Control" },
      { name: "description", content: "Verified mover records for Cary operations." },
    ],
  }),
  component: MoversPage,
});

function MoversPage() {
  const mockAction = (name: string) => toast.success(`${name} feature coming soon!`);

  return (
    <Workspace title="Movers">
      <div className="flex items-end justify-between">
        <div>
          <p className="micro-label">Records</p>
          <h2 className="mt-1 text-2xl font-semibold">Movers <span className="font-mono text-base text-muted-foreground">15</span></h2>
        </div>
        <Button onClick={() => mockAction("Add mover")}>Add mover</Button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {movers.map((mover) => (
          <article className="panel p-5" key={mover.name}>
            <div className="flex justify-between gap-4">
              <span className="grid size-10 place-items-center rounded-full bg-live-tint text-live-foreground">
                <Truck size={19} />
              </span>
              <span className={mover.status === "Verified" ? "status-live rounded-full border px-2 py-1 text-[10px] font-semibold" : mover.status === "Suspended" ? "status-danger rounded-full border px-2 py-1 text-[10px] font-semibold" : "status-warning rounded-full border px-2 py-1 text-[10px] font-semibold"}>
                {mover.status}
              </span>
            </div>
            <h3 className="mt-4 text-base font-semibold">{mover.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{mover.phone}</p>
            <p className="mt-4 text-xs text-muted-foreground">{mover.vehicles}</p>
            <div className="mt-5 flex border-t border-border pt-4">
              <div className="flex-1">
                <p className="micro-label">Jobs</p>
                <p className="mt-1 text-sm font-semibold">{mover.jobs}</p>
              </div>
              <div className="flex-1">
                <p className="micro-label">Rating</p>
                <p className="mt-1 text-sm font-semibold">{mover.rating}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary font-semibold" onClick={() => mockAction(`Open ${mover.name}`)}>
                Open
              </Button>
            </div>
            {mover.status === "Pending verification" && (
              <div className="mt-4 flex items-center gap-2 rounded-md bg-warning-tint p-2 text-xs text-warning">
                <ShieldCheck size={14} />Insurance awaiting review
              </div>
            )}
          </article>
        ))}
      </div>
    </Workspace>
  );
}
