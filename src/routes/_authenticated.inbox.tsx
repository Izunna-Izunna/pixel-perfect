import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Bot, ChevronDown, FileText, ReceiptText, Search, Sparkles, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Workspace } from "@/features/core/workspace";
import { Input } from "@/components/ui/input";
import { ChatView } from "@/features/inbox/chat-view";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { approvedTemplates, renderTemplate, scoutTools, getTemplatePrefills } from "@/features/inbox/operations-catalog";
import { formatLondon } from "@/lib/time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/inbox")({
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
  const { conversations, bookings, movers, markRead, executeScoutTool, toolExecutions, sendTemplate } = useOperations();
  const [filter, setFilter] = useState<"all" | "needs" | "taken" | "customer" | "mover">("all"); const [query, setQuery] = useState(""); const [assignOpen, setAssignOpen] = useState(false);
   const [selectedMoverId, setSelectedMoverId] = useState<string | null>(null);
  const [payout, setPayout] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [contextPanel, setContextPanel] = useState<"details" | "quickReplies" | "scoutTools" | "templates">("details");
  const [quickReplyRequest, setQuickReplyRequest] = useState<{ id: number; body: string } | null>(null);
  const [toolId, setToolId] = useState<string | null>(null);
  const [toolValues, setToolValues] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [templateQuery, setTemplateQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateParameters, setTemplateParameters] = useState<Record<string, string>>({});
  const selected = conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0];
  const filtered = conversations.filter((conversation) => {
    const matches = `${conversation.name} ${conversation.role} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase());
    if (!matches || filter === "all") return matches;
    if (filter === "taken") return conversation.takeover;
    if (filter === "needs") return conversation.unread || conversation.window === "closed";
    return conversation.role.toLowerCase() === filter;
  });
  const selectedTool = scoutTools.find((tool) => tool.id === toolId);
  const selectedBooking = bookings.find((item) => item.customerId === selected?.contactId || item.moverId === selected?.contactId);
  const selectedMover = selected?.role === "Mover" ? movers.find((item) => item.id === selected.contactId) : undefined;
  const chosenMover = movers.find((mover) => mover.id === selectedMoverId);
  const matchingTemplates = approvedTemplates.filter((template) => template.target === selected?.role || template.target === "Admin Ops").filter((template) => template.name.toLowerCase().includes(templateQuery.toLowerCase()));
  const selectedTemplate = approvedTemplates.find((template) => template.id === selectedTemplateId) ?? matchingTemplates[0];
  const templatePrefills = useMemo(() => {
    if (!selectedTemplate || !selected) return {};
    return getTemplatePrefills(selectedTemplate, {
      conversation: selected,
      booking: selectedBooking,
      mover: selectedMover,
    });
  }, [selectedTemplate, selected, selectedBooking, selectedMover]);

  const templateValues = useMemo(() => ({
    ...templatePrefills,
    ...templateParameters,
  }), [templatePrefills, templateParameters]);

  const renderedTemplate = selectedTemplate ? renderTemplate(selectedTemplate, templateValues) : "";
  const templateReady = Boolean(selectedTemplate?.parameters.every((parameter: { key: string }) => templateValues[parameter.key]?.trim()));
  const toolGroups = scoutTools.reduce<Record<string, Array<(typeof scoutTools)[number]>>>((groups, tool) => { const group = tool.group; (groups[group] ??= []).push(tool); return groups; }, {});
  function openTool(id: string) { setToolId(id); setToolValues({}); }
  function selectTemplate(id: string) { setSelectedTemplateId(id); setTemplateParameters({}); }
  function executeTool() {
    if (!selectedTool || !selected) return;
    const complete = selectedTool.fields.every((field) => toolValues[field]?.trim());
    if (!complete) return;
    executeScoutTool({ conversationId: selected.id, toolId: selectedTool.id, toolName: selectedTool.name, inputSummary: selectedTool.fields.map((field) => `${field}: ${toolValues[field]}`).join(" · "), outcome: selectedTool.outcome });
    setToolId(null); setToolValues({});
  }

  const unreadCount = conversations.filter((c) => c.unread).length;

  if (!selected) {
    return (
      <Workspace title="Inbox">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/60 p-12 text-center">
          <div className="mb-4 grid size-14 place-items-center rounded-full bg-live-tint text-live-foreground">
            <Bot className="size-7" />
          </div>
          <h2 className="text-xl font-semibold">No active WhatsApp conversations</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            When customers or movers message Cary on WhatsApp (<span className="font-mono font-medium text-foreground">+44 7345 942352</span>), their threads will appear here automatically for human oversight and live takeover.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <a href="https://wa.me/447345942352?text=Hi%20Cary%20%F0%9F%91%8B%20I%20need%20help%20moving%20something." target="_blank" rel="noopener noreferrer">
                Send test WhatsApp message
              </a>
            </Button>
            <Button asChild size="sm">
              <Link to="/attention" search={{ view: "all" }}>View Attention queue</Link>
            </Button>
          </div>
        </div>
      </Workspace>
    );
  }

  return (
    <Workspace title="Inbox">
      <div className="grid h-[calc(100vh-8.5rem)] min-h-[550px] overflow-hidden border border-border bg-card lg:grid-cols-[320px_minmax(0,1fr)_280px]">
        {/* ── LEFT: CONVERSATION LIST ── */}
        <aside className="flex flex-col h-full min-h-0 border-b border-border lg:border-b-0 lg:border-r overflow-hidden">
          <div className="shrink-0 border-b border-border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Conversations</p>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              ) : null}
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-9 pl-9 text-xs" placeholder="Name, number or booking" />
            </div>
          </div>
          <div className="shrink-0 flex border-b border-border px-2 overflow-x-auto">
            <button onClick={() => setFilter("all")} className={`${filter === "all" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs shrink-0`}>All</button>
            <button onClick={() => setFilter("needs")} className={`${filter === "needs" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs shrink-0`}>Needs action</button>
            <button onClick={() => setFilter("taken")} className={`${filter === "taken" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs shrink-0`}>Taken over</button>
            <button onClick={() => setFilter("customer")} className={`${filter === "customer" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs shrink-0`}>Customers</button>
            <button onClick={() => setFilter("mover")} className={`${filter === "mover" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs shrink-0`}>Movers</button>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border">
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
        
        {/* ── MIDDLE: ACTIVE CHAT THREAD ── */}
        <div className="hidden lg:flex flex-col h-full min-h-0 overflow-hidden">
          <ChatView conversation={selected} onAssignMover={() => setAssignOpen(true)} onContextPanelChange={setContextPanel} quickReplyRequest={quickReplyRequest} />
        </div>
        
        {/* ── RIGHT: CONTEXT & TOOLS PANEL ── */}
        <aside className="hidden border-l border-border p-5 lg:flex flex-col h-full min-h-0 overflow-y-auto bg-card">
          {contextPanel === "details" && <><p className="micro-label">Conversation context</p><h2 className="mt-2 text-base font-semibold">{selected.name}</h2><p className="mt-1 text-xs text-muted-foreground">{selected.contactId}</p><div className="mt-6 border-t border-border pt-5"><p className="micro-label">Active booking</p><Link to="/bookings" className="mt-2 block border border-border p-3 hover:bg-muted"><p className="font-mono text-xs font-semibold">{selectedBooking?.ref || "No active booking"}</p><p className="mt-1 text-xs text-muted-foreground">{selectedBooking?.route || "Route pending"}</p><p className="mt-2 text-xs font-medium text-live-foreground capitalize">{selectedBooking?.status.replace("_", " ") || "In conversation"}</p></Link></div></>}
          {contextPanel === "quickReplies" && <SidePanelHeading label="Quick replies" title="Reply shortcuts" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Choose a reply to add it to the composer.</p><div className="mt-5 grid gap-2">{["Hi there! I'm jumping in from the Cary operations team to help directly.", "Your mover has confirmed and is currently en route to your pickup location.", "Could you please upload a quick photo of the items and the doorway or stairs?"].map((reply, index) => <Button key={reply} variant="outline" className="h-auto justify-start whitespace-normal px-3 py-3 text-left text-xs" onClick={() => setQuickReplyRequest({ id: Date.now() + index, body: reply })}><Zap size={14} />{reply}</Button>)}</div></SidePanelHeading>}
          {contextPanel === "templates" && <SidePanelHeading label="Approved templates" title="WhatsApp message library" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Use a template when the 24-hour window is closed.</p><Input className="mt-4 h-9" value={templateQuery} onChange={(event) => setTemplateQuery(event.target.value)} placeholder="Search templates" /><div className="mt-3 grid gap-1">{matchingTemplates.map((template) => <Button key={template.id} variant={template.id === selectedTemplate?.id ? "secondary" : "ghost"} className="justify-start" onClick={() => selectTemplate(template.id)}>{template.name}</Button>)}</div>{selectedTemplate && <div className="mt-5 border border-border bg-muted/40 p-3"><p className="text-sm font-semibold">{selectedTemplate.name}</p><p className="mt-1 text-xs text-muted-foreground">{selectedTemplate.category} · {selectedTemplate.target}</p><div className="mt-3 grid gap-2">{selectedTemplate.parameters.map((parameter: { key: string; label: string }) => <label className="text-xs font-medium" key={parameter.key}>{`{{${parameter.key}}}`} · {parameter.label}<Input className="mt-1 h-8" value={templateValues[parameter.key] ?? ""} onChange={(event) => setTemplateParameters((current) => ({ ...current, [parameter.key]: event.target.value }))} /></label>)}</div><div className="mt-3 border border-border bg-card p-3"><p className="micro-label">Preview</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5">{renderedTemplate}</p></div><Button className="mt-3 w-full" disabled={!templateReady} onClick={() => { const params = selectedTemplate.parameters.map((parameter: { key: string }) => templateValues[parameter.key]?.trim() || ""); sendTemplate(selected.id, selectedTemplate.id, params, renderedTemplate); setContextPanel("details"); }}>Send approved template</Button></div>}</SidePanelHeading>}
          {contextPanel === "scoutTools" && <SidePanelHeading label="Scout tools" title="Operations actions" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Open only the group you need, then record the operational result.</p><div className="mt-5 grid gap-2"><Button variant="outline" size="sm" className="justify-start" onClick={() => setAssignOpen(true)}><Sparkles />Assign mover</Button><Button asChild variant="outline" size="sm" className="justify-start"><Link to="/quotes/new" search={{ booking: selectedBooking?.ref ?? "" }}><ReceiptText />Create quote</Link></Button>{Object.entries(toolGroups).map(([group, tools]) => <div className="border border-border" key={group}><Button variant="ghost" className="w-full justify-between" onClick={() => setExpandedGroups((groups) => ({ ...groups, [group]: !groups[group] }))}>{group}<ChevronDown className={`size-4 transition-transform ${expandedGroups[group] ? "rotate-180" : ""}`} /></Button>{expandedGroups[group] && <div className="border-t border-border p-1">{tools.map((tool) => <Button key={tool.id} variant="ghost" size="sm" className="w-full justify-start text-left" onClick={() => openTool(tool.id)}><Bot size={14} />{tool.name}</Button>)}</div>}</div>)}</div><div className="mt-5 border-t border-border pt-4"><p className="micro-label">Recent tool activity</p>{toolExecutions.filter((item) => item.conversationId === selected.id).slice(0, 3).map((item) => <p className="mt-2 text-xs" key={item.id}>{item.toolName}<span className="block text-muted-foreground">{item.outcome}</span></p>)}{!toolExecutions.some((item) => item.conversationId === selected.id) && <p className="mt-2 text-xs text-muted-foreground">No tools recorded for this conversation.</p>}</div></SidePanelHeading>}
        </aside>
      </div>
      <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) { setSelectedMoverId(null); setPayout(""); } }}><DialogContent><DialogHeader><DialogTitle>Assign mover</DialogTitle><DialogDescription>Choose a verified mover and confirm their payout for this move.</DialogDescription></DialogHeader><div className="grid gap-4"><label className="grid gap-2 text-sm font-medium" htmlFor="mover-picker">Mover<Select value={selectedMoverId ?? ""} onValueChange={(value) => setSelectedMoverId(value)}><SelectTrigger id="mover-picker" aria-label="Mover"><SelectValue placeholder="Choose a mover" /></SelectTrigger><SelectContent>{movers.map((mover) => <SelectItem key={mover.id} value={mover.id} disabled={mover.status !== "verified"}>{mover.name} · {mover.businessName}{mover.status !== "verified" ? " · not verified" : ""}</SelectItem>)}</SelectContent></Select></label><label className="grid gap-2 text-sm font-medium" htmlFor="mover-payout">Mover payout<Input id="mover-payout" inputMode="decimal" placeholder="0.00" value={payout} onChange={(event) => setPayout(event.target.value)} /></label><p className="text-xs text-muted-foreground">Only verified movers can be assigned. The full amount shown is the mover payout.</p></div><DialogFooter><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>{selectedBooking && chosenMover && Number(payout) > 0 ? <Button asChild><Link to="/bookings/$ref/assign" params={{ ref: selectedBooking.ref }} search={{ mover: chosenMover.id, payout }}>Continue</Link></Button> : <Button disabled>Continue</Button>}</DialogFooter></DialogContent></Dialog>
      <Dialog open={Boolean(selectedTool)} onOpenChange={(open) => { if (!open) setToolId(null); }}><DialogContent className="max-h-[85svh] overflow-y-auto"><DialogHeader><DialogTitle>{selectedTool?.name ?? "Scout tool"}</DialogTitle><DialogDescription>Enter the documented information, then record the operational result against {selected.name}.</DialogDescription></DialogHeader><div className="grid gap-3">{selectedTool?.fields.map((field) => <label className="text-sm font-medium" key={field}>{field}<Input className="mt-1" value={toolValues[field] ?? ""} onChange={(event) => setToolValues((values) => ({ ...values, [field]: event.target.value }))} /></label>)}</div><DialogFooter><Button variant="outline" onClick={() => setToolId(null)}>Cancel</Button><Button disabled={!selectedTool?.fields.every((field) => toolValues[field]?.trim())} onClick={executeTool}>Record {selectedTool?.outcome}</Button></DialogFooter></DialogContent></Dialog>
    </Workspace>
  );
}

function SidePanelHeading({ label, title, onClose, children }: { label: string; title: string; onClose: () => void; children: React.ReactNode }) { return <div className="animate-in slide-in-from-right-2 duration-200"><div className="flex items-center justify-between gap-2"><div><p className="micro-label">{label}</p><h2 className="mt-2 text-base font-semibold">{title}</h2></div><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></div>{children}</div>; }

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
