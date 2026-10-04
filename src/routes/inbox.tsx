import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Bot, FileText, ReceiptText, Search, Sparkles, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Workspace } from "@/features/core/workspace";
import { Input } from "@/components/ui/input";
import { ChatView } from "@/features/inbox/chat-view";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { scoutTools } from "@/features/inbox/operations-catalog";

export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Inbox — Cary Mission Control" },
      { name: "description", content: "Live WhatsApp operations console for Cary operators." },
    ],
  }),
  component: InboxLayout
});

function InboxLayout() { return <Outlet />; }

export function InboxPage() {
  const { conversations, markRead, executeScoutTool, toolExecutions } = useOperations();
  const [filter, setFilter] = useState<"all" | "needs" | "taken" | "customer" | "mover">("all"); const [query, setQuery] = useState(""); const [assignOpen, setAssignOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextPanel, setContextPanel] = useState<"details" | "quickReplies" | "scoutTools">("details");
  const [quickReplyRequest, setQuickReplyRequest] = useState<{ id: number; body: string } | null>(null);
  const [toolId, setToolId] = useState<string | null>(null);
  const [toolValues, setToolValues] = useState<Record<string, string>>({});
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const filtered = conversations.filter((conversation) => {
    const matches = `${conversation.name} ${conversation.role} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase());
    if (!matches || filter === "all") return matches;
    if (filter === "taken") return conversation.takeover;
    if (filter === "needs") return conversation.unread || conversation.window === "closed";
    return conversation.role.toLowerCase() === filter;
  });
  const selectedTool = scoutTools.find((tool) => tool.id === toolId);
  function openTool(id: string) { setToolId(id); setToolValues({}); }
  function executeTool() {
    if (!selectedTool || !selected) return;
    const complete = selectedTool.fields.every((field) => toolValues[field]?.trim());
    if (!complete) return;
    executeScoutTool({ conversationId: selected.id, toolId: selectedTool.id, toolName: selectedTool.name, inputSummary: selectedTool.fields.map((field) => `${field}: ${toolValues[field]}`).join(" · "), outcome: selectedTool.outcome });
    setToolId(null); setToolValues({});
  }

  if (!selected) return (
    <Workspace title="Inbox">
      <div className="panel p-6 text-sm text-muted-foreground">No conversations are available.</div>
    </Workspace>
  );

  return (
    <Workspace title="Inbox">
      <div className="grid min-h-[calc(100vh-10rem)] overflow-hidden border border-border bg-card lg:grid-cols-[320px_minmax(0,1fr)_260px]">
        <aside className="border-b border-border lg:border-b-0 lg:border-r">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Conversations</p>
              <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">3</span>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9 text-xs" placeholder="Name, number or booking" />
            </div>
          </div>
          <div className="flex border-b border-border px-2">
            <button onClick={() => setFilter("all")} className={`${filter === "all" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>All</button>
            <button onClick={() => setFilter("needs")} className={`${filter === "needs" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>Needs action</button>
            <button onClick={() => setFilter("taken")} className={`${filter === "taken" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>Taken over</button><button onClick={() => setFilter("customer")} className={`${filter === "customer" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>Customers</button><button onClick={() => setFilter("mover")} className={`${filter === "mover" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>Movers</button>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((conversation) => (
              <ConversationRow
                conversation={conversation}
                selected={selected.id === conversation.id}
                key={conversation.id}
                onSelect={() => {
                  setSelectedId(conversation.id);
                  markRead(conversation.id);
                }}
              />
            ))}{!filtered.length && <p className="p-5 text-sm text-muted-foreground">No conversations match this view.</p>}
          </div>
        </aside>
        
        <div className="hidden lg:flex">
          <ChatView conversation={selected} onAssignMover={() => setAssignOpen(true)} onContextPanelChange={setContextPanel} quickReplyRequest={quickReplyRequest} />
        </div>
        
        <aside className="hidden border-l border-border p-5 lg:block">
          {contextPanel === "details" && <><p className="micro-label">Conversation context</p><h2 className="mt-2 text-base font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">+44 7•• ••• 1234</p><div className="mt-6 border-t border-border pt-5"><p className="micro-label">Active booking</p><Link to="/bookings" className="mt-2 block border border-border p-3 hover:bg-muted"><p className="font-mono text-xs font-semibold">CARY-8291</p><p className="mt-1 text-xs text-muted-foreground">CF10 1AA → CF24 4PB</p><p className="mt-2 text-xs font-medium text-live-foreground">In transit</p></Link></div></>}
          {contextPanel === "quickReplies" && <><div className="flex items-center justify-between gap-2"><div><p className="micro-label">Quick replies</p><h2 className="mt-2 text-base font-semibold">Reply shortcuts</h2></div><Button variant="ghost" size="sm" onClick={() => setContextPanel("details")}>Close</Button></div><p className="mt-2 text-xs text-muted-foreground">Choose a reply to add it to the composer.</p><div className="mt-5 grid gap-2">{["Hi there! I'm jumping in from the Cary operations team to help directly.", "Your mover has confirmed and is currently en route to your pickup location.", "Could you please upload a quick photo of the items and the doorway or stairs?"].map((reply, index) => <Button key={reply} variant="outline" className="h-auto justify-start whitespace-normal px-3 py-3 text-left text-xs" onClick={() => setQuickReplyRequest({ id: Date.now() + index, body: reply })}><Zap size={14} />{reply}</Button>)}</div></>}
          {contextPanel === "scoutTools" && <><div className="flex items-center justify-between gap-2"><div><p className="micro-label">Scout tools</p><h2 className="mt-2 text-base font-semibold">Operations actions</h2></div><Button variant="ghost" size="sm" onClick={() => setContextPanel("details")}>Close</Button></div><p className="mt-2 text-xs text-muted-foreground">Each action records a precise in-app operational event.</p><div className="mt-5 grid gap-2"><Button variant="outline" size="sm" className="justify-start" onClick={() => setAssignOpen(true)}><Sparkles />Assign mover</Button><Button asChild variant="outline" size="sm" className="justify-start"><Link to="/quotes/new" search={{ booking: "CARY-8291" }}><ReceiptText />Create quote</Link></Button>{scoutTools.map((tool) => <Button key={tool.id} variant="ghost" size="sm" className="justify-start text-left" onClick={() => openTool(tool.id)}><Bot size={14} />{tool.name}</Button>)}</div><div className="mt-5 border-t border-border pt-4"><p className="micro-label">Recent tool activity</p>{toolExecutions.filter((item) => item.conversationId === selected.id).slice(0, 3).map((item) => <p className="mt-2 text-xs" key={item.id}>{item.toolName}<span className="block text-muted-foreground">{item.outcome}</span></p>)}{!toolExecutions.some((item) => item.conversationId === selected.id) && <p className="mt-2 text-xs text-muted-foreground">No tools recorded for this conversation.</p>}</div></>}
        </aside>
      </div>
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}><DialogContent><DialogHeader><DialogTitle>Assign a mover</DialogTitle><DialogDescription>Open the dispatch workspace to compare verified candidates, payout and customer update before confirming.</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button><Button asChild><Link to="/bookings/$ref/assign" params={{ ref: "CARY-8291" }}>Open assignment</Link></Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={Boolean(selectedTool)} onOpenChange={(open) => { if (!open) setToolId(null); }}><DialogContent className="max-h-[85svh] overflow-y-auto"><DialogHeader><DialogTitle>{selectedTool?.name ?? "Scout tool"}</DialogTitle><DialogDescription>Enter the documented information, then record the operational result against {selected.name}.</DialogDescription></DialogHeader><div className="grid gap-3">{selectedTool?.fields.map((field) => <label className="text-sm font-medium" key={field}>{field}<Input className="mt-1" value={toolValues[field] ?? ""} onChange={(event) => setToolValues((values) => ({ ...values, [field]: event.target.value }))} /></label>)}</div><DialogFooter><Button variant="outline" onClick={() => setToolId(null)}>Cancel</Button><Button disabled={!selectedTool?.fields.every((field) => toolValues[field]?.trim())} onClick={executeTool}>Record {selectedTool?.outcome}</Button></DialogFooter></DialogContent></Dialog>
    </Workspace>
  );
}

function ConversationRow({
  conversation,
  selected,
  onSelect,
}: {
  conversation: ReturnType<typeof useOperations>["conversations"][number];
  selected: boolean;
  onSelect: () => void;
}) {
  const rowClass = `w-full gap-3 p-4 text-left ${selected ? "bg-accent" : "hover:bg-muted"}`;
  const content = <>
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
      {conversation.name.split(" ").map((name) => name[0]).join("")}
    </span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold">{conversation.name}</span>
        <span className="text-[10px] text-muted-foreground">{conversation.at}</span>
      </span>
      <span className="mt-0.5 flex items-center gap-1">
        <span className="text-[10px] text-muted-foreground">{conversation.role}</span>
        {conversation.takeover && <StatusBadge status="operator" label="Operator" />}
      </span>
      <span className="mt-1 block truncate text-xs text-muted-foreground">{conversation.preview}</span>
    </span>
    {conversation.unread && <span className="mt-2 size-2 rounded-full bg-danger" />}
  </>;

  return <>
    <button type="button" className={`hidden lg:flex ${rowClass}`} onClick={onSelect}>{content}</button>
    <Link to="/inbox/$sessionId" params={{ sessionId: conversation.id }} className={`flex lg:hidden ${rowClass}`} onClick={onSelect}>{content}</Link>
  </>;
}
