import { ArrowLeft, Bot, Check, CheckCheck, ChevronDown, ClipboardCopy, FileText, MessageSquareWarning, Paperclip, PauseCircle, Send, Sparkles, UserRound, X, Zap } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Conversation, bookings, movers } from "@/features/core/mock-data";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { formatLondon } from "@/lib/time";

const quickReplies = [
  "Hi there! I'm jumping in from the Cary operations team to help directly.",
  "Your mover has confirmed and is currently en route to your pickup location.",
  "Could you please upload a quick photo of the items and the doorway or stairs?",
];

export function ChatView({ conversation, fullScreen = false }: { conversation: Conversation; fullScreen?: boolean }) {
  const navigate = useNavigate();
  const { messages, sendMessage, sendTemplate, setTakeover, markRead } = useOperations();
  const [message, setMessage] = useState(""); const [templates, setTemplates] = useState(false); const [quickRepliesOpen, setQuickRepliesOpen] = useState(false); const [handover, setHandover] = useState(false); const [note, setNote] = useState(""); const [attachment, setAttachment] = useState(""); const [toolOpen, setToolOpen] = useState(false); const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null); const endRef = useRef<HTMLDivElement>(null); const closed = conversation.window === "closed";
  const thread = messages[conversation.id] ?? [];
  const booking = bookings.find((item) => item.customerId === conversation.contactId || item.moverId === conversation.contactId);
  const mover = conversation.role === "Mover" ? movers.find((item) => item.id === conversation.contactId) : undefined;
  const phone = mover?.phone ?? "+44 7•• ••• 1234";
  const takeover = conversation.takeover;

  useEffect(() => { markRead(conversation.id); endRef.current?.scrollIntoView({ block: "end" }); inputRef.current?.focus(); }, [conversation.id, markRead, thread.length]);
  function send(event?: FormEvent<HTMLFormElement>) { event?.preventDefault(); if (closed) { setTemplates(true); return; } sendMessage(conversation.id, message, attachment || undefined); setMessage(""); setAttachment(""); inputRef.current?.focus(); }
  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }
  function copyPhone() { void navigator.clipboard?.writeText(mover?.phone ?? ""); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }

  return <section className={`flex min-h-0 flex-1 flex-col bg-card ${fullScreen ? "h-[100svh] min-h-0" : ""}`}>
    <header className="border-b border-border bg-card">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {fullScreen && <Button variant="ghost" size="icon" aria-label="Back to inbox" onClick={() => void navigate({ to: "/inbox" })}><ArrowLeft /></Button>}
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">{conversation.name.split(" ").map((name) => name[0]).join("")}</span>
          <div className="min-w-0"><Link to={conversation.role === "Mover" ? "/movers/$id" : "/customers/$id"} params={{ id: conversation.contactId }} className="block truncate text-sm font-semibold hover:underline">{conversation.name}</Link><div className="mt-0.5 flex items-center gap-1.5"><span className="text-xs text-muted-foreground">{conversation.role}</span><span className={closed ? "text-xs text-warning" : "text-xs text-live-foreground"}>{closed ? "24h window closed" : "Window open · 8h 24m left"}</span></div></div>
        </div>
        <Button variant={takeover ? "default" : "outline"} size="sm" onClick={() => { if (takeover) setTakeover(conversation.id, false, ""); else setHandover(true); }}><PauseCircle size={15} />{takeover ? "Resume Scout" : "Take over"}</Button>
      </div>
      {!takeover && <div className="flex items-center justify-between gap-2 border-t border-border bg-live-tint px-4 py-2 text-xs text-live-foreground"><span className="flex items-center gap-1.5"><Bot size={14} />Scout auto-pilot active</span><span className="hidden sm:inline">Human replies will pause Scout.</span></div>}
    </header>
    {handover && <div className="border-b border-border bg-muted p-3"><label className="block text-xs font-semibold">Handover note<Textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-2 min-h-20" placeholder="What should the next operator know?" /></label><div className="mt-2 flex gap-2"><Button size="sm" disabled={!note.trim()} onClick={() => { setTakeover(conversation.id, true, note); setHandover(false); setNote(""); }}>Confirm takeover</Button><Button size="sm" variant="outline" onClick={() => setHandover(false)}>Cancel</Button></div></div>}
    {takeover && <div className="flex items-center gap-2 border-b border-warning/30 bg-warning-tint px-4 py-2 text-xs text-warning"><StatusBadge status="operator" label="Human takeover" /><span>Scout is paused while Amelia replies.</span></div>}
    <div className="flex-1 space-y-4 overflow-y-auto bg-muted/40 p-4 sm:p-5"><div className="text-center"><span className="border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">Today, London time</span></div>{thread.map((item) => {
      const agentMessage = item.sender === "scout"; const operatorMessage = item.sender === "operator"; const own = agentMessage || operatorMessage;
      return <div key={item.id} className={`${own ? "ml-auto" : ""} max-w-[92%] sm:max-w-[78%]`}><div className={`${agentMessage ? "bg-live-tint" : operatorMessage ? "bg-accent" : "bg-card"} border border-border p-3 text-sm`}><div className={`mb-1 flex items-center gap-1 text-[10px] text-muted-foreground ${own ? "justify-end" : ""}`}>{agentMessage ? <Bot size={11} /> : operatorMessage ? <UserRound size={11} /> : null}<span>{operatorMessage ? "Amelia · Operator" : agentMessage ? "Scout · AI" : conversation.name}</span></div><p className="whitespace-pre-wrap">{item.body}</p>{item.mediaName && <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground"><FileText size={14} />Attachment: {item.mediaName}</div>}<p className="mt-1 text-right text-[10px] text-muted-foreground">13:42 {own && (item.delivery === "sent" ? <Check className="inline size-3" /> : <CheckCheck className="inline size-3 text-live-foreground" />)}</p></div></div>;
    })}<div ref={endRef} /></div>
    <form onSubmit={send} className="sticky bottom-0 border-t border-border bg-card p-3 sm:p-4">{closed ? <div className="border border-warning/30 bg-warning-tint p-3"><p className="text-xs text-warning">24h window closed. Send an approved template instead.</p><Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setTemplates(!templates)}>Choose template <ChevronDown size={14} /></Button>{templates && <div className="mt-2 border border-border bg-card p-3 text-xs"><p className="font-semibold">Move availability update</p><p className="mt-1 text-muted-foreground">Hello {conversation.name.split(" ")[0]}, we are checking availability for your move.</p><Button size="sm" className="mt-3" onClick={() => { sendTemplate(conversation.id); setTemplates(false); }}>Send approved template</Button></div>}</div> : <><div className="relative flex items-end gap-2"><input id={`attachment-${conversation.id}`} type="file" className="sr-only" onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? "")} /><label htmlFor={`attachment-${conversation.id}`}><Button type="button" variant="ghost" size="icon" aria-label="Attach file" asChild><span><Paperclip /></span></Button></label><Textarea ref={inputRef} value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={handleComposerKeyDown} placeholder="Message as Amelia…" className="min-h-10 max-h-28 resize-none py-2" rows={1} /><Button type="submit" size="icon" aria-label="Send message" disabled={!message.trim() && !attachment}><Send /></Button></div><div className="mt-2 flex flex-wrap items-center gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setQuickRepliesOpen(!quickRepliesOpen)}><Zap size={14} />Quick replies</Button><Button type="button" variant="ghost" size="sm" onClick={() => setToolOpen(!toolOpen)}><Sparkles size={14} />Scout tools</Button><span className="text-[10px] text-muted-foreground">Enter to send · Shift+Enter for a new line</span></div>{quickRepliesOpen && <div className="mt-2 grid gap-1 border border-border bg-card p-2">{quickReplies.map((reply) => <Button type="button" variant="ghost" className="h-auto justify-start whitespace-normal px-2 py-2 text-left text-xs" key={reply} onClick={() => { setMessage(reply); setQuickRepliesOpen(false); inputRef.current?.focus(); }}>{reply}</Button>)}</div>}{toolOpen && <div className="mt-2 flex items-center justify-between gap-3 border border-border bg-muted p-3 text-xs"><span><b>Scout tools</b> require the connected operations service.</span><Button size="sm" variant="outline" disabled title="Tool execution needs the connected operations service">Execute tool</Button></div>}{attachment && <div className="mt-2 flex items-center justify-between border border-border bg-muted px-2 py-1 text-xs"><span className="truncate">{attachment}</span><Button type="button" size="icon" variant="ghost" aria-label="Remove attachment" onClick={() => setAttachment("")}><X /></Button></div>}</>}</form>
    {fullScreen && <aside className="hidden border-t border-border bg-muted/20 p-4 xl:block"><div className="mx-auto grid max-w-5xl grid-cols-[1fr_auto] gap-4"><div><p className="micro-label">Linked move</p>{booking ? <Link to="/bookings/$ref" params={{ ref: booking.ref }} className="mt-1 block text-sm font-semibold hover:underline">{booking.ref} · {booking.route}</Link> : <p className="mt-1 text-sm text-muted-foreground">No move linked to this conversation.</p>}</div><div className="text-right">{booking && <><StatusBadge status={booking.status} /><p className="mt-2 text-xs text-muted-foreground">{formatLondon(booking.moveAt)}</p></>}</div></div></aside>}
  </section>;
}