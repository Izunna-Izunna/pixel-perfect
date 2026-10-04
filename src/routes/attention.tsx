import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleAlert, Clock3, ExternalLink, FileClock, Send } from "lucide-react";
import { Workspace } from "@/features/core/workspace";
import { Button } from "@/components/ui/button";
import { useOperations } from "@/features/core/operations-store";
import { formatLondon } from "@/lib/time";

export const Route = createFileRoute("/attention")({
  validateSearch: (search: Record<string, unknown>) => ({
    view: search["view"] === "urgent" || search["view"] === "today" || search["view"] === "reminders" ? search["view"] : "all",
  } as { view: "all" | "urgent" | "today" | "reminders" }),
  head: () => ({
    meta: [
      { title: "Needs Attention — Cary Mission Control" },
      { name: "description", content: "Prioritised issues requiring an operator response." },
      { property: "og:title", content: "Needs Attention — Cary Mission Control" },
      { property: "og:description", content: "Prioritised issues and scheduled follow-up for Cary operators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AttentionPage,
});

function AttentionPage() {
  const { attention, reminders, resolveAttention, sendReminder } = useOperations();
  const { view } = Route.useSearch();
  const dueReminders = reminders.filter((item) => item.status === "scheduled");
  const urgentItems = attention.filter((item) => item.tone === "danger" || item.tone === "warning");
  const queue = view === "urgent" ? urgentItems : attention;

  return (
    <Workspace title="Needs attention">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="micro-label">Operations queue</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">What needs a decision now.</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Prioritised operational work and scheduled follow-ups in one place.</p></div>
          <div className="grid grid-cols-3 divide-x divide-border border border-border bg-card text-center"><Metric label="Urgent" value={urgentItems.length} /><Metric label="Due" value={dueReminders.length} /><Metric label="Queue" value={attention.length + dueReminders.length} /></div>
        </div>
        <div className="mt-5 flex gap-1 overflow-x-auto border-b border-border" aria-label="Attention queue views">
          <QueueTab view={view} target="all" label="All work" count={attention.length + dueReminders.length} />
          <QueueTab view={view} target="urgent" label="Urgent" count={urgentItems.length} />
          <QueueTab view={view} target="today" label="Today" count={attention.length} />
          <QueueTab view={view} target="reminders" label="Reminders" count={reminders.length} />
        </div>
        {view !== "reminders" && <section className="mt-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Action queue</p><p className="mt-1 text-xs text-muted-foreground">Issues requiring an operator decision.</p></div></div><div className="overflow-hidden border border-border bg-card"><div className="hidden grid-cols-[minmax(0,1fr)_130px_180px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-medium uppercase text-muted-foreground md:grid"><span>Issue</span><span>Waiting</span><span className="text-right">Action</span></div><div className="divide-y divide-border">{queue.map((item) => <AttentionRow key={item.id} item={item} onResolve={() => resolveAttention(item.id)} />)}{!queue.length && <EmptyState title={view === "urgent" ? "No urgent work." : "All clear."} detail={view === "urgent" ? "Nothing in the queue currently needs immediate action." : "There is nothing waiting for an operator right now."} />}</div></div></section>}
        {(view === "all" || view === "today" || view === "reminders") && <section className="mt-7"><div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold">Scheduled reminders</p><p className="mt-1 text-xs text-muted-foreground">Follow-up records are retained after they are sent.</p></div>{view !== "reminders" && <Link to="/attention" search={{ view: "reminders" }} className="text-xs font-semibold text-primary hover:underline">View all</Link>}</div><div className="overflow-hidden border border-border bg-card"><div className="hidden grid-cols-[minmax(0,1fr)_120px_190px_150px] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-[11px] font-medium uppercase text-muted-foreground md:grid"><span>Reminder</span><span>Booking</span><span>Scheduled</span><span className="text-right">Status & action</span></div><div className="divide-y divide-border">{reminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} onSend={() => sendReminder(reminder.id)} />)}{!reminders.length && <EmptyState title="No scheduled reminders." detail="New move and payment follow-ups will appear here." />}</div></div></section>}
        </div>
    </Workspace>
  );
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="min-w-20 px-4 py-3"><p className="font-mono text-lg font-semibold">{value}</p><p className="text-[10px] font-medium uppercase text-muted-foreground">{label}</p></div>; }
function QueueTab({ view, target, label, count }: { view: "all" | "urgent" | "today" | "reminders"; target: "all" | "urgent" | "today" | "reminders"; label: string; count: number }) { return <Link to="/attention" search={{ view: target }} className={`shrink-0 border-b-2 px-3 py-3 text-sm ${view === target ? "border-foreground font-semibold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{label}<span className="ml-2 font-mono text-xs">{count}</span></Link>; }
function AttentionRow({ item, onResolve }: { item: ReturnType<typeof useOperations>["attention"][number]; onResolve: () => void }) { const tone = item.tone === "danger" ? "bg-danger-tint text-danger" : item.tone === "warning" ? "bg-warning-tint text-warning" : "bg-muted text-muted-foreground"; return <article className="grid gap-4 px-4 py-4 md:grid-cols-[minmax(0,1fr)_130px_180px] md:items-center md:px-5"><div className="flex min-w-0 gap-3"><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md ${tone}`}><CircleAlert size={17} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{item.title}</h3><span className="border border-border px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{item.type}</span></div><p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>{item.bookingRef && <Link to="/bookings/$ref" params={{ ref: item.bookingRef }} className="mt-2 inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline">{item.bookingRef}<ExternalLink size={12} /></Link>}</div></div><span className="text-xs text-muted-foreground"><Clock3 className="mr-1 inline size-3" />{item.waiting}</span><div className="flex flex-wrap gap-2 md:justify-end">{item.action === "Redispatch" && item.bookingRef ? <Button asChild size="sm"><Link to="/bookings/$ref/assign" params={{ ref: item.bookingRef }} search={{}}>Assign mover</Link></Button> : item.action === "Review" && item.moverId ? <Button asChild size="sm"><Link to="/movers/$id" params={{ id: item.moverId }}>Review documents</Link></Button> : item.action === "Send link" && item.bookingRef ? <Button asChild size="sm"><Link to="/bookings/$ref" params={{ ref: item.bookingRef }}>Open payment</Link></Button> : <Button size="sm" onClick={onResolve}>{item.action}</Button>}<Button size="icon-sm" variant="ghost" aria-label={`Resolve ${item.title}`} onClick={onResolve}><Check size={15} /></Button></div></article>; }
function ReminderRow({ reminder, onSend }: { reminder: ReturnType<typeof useOperations>["reminders"][number]; onSend: () => void }) { return <article className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_120px_190px_150px] md:items-center md:px-5"><div className="flex gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"><FileClock size={17} /></span><div><p className="text-sm font-semibold">{reminder.label}</p><p className="mt-1 text-xs text-muted-foreground">To {reminder.audience}</p></div></div><Link to="/bookings/$ref" params={{ ref: reminder.bookingRef }} className="font-mono text-xs font-semibold text-primary hover:underline">{reminder.bookingRef}</Link><span className="text-xs text-muted-foreground">{formatLondon(reminder.scheduledFor)}</span><div className="flex items-center gap-2 md:justify-end">{reminder.status === "sent" ? <span className="inline-flex items-center gap-1 text-xs font-medium text-live-foreground"><Check size={14} />Recorded</span> : <Button size="sm" onClick={onSend}><Send size={14} />Record send</Button>}</div></article>; }
function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="px-5 py-10 text-center"><p className="font-serif text-2xl">{title}</p><p className="mt-2 text-sm text-muted-foreground">{detail}</p></div>; }
