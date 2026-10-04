import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, LoaderCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOperations } from "@/features/core/operations-store";
import { Workspace } from "@/features/core/workspace";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/payments/$id/refund")({
  head: () => ({ meta: [{ title: "Refund payment — Cary Mission Control" }, { name: "description", content: "Review, preview and confirm a Cary customer refund." }, { property: "og:title", content: "Refund payment — Cary Mission Control" }, { property: "og:description", content: "Review, preview and confirm a Cary customer refund." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: RefundPage,
});

function RefundPage() {
  const { id } = Route.useParams();
  const { bookings, refundPayment } = useOperations();
  const booking = bookings.find((item) => `PAY-${item.ref.slice(5)}A` === id);
  const [full, setFull] = useState(true);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("goodwill");
  const [note, setNote] = useState("");
  const [fee, setFee] = useState(true);
  const [payout, setPayout] = useState("hold");
  const [word, setWord] = useState("");
  const [holding, setHolding] = useState(false);
  const [result, setResult] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  if (!booking) return <Workspace title="Refund payment"><p className="text-sm text-muted-foreground">This payment is unavailable or was already refunded.</p></Workspace>;

  const maximum = booking.total;
  const refund = full ? maximum : Math.min(Math.max(Number(amount) || 0, 0), maximum);
  const ready = word === "REFUND" && note.trim().length > 0 && refund > 0;
  const stopRefund = () => { if (timer.current) window.clearTimeout(timer.current); timer.current = null; setHolding(false); };
  const startRefund = () => {
    if (!ready) return;
    setHolding(true);
    timer.current = window.setTimeout(() => { refundPayment(booking.ref, refund, note); setHolding(false); setResult(true); }, 800);
  };

  if (result) return <Workspace title="Refund recorded"><div className="mx-auto max-w-xl py-8"><div className="border border-border bg-card p-6"><span className="grid size-10 place-items-center rounded-full bg-live-tint text-live-foreground"><CheckCircle2 /></span><p className="micro-label mt-5">Mock refund recorded</p><h2 className="mt-1 text-2xl font-semibold">{formatMoney(refund)} is recorded against {booking.customer}.</h2><p className="mt-2 text-sm text-muted-foreground">This workspace has updated the booking, payment ledger, attention queue and notification feed. No live payment provider was contacted.</p><div className="mt-6 flex gap-2"><Button asChild><Link to="/payments">Return to payments</Link></Button><Button asChild variant="outline"><Link to="/bookings/$ref" params={{ ref: booking.ref }}>Open booking</Link></Button></div></div></div></Workspace>;

  return <Workspace title="Refund payment"><div className="mx-auto max-w-6xl"><div className="flex items-center gap-2"><Button asChild size="icon" variant="ghost" aria-label="Back to payments"><Link to="/payments"><ChevronLeft /></Link></Button><div><p className="micro-label">Money · {id}</p><h2 className="mt-1 text-2xl font-semibold">Review this refund carefully.</h2></div></div><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><section className="space-y-6"><div className="border border-border bg-card p-5"><p className="micro-label">Payment context</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><Info label="Booking" value={booking.ref} /><Info label="Customer" value={booking.customer} /><Info label="Mover" value={booking.mover ?? "Unassigned"} /><Info label="Payment status" value="Held" /><Info label="Amount paid" value={formatMoney(maximum)} /><Info label="Cary fee" value={formatMoney(7)} /><Info label="Mover payout" value={formatMoney(Math.max(0, maximum - 7))} /><Info label="Prior refunds" value="£0.00" /></div><p className="mt-4 text-xs text-muted-foreground">Simulated payment-provider reference. Live refund processing is not connected.</p></div><div className="border border-border bg-card p-5"><p className="micro-label">Refund details</p><div className="mt-4 flex gap-2"><Button variant={full ? "default" : "outline"} onClick={() => setFull(true)}>Full refund</Button><Button variant={!full ? "default" : "outline"} onClick={() => { setFull(false); setAmount(String(maximum)); }}>Partial refund</Button></div>{!full ? <label className="mt-4 block text-sm font-medium">Amount <Input className="mt-1 font-mono" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /><span className="mt-1 block text-xs text-muted-foreground">Maximum refundable: {formatMoney(maximum)}</span></label> : null}<label className="mt-4 block text-sm font-medium">Reason <select className="mt-1 h-9 w-full border border-input bg-background px-3 text-sm" value={reason} onChange={(event) => setReason(event.target.value)}>{["no_show", "damaged_item", "mover_delay", "price_dispute", "duplicate", "goodwill", "other"].map((option) => <option key={option}>{option}</option>)}</select></label><label className="mt-4 block text-sm font-medium">Operator note <textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 min-h-24 w-full border border-input bg-background p-3 text-sm" placeholder="Explain the decision for the audit log" /></label><label className="mt-4 flex items-center gap-2 text-sm"><input checked={fee} type="checkbox" className="accent-[var(--live)]" onChange={(event) => setFee(event.target.checked)} />Refund the Cary £7 fee</label><label className="mt-4 block text-sm font-medium">Mover payout <select className="mt-1 h-9 w-full border border-input bg-background px-3 text-sm" value={payout} onChange={(event) => setPayout(event.target.value)}><option value="hold">Hold payout</option><option value="reduce">Reduce payout</option><option value="leave">Leave payout unchanged</option></select></label></div></section><aside className="border border-border bg-card p-5 lg:sticky lg:top-24 lg:h-fit"><p className="micro-label">Preview and confirm</p><div className="mt-4 space-y-3 border-y border-border py-4"><Info label="Mock refund" value={`${formatMoney(refund)} · recorded immediately`} /><Info label="Payout impact" value={payout === "hold" ? "Payout will remain on hold" : payout === "reduce" ? "Mover payout will be reduced" : "Payout is unchanged"} /><Info label="Ledger" value={`${fee ? "Fee included" : "Fee retained"} · customer refund`} /></div><div className="mt-4"><p className="text-xs font-semibold">Customer message preview</p><p className="mt-2 border border-border bg-muted p-3 text-xs leading-5">We’ve recorded a refund of {formatMoney(refund)} for your Cary booking in this mock workspace.</p>{payout !== "leave" ? <p className="mt-3 text-xs text-muted-foreground"><Send className="mr-1 inline size-3" />A mover update is recorded because the payout is changing.</p> : null}</div><label className="mt-5 block text-xs font-semibold">Type REFUND to continue <Input value={word} onChange={(event) => setWord(event.target.value.toUpperCase())} className="mt-2 font-mono" placeholder="REFUND" /></label><Button disabled={!ready || holding} className="mt-4 w-full lg:sticky lg:bottom-4" onPointerDown={startRefund} onPointerUp={stopRefund} onPointerLeave={stopRefund} onKeyDown={(event) => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); startRefund(); } }} onKeyUp={stopRefund}>{holding ? <><LoaderCircle className="animate-spin" />Confirming…</> : "Hold to confirm refund"}</Button><p className="mt-2 text-center text-[11px] text-muted-foreground">Hold for 0.8 seconds, or press and hold Space/Enter.</p></aside></div></div></Workspace>;
}

function Info({ label, value }: { label: string; value: string }) { return <div><p className="micro-label">{label}</p><p className="mt-1 text-sm font-medium">{value}</p></div>; }
