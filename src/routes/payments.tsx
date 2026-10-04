import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, LockKeyhole } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
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
  const [releaseFor, setReleaseFor] = useState<string | null>(null);
  const [word, setWord] = useState("");
  const [holding, setHolding] = useState(false);
  const [released, setReleased] = useState<string[]>([]);
  const selected = bookings.find((item) => item.ref === releaseFor);
  const confirmRelease = () => {
    if (!selected || word !== "RELEASE") return;
    setHolding(true);
    window.setTimeout(() => { setReleased((items) => [...items, selected.ref]); setReleaseFor(null); setWord(""); setHolding(false); }, 800);
  };

  return (
    <Workspace title="Payments">
      <div className="flex items-end justify-between">
        <div>
          <p className="micro-label">Money</p>
          <h2 className="mt-1 text-2xl font-semibold">Payment ledger</h2>
        </div>
        <Button disabled title="Payment link creation needs the connected payment service">Create payment link</Button>
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
                {released.includes(booking.ref) ? <span className="flex items-center gap-1.5 rounded-full border border-live/20 bg-live-tint px-2 py-1 text-[10px] font-semibold text-live-foreground">Released</span> : <span className="flex items-center gap-1.5 rounded-full border border-live/20 bg-live-tint px-2 py-1 text-[10px] font-semibold text-live-foreground"><LockKeyhole size={12} />Held</span>}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="default" disabled={released.includes(booking.ref)} onClick={() => setReleaseFor(booking.ref)}>{released.includes(booking.ref) ? "Released" : "Release"}</Button>
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
      {selected ? <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/20 p-4"><section className="w-full max-w-md border border-border bg-card p-6 shadow-sm" role="dialog" aria-modal="true" aria-labelledby="release-title"><p className="micro-label">Release mover payout</p><h2 id="release-title" className="mt-2 text-xl font-semibold">Release {formatMoney(selected.total - 7)} to {selected.mover ?? "the assigned mover"}?</h2><p className="mt-3 text-sm text-muted-foreground">This marks the held payout for {selected.ref} as released in the Cary ledger. The live payment provider is not connected in mock mode.</p><label className="mt-5 block text-sm font-medium">Type RELEASE to continue<input value={word} onChange={(event) => setWord(event.target.value.toUpperCase())} className="mt-2 h-10 w-full border border-input bg-background px-3 font-mono text-sm" placeholder="RELEASE" /></label><div className="mt-5 flex gap-2"><Button variant="outline" onClick={() => { setReleaseFor(null); setWord(""); }}>Cancel</Button><Button disabled={word !== "RELEASE" || holding} onPointerDown={confirmRelease} onPointerUp={() => setHolding(false)} onPointerLeave={() => setHolding(false)}>{holding ? "Releasing…" : "Hold to release"}</Button></div><p className="mt-2 text-xs text-muted-foreground">Hold for 0.8 seconds to confirm.</p></section></div> : null}
    </Workspace>
  );
}
