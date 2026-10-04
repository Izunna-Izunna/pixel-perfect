import { createFileRoute } from "@tanstack/react-router";
import { CircleAlert, Clock3 } from "lucide-react";
import { Workspace } from "@/features/core/workspace";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useOperations } from "@/features/core/operations-store";

export const Route = createFileRoute("/attention")({
  head: () => ({
    meta: [
      { title: "Needs Attention — Cary Mission Control" },
      { name: "description", content: "Prioritised issues requiring an operator response." },
    ],
  }),
  component: AttentionPage,
});

function AttentionPage() {
  const { attention, resolveAttention } = useOperations();

  return (
    <Workspace title="Needs attention">
      <div className="max-w-4xl">
        <p className="micro-label">Prioritised queue</p>
        <h2 className="mt-2 text-4xl font-semibold">Keep the day moving.</h2>
        <p className="mt-2 text-sm text-muted-foreground">The most urgent work is at the top. Each item has one clear next step.</p>
        <div className="mt-7 space-y-3">
          {attention.map((item) => (
            <article className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={item.id}>
              <div className={item.tone === "danger" ? "rounded-md bg-danger-tint p-2 text-danger" : item.tone === "warning" ? "rounded-md bg-warning-tint p-2 text-warning" : "rounded-md bg-muted p-2 text-muted-foreground"}>
                <CircleAlert size={20} />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{item.type}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="whitespace-nowrap text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3" />{item.waiting}</span>
                {item.action === "Redispatch" ? (
                  <Button asChild>
                    <Link to="/bookings/$ref/assign" params={{ ref: "CARY-8284" }}>Assign mover</Link>
                  </Button>
                ) : item.action === "Review" ? <Button asChild><Link to="/movers/$id" params={{ id: "megan-price" }}>Review documents</Link></Button> : (
                  <Button onClick={() => resolveAttention(item.id)}>{item.action}</Button>
                )}
              </div>
            </article>
          ))}{!attention.length && <div className="border border-border bg-card p-10 text-center"><p className="font-serif text-3xl">All clear.</p><p className="mt-2 text-sm text-muted-foreground">There is nothing waiting for an operator right now.</p></div>}
        </div>
      </div>
    </Workspace>
  );
}
