import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/core/status-badge";
import { Workspace } from "@/features/core/workspace";
import { useOperations } from "@/features/core/operations-store";

export const Route = createFileRoute("/_authenticated/movers/")({
  head: () => ({ meta: [{ title: "Movers — Cary Mission Control" }, { name: "description", content: "Verified mover records for Cary operations." }, { property: "og:title", content: "Movers — Cary Mission Control" }, { property: "og:description", content: "Verified mover records for Cary operations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MoversPage,
});

function MoversPage() {
  const { conversations, movers, addMover } = useOperations();
  return (
    <Workspace title="Movers">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="micro-label">Records</p>
          <h2 className="mt-1 text-2xl font-semibold">Movers <span className="font-mono text-base text-muted-foreground">{movers.length}</span></h2>
        </div>
        <Button onClick={addMover}>Add mock mover</Button>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-border bg-muted/45">
              <tr className="text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Mover</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Fleet</th>
                <th className="px-4 py-3 text-right">Jobs</th>
                <th className="px-4 py-3 text-right">Rating</th>
                <th className="px-5 py-3 text-right">Quick actions</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((mover) => {
                const conversation = conversations.find((item) => item.role === "Mover" && item.contactId === mover.id);
                const needsReview = mover.status === "pending_verification";

                return (
                  <tr className="border-b border-border last:border-0 hover:bg-muted/35" key={mover.id}>
                    <td className="px-5 py-4">
                      <Link to="/movers/$id" params={{ id: mover.id }} className="flex items-center gap-3 font-semibold hover:text-primary">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-live-tint text-live-foreground"><Truck size={17} /></span>
                        <span>
                          <span className="block">{mover.name}</span>
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{mover.businessName}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4"><StatusBadge status={mover.status} /></td>
                    <td className="max-w-64 px-4 py-4 text-xs text-muted-foreground">{mover.vehicles.join(", ")}</td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums">{mover.jobsCompleted}</td>
                    <td className="px-4 py-4 text-right font-mono tabular-nums">{mover.rating ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant={needsReview ? "default" : "secondary"}>
                          <Link to="/movers/$id" params={{ id: mover.id }}>
                            {needsReview ? <ShieldCheck size={15} /> : <ArrowUpRight size={15} />}
                            {needsReview ? "Review" : "Open"}
                          </Link>
                        </Button>
                        {conversation ? (
                          <Button asChild size="sm" variant="outline">
                            <Link to="/inbox/$sessionId" params={{ sessionId: conversation.id }}>
                              <MessageCircle size={15} /> Message
                            </Link>
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled title="No conversation exists for this mover yet">
                            <MessageCircle size={15} /> Message
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Workspace>
  );
}