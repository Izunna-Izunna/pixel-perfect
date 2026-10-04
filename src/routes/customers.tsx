import { createFileRoute } from "@tanstack/react-router";
import { Flag, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Workspace } from "@/features/core/workspace";
import { Button } from "@/components/ui/button";

const customers = [
  { name: "Elin Roberts", phone: "+44 7•• ••• 1082", moves: 4, spend: "£512.00", tag: "Repeat" },
  { name: "James Patel", phone: "+44 7•• ••• 2884", moves: 1, spend: "£129.00", tag: "" },
  { name: "Sian Morgan", phone: "+44 7•• ••• 7894", moves: 0, spend: "—", tag: "" },
  { name: "Bethan Lewis", phone: "+44 7•• ••• 9903", moves: 2, spend: "£348.00", tag: "VIP" }
];

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Cary Mission Control" },
      { name: "description", content: "Customer records and move history for Cary." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const mockAction = (name: string) => toast.success(`${name} feature coming soon!`);

  return (
    <Workspace title="Customers">
      <p className="micro-label">Records</p>
      <h2 className="mt-1 text-2xl font-semibold">Customers <span className="font-mono text-base text-muted-foreground">25</span></h2>
      <div className="panel mt-6 overflow-hidden">
        <div className="divide-y divide-border">
          {customers.map((customer) => (
            <article className="flex flex-wrap items-center gap-4 p-5" key={customer.name}>
              <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground">
                <UserRound size={18} />
              </span>
              <div className="min-w-40 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{customer.name}</h3>
                  {customer.tag && <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{customer.tag}</span>}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{customer.phone}</p>
              </div>
              <div>
                <p className="micro-label">Moves</p>
                <p className="mt-1 text-sm font-semibold">{customer.moves}</p>
              </div>
              <div className="min-w-24"><p className="micro-label">Total spend</p><p className="mt-1 font-mono text-sm font-semibold">{customer.spend}</p></div>
              <Button variant="outline" size="sm" onClick={() => mockAction(`Open ${customer.name}`)}>
                Open record
              </Button>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-muted/50 p-4 text-xs text-muted-foreground">
        <Flag size={15} />Phone numbers stay masked until an operator deliberately reveals them inside a profile.
      </div>
    </Workspace>
  );
}
