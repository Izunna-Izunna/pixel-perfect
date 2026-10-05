import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, ReceiptText } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOperations } from "@/features/core/operations-store";
import { Workspace } from "@/features/core/workspace";
import { formatMoney } from "@/lib/format";
import { formatLondon } from "@/lib/time";

export const Route = createFileRoute("/_authenticated/quotes/new")({
  validateSearch: (search: Record<string, unknown>) => ({ booking: typeof search["booking"] === "string" ? search["booking"] : undefined }),
  head: () => ({ meta: [{ title: "Create quote — Cary Mission Control" }, { name: "description", content: "Create an itemised Cary removal quote with a fixed £7 platform fee." }, { property: "og:title", content: "Create quote — Cary Mission Control" }, { property: "og:description", content: "Create an itemised Cary removal quote with a fixed £7 platform fee." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: QuoteTool,
});

const vans = ["Small van", "Medium van", "Large van", "Luton van", "Luton with tail lift", "Box truck"];
const help = ["Driver only", "Driver + 1 helper", "Driver + 2 helpers"];
const access = ["Ground floor", "1st floor", "2nd floor+ without lift"];

function QuoteTool() {
  const { booking: bookingRef } = Route.useSearch();
  const { bookings, movers, recordQuote, preparePayment } = useOperations();
  const booking = bookings.find((item) => item.ref === bookingRef) ?? bookings.find((item) => item.status === "quotes_received") ?? bookings[0];
  const [moverId, setMoverId] = useState(booking?.moverId ?? "");
  const [pickup, setPickup] = useState(booking?.route.split(" → ")[0] ?? "");
  const [dropoff, setDropoff] = useState(booking?.route.split(" → ")[1] ?? "");
  const [vanSize, setVanSize] = useState("Medium van");
  const [loadingHelp, setLoadingHelp] = useState("Driver + 1 helper");
  const [accessInfo, setAccessInfo] = useState("Ground floor");
  const [items, setItems] = useState(booking?.items ?? "");
  const [payout, setPayout] = useState(booking?.total && booking.total > 7 ? String(booking.total - 7) : "95");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paymentPrepared, setPaymentPrepared] = useState(false);
  const mover = movers.find((item) => item.id === moverId);
  const moverPayout = Math.max(0, Number(payout) || 0);
  const total = moverPayout + 7;
  const quote = useMemo(() => ({ bookingRef: booking?.ref ?? "", moverId: mover?.id ?? null, moverName: mover?.name ?? null, payout: moverPayout, vanSize, loadingHelp, access: accessInfo, pickup, dropoff, items, note, status: "submitted" as const }), [accessInfo, booking?.ref, dropoff, items, loadingHelp, mover?.id, mover?.name, moverPayout, note, pickup, vanSize]);

  if (!booking) return <Workspace title="Create quote"><p className="text-sm text-muted-foreground">There is no booking available for a manual quote.</p></Workspace>;
  function submitQuote() { recordQuote(quote); setSubmitted(true); }
  function prepareLink() { if (!booking) return; if (!submitted) { recordQuote(quote); setSubmitted(true); } preparePayment(booking.ref); setPaymentPrepared(true); }
  const customerPreview = `Hi ${booking.customer.split(" ")[0]}! 🎉 Great news! A verified mover is available for your move:\n\n📍 Route: ${pickup} ➔ ${dropoff}\n📅 Date: ${formatLondon(booking.moveAt)}\n🚚 Service: ${vanSize} (${loadingHelp})\n📦 Items: ${items || "Move details"}\n\n💰 Total Price: ${formatMoney(total)} (Includes ${formatMoney(moverPayout)} mover payout + £7 Cary booking fee)\n\nTap below to view details, accept, or lock in your move:`;

  return <Workspace title="Create quote"><div className="mx-auto max-w-7xl"><div><p className="micro-label">Manual quote · {booking.ref}</p><h2 className="mt-1 text-2xl font-semibold">Create or override a removal quote.</h2><p className="mt-2 text-sm text-muted-foreground">The mover receives 100% of their quoted payout. Cary’s platform fee is fixed at £7.00.</p></div><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="border border-border bg-card p-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Pickup postcode / area"><Input value={pickup} onChange={(event) => setPickup(event.target.value)} /></Field><Field label="Drop-off postcode / area"><Input value={dropoff} onChange={(event) => setDropoff(event.target.value)} /></Field><SelectField label="Van size" value={vanSize} onChange={setVanSize} options={vans} /><SelectField label="Loading assistance" value={loadingHelp} onChange={setLoadingHelp} options={help} /><SelectField label="Access / stairs" value={accessInfo} onChange={setAccessInfo} options={access} /><Field label="Mover net payout"><Input inputMode="decimal" value={payout} onChange={(event) => setPayout(event.target.value)} /></Field><Field label="Assigned mover"><select value={moverId} onChange={(event) => setMoverId(event.target.value)} className="h-10 w-full border border-input bg-background px-3 text-sm"><option value="">Choose a mover</option>{movers.filter((item) => item.status === "verified").map((item) => <option value={item.id} key={item.id}>{item.businessName}</option>)}</select></Field><Field label="Item details"><Input value={items} onChange={(event) => setItems(event.target.value)} /></Field></div><label className="mt-5 block text-sm font-medium">Operator note<textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-24 w-full border border-input bg-background p-3 text-sm" placeholder="Special handling, availability or agreed terms" /></label></section><aside className="border border-border bg-card p-5 lg:sticky lg:top-24 lg:h-fit"><div className="flex items-center gap-2"><ReceiptText className="size-4 text-live-foreground" /><p className="text-sm font-semibold">Itemised customer price</p></div><div className="mt-5 space-y-3 border-y border-border py-4 text-sm"><Row label="Transport & removals service" value={formatMoney(moverPayout)} /><Row label="Cary platform booking fee" value={formatMoney(7)} /><Row label="Customer total" value={formatMoney(total)} /></div>{!mover && <p className="mt-3 text-xs text-warning">Choose a verified mover before submitting this quote.</p>}<Button disabled={!mover || !pickup.trim() || !dropoff.trim() || !items.trim() || moverPayout <= 0} className="mt-5 w-full" onClick={submitQuote}><CheckCircle2 />Record quote</Button><Button disabled={!mover || moverPayout <= 0} className="mt-2 w-full" variant="outline" onClick={prepareLink}><MessageCircle />Prepare payment hand-off</Button></aside></div><section className="mt-6 border border-border bg-card p-5"><p className="micro-label">Customer message preview</p><pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6">{customerPreview}</pre>{submitted && <p role="status" className="mt-5 border border-live/30 bg-live-tint p-3 text-sm text-live-foreground">Quote recorded against {booking.ref}.</p>}{paymentPrepared && <p role="status" className="mt-3 border border-border bg-muted p-3 text-sm">An itemised payment-link hand-off is prepared for this quote. <Link className="font-medium underline" to="/inbox">Open the conversation to send the approved quote template.</Link></p>}</section></div></Workspace>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium">{label}<div className="mt-2">{children}</div></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) { return <label className="block text-sm font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full border border-input bg-background px-3 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select></label>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><strong className="font-mono whitespace-nowrap">{value}</strong></div>; }