import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Bot, CheckCircle2, ChevronDown, FileText, ReceiptText, Search, Sparkles, XCircle, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Workspace } from "@/features/core/workspace";
import { Input } from "@/components/ui/input";
import { ChatView } from "@/features/inbox/chat-view";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { approvedTemplates, renderTemplate, scoutTools } from "@/features/inbox/operations-catalog";
import { bookings, moverCandidates, movers } from "@/features/core/mock-data";
import { formatLondon } from "@/lib/time";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { conversations, markRead, executeScoutTool, toolExecutions, sendTemplate } = useOperations();
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
  const templateValues = { ...templateDefaults(selected ?? { id: "", contactId: "", name: "", role: "Customer", preview: "", at: "", unread: false, takeover: false, window: "open" }, selectedBooking, selectedMover), ...templateParameters };
  const renderedTemplate = selectedTemplate ? renderTemplate(selectedTemplate, templateValues) : "";
  const templateReady = Boolean(selectedTemplate?.parameters.every((parameter) => templateValues[parameter.key]?.trim()));
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
          {contextPanel === "quickReplies" && <SidePanelHeading label="Quick replies" title="Reply shortcuts" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Choose a reply to add it to the composer.</p><div className="mt-5 grid gap-2">{["Hi there! I'm jumping in from the Cary operations team to help directly.", "Your mover has confirmed and is currently en route to your pickup location.", "Could you please upload a quick photo of the items and the doorway or stairs?"].map((reply, index) => <Button key={reply} variant="outline" className="h-auto justify-start whitespace-normal px-3 py-3 text-left text-xs" onClick={() => setQuickReplyRequest({ id: Date.now() + index, body: reply })}><Zap size={14} />{reply}</Button>)}</div></SidePanelHeading>}
          {contextPanel === "templates" && <SidePanelHeading label="Approved templates" title="WhatsApp message library" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Use a template when the 24-hour window is closed.</p><Input className="mt-4 h-9" value={templateQuery} onChange={(event) => setTemplateQuery(event.target.value)} placeholder="Search templates" /><div className="mt-3 grid gap-1">{matchingTemplates.map((template) => <Button key={template.id} variant={template.id === selectedTemplate?.id ? "secondary" : "ghost"} className="justify-start" onClick={() => selectTemplate(template.id)}>{template.name}</Button>)}</div>{selectedTemplate && <div className="mt-5 border border-border bg-muted/40 p-3"><p className="text-sm font-semibold">{selectedTemplate.name}</p><p className="mt-1 text-xs text-muted-foreground">{selectedTemplate.category} · {selectedTemplate.target}</p><div className="mt-3 grid gap-2">{selectedTemplate.parameters.map((parameter) => <label className="text-xs font-medium" key={parameter.key}>{`{{${parameter.key}}}`} · {parameter.label}<Input className="mt-1 h-8" value={templateValues[parameter.key] ?? ""} onChange={(event) => setTemplateParameters((current) => ({ ...current, [parameter.key]: event.target.value }))} /></label>)}</div><div className="mt-3 border border-border bg-card p-3"><p className="micro-label">Preview</p><p className="mt-2 whitespace-pre-wrap text-xs leading-5">{renderedTemplate}</p></div><Button className="mt-3 w-full" disabled={!templateReady} onClick={() => { sendTemplate(selected.id, selectedTemplate.name, renderedTemplate); setContextPanel("details"); }}>Send approved template</Button></div>}</SidePanelHeading>}
          {contextPanel === "scoutTools" && <SidePanelHeading label="Scout tools" title="Operations actions" onClose={() => setContextPanel("details")}><p className="mt-2 text-xs text-muted-foreground">Open only the group you need, then record the operational result.</p><div className="mt-5 grid gap-2"><Button variant="outline" size="sm" className="justify-start" onClick={() => setAssignOpen(true)}><Sparkles />Assign mover</Button><Button asChild variant="outline" size="sm" className="justify-start"><Link to="/quotes/new" search={{ booking: selectedBooking?.ref ?? "" }}><ReceiptText />Create quote</Link></Button>{Object.entries(toolGroups).map(([group, tools]) => <div className="border border-border" key={group}><Button variant="ghost" className="w-full justify-between" onClick={() => setExpandedGroups((groups) => ({ ...groups, [group]: !groups[group] }))}>{group}<ChevronDown className={`size-4 transition-transform ${expandedGroups[group] ? "rotate-180" : ""}`} /></Button>{expandedGroups[group] && <div className="border-t border-border p-1">{tools.map((tool) => <Button key={tool.id} variant="ghost" size="sm" className="w-full justify-start text-left" onClick={() => openTool(tool.id)}><Bot size={14} />{tool.name}</Button>)}</div>}</div>)}</div><div className="mt-5 border-t border-border pt-4"><p className="micro-label">Recent tool activity</p>{toolExecutions.filter((item) => item.conversationId === selected.id).slice(0, 3).map((item) => <p className="mt-2 text-xs" key={item.id}>{item.toolName}<span className="block text-muted-foreground">{item.outcome}</span></p>)}{!toolExecutions.some((item) => item.conversationId === selected.id) && <p className="mt-2 text-xs text-muted-foreground">No tools recorded for this conversation.</p>}</div></SidePanelHeading>}
        </aside>
      </div>
      <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) { setSelectedMoverId(null); setPayout(""); } }}><DialogContent><DialogHeader><DialogTitle>Assign mover</DialogTitle><DialogDescription>Choose a verified mover and confirm their payout for this move.</DialogDescription></DialogHeader><div className="grid gap-4"><label className="grid gap-2 text-sm font-medium" htmlFor="mover-picker">Mover<Select value={selectedMoverId ?? ""} onValueChange={(value) => setSelectedMoverId(value)}><SelectTrigger id="mover-picker" aria-label="Mover"><SelectValue placeholder="Choose a mover" /></SelectTrigger><SelectContent>{movers.map((mover) => <SelectItem key={mover.id} value={mover.id} disabled={mover.status !== "verified"}>{mover.name} · {mover.businessName}{mover.status !== "verified" ? " · not verified" : ""}</SelectItem>)}</SelectContent></Select></label><label className="grid gap-2 text-sm font-medium" htmlFor="mover-payout">Mover payout<Input id="mover-payout" inputMode="decimal" placeholder="0.00" value={payout} onChange={(event) => setPayout(event.target.value)} /></label><p className="text-xs text-muted-foreground">Only verified movers can be assigned. The full amount shown is the mover payout.</p></div><DialogFooter><Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>{selectedBooking && chosenMover && Number(payout) > 0 ? <Button asChild><Link to="/bookings/$ref/assign" params={{ ref: selectedBooking.ref }} search={{ mover: chosenMover.id, payout }}>Continue</Link></Button> : <Button disabled>Continue</Button>}</DialogFooter></DialogContent></Dialog>
      <Dialog open={Boolean(selectedTool)} onOpenChange={(open) => { if (!open) setToolId(null); }}><DialogContent className="max-h-[85svh] overflow-y-auto"><DialogHeader><DialogTitle>{selectedTool?.name ?? "Scout tool"}</DialogTitle><DialogDescription>Enter the documented information, then record the operational result against {selected.name}.</DialogDescription></DialogHeader><div className="grid gap-3">{selectedTool?.fields.map((field) => <label className="text-sm font-medium" key={field}>{field}<Input className="mt-1" value={toolValues[field] ?? ""} onChange={(event) => setToolValues((values) => ({ ...values, [field]: event.target.value }))} /></label>)}</div><DialogFooter><Button variant="outline" onClick={() => setToolId(null)}>Cancel</Button><Button disabled={!selectedTool?.fields.every((field) => toolValues[field]?.trim())} onClick={executeTool}>Record {selectedTool?.outcome}</Button></DialogFooter></DialogContent></Dialog>
    </Workspace>
  );
}

function SidePanelHeading({ label, title, onClose, children }: { label: string; title: string; onClose: () => void; children: React.ReactNode }) { return <div className="animate-in slide-in-from-right-2 duration-200"><div className="flex items-center justify-between gap-2"><div><p className="micro-label">{label}</p><h2 className="mt-2 text-base font-semibold">{title}</h2></div><Button variant="ghost" size="sm" onClick={onClose}>Close</Button></div>{children}</div>; }

function templateDefaults(conversation: ReturnType<typeof useOperations>["conversations"][number], booking: typeof bookings[number] | undefined, mover: typeof movers[number] | undefined): Record<string, string> { const [pickup = "", dropoff = ""] = booking?.route.split(" → ") ?? []; const customer = booking?.customer ?? (conversation.role === "Customer" ? conversation.name : ""); return { "1": customer.split(" ")[0] ?? "", "2": pickup, "3": dropoff, "4": mover?.businessName ?? "Verified Cary mover", "5": "", "6": booking ? formatLondon(booking.moveAt) : "", "7": booking?.items ?? "", "8": "Driver + 1 helper", "9": "Customer phone available to operators", "10": booking?.ref ?? "", "11": conversation.role === "Mover" ? (mover?.businessName ?? conversation.name) : "" }; }

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
