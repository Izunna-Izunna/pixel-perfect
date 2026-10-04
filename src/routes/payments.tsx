import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, LockKeyhole, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/features/core/workspace";
import { bookings } from "@/features/core/mock-data";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Cary Mission Control" },
      { name: "description", content: "Cary payment ledger and payout status." },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const handleRelease = (ref: string) => {
    toast.success(`Payout released for ${ref}`, {
      description: "Funds will be available in the mover's account in 2-3 business days.",
      icon: <CheckCircle2 className="size-4 text-live-foreground" />,
    });
  };

  return (
    <Workspace title="Payments">
      <div className="flex items-end justify-between">
        <div>
          <p className="micro-label">Money</p>
          <h2 className="mt-1 text-2xl font-semibold">Payment ledger</h2>
        </div>
        <Button onClick={() => toast.info("Payment link generator is being updated.")}>Create payment link</Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="micro-label">Held</p>
          <p className="mt-2 font-mono text-2xl font-semibold">£1,486.00</p>
        </div>
        <div className="panel p-4">
          <p className="micro-label">Released today</p>
          <p className="mt-2 font-mono text-2xl font-semibold">£867.00</p>
        </div>
        <div className="panel p-4">
          <p className="micro-label">Platform fees</p>
          <p className="mt-2 font-mono text-2xl font-semibold">£56.00</p>
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="divide-y divide-border">
          {bookings
            .filter((item) => item.total)
            .map((booking) => (
              <div className="flex flex-wrap items-center gap-4 p-5" key={booking.ref}>
                <span className="grid size-9 place-items-center rounded-full bg-live-tint text-live-foreground">
                  <CreditCard size={17} />
                </span>
                <div className="flex-1">
                  <p className="font-mono text-xs font-semibold">PAY-{booking.ref.slice(5)}A</p>
                  <p className="mt-1 text-sm">
                    {booking.ref} · {booking.customer}
                  </p>
                </div>
                <div>
                  <p className="micro-label">Customer total</p>
                  <p className="mt-1 font-mono text-sm font-semibold">{formatMoney(booking.total)}</p>
                </div>
                <div>
                  <p className="micro-label">Mover payout</p>
                  <p className="mt-1 font-mono text-sm font-semibold">{formatMoney(booking.total - 7)}</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-live/20 bg-live-tint px-2 py-1 text-[10px] font-semibold text-live-foreground">
                  <LockKeyhole size={12} />
                  Held
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default" onClick={() => handleRelease(booking.ref)}>
                    Release
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/payments/$id/refund" params={{ id: `PAY-${booking.ref.slice(5)}A` }}>
                      Refund
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </Workspace>
  );
}
