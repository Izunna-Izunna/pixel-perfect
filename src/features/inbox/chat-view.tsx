import { ArrowLeft, Bot, Check, CheckCheck, ChevronDown, ChevronUp, ExternalLink, Eye, FileText, Paperclip, PauseCircle, Send, Sparkles, UserRound, X, Zap } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { type Conversation as ConversationRecord } from "@/features/core/mock-data";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { formatLondon } from "@/lib/time";
import { approvedTemplates, renderTemplate, scoutTools } from "./operations-catalog";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";

function extractImagesFromMessage(body: string): { text: string; images: string[] } {
  const images: string[] = [];
  if (!body) return { text: "", images: [] };

  // 1. Match [Photo uploaded: https://...]
  let cleaned = body.replace(/\[Photo uploaded:\s*(https?:\/\/[^\s\]]+)\]/gi, (_, url) => {
    if (url && !images.includes(url.trim())) images.push(url.trim());
    return "";
  });

  // 2. Match [Image: https://...]
  cleaned = cleaned.replace(/\[Image:\s*(https?:\/\/[^\s\]]+)\]/gi, (_, url) => {
    if (url && !images.includes(url.trim())) images.push(url.trim());
    return "";
  });

  // 3. Match Supabase storage URLs for photos
  cleaned = cleaned.replace(/(https?:\/\/[^\s<>'"]+?\/(?:job-photos|uploads)\/[^\s<>'"]+)/gi, (match) => {
    const trimmed = match.trim().replace(/[\])]$/, "");
    if (!images.includes(trimmed)) images.push(trimmed);
    return "";
  });

  // 4. Match common image formats
  cleaned = cleaned.replace(/(https?:\/\/[^\s<>'"]+?\.(?:jpe?g|png|webp|gif)(?:\?[^\s<>'"]*)?)/gi, (match) => {
    const trimmed = match.trim().replace(/[\])]$/, "");
    if (!images.includes(trimmed)) images.push(trimmed);
    return "";
  });

  return { text: cleaned.trim(), images };
}

export function ChatView({
  conversation,
  fullScreen = false,
  onAssignMover,
  onContextPanelChange,
  quickReplyRequest,
}: {
  conversation: ConversationRecord;
  fullScreen?: boolean;
  onAssignMover?: () => void;
  onContextPanelChange?: (panel: "details" | "quickReplies" | "scoutTools" | "templates") => void;
  quickReplyRequest?: { id: number; body: string } | null;
}) {
  const navigate = useNavigate();
  const { messages, sendMessage, sendTemplate, executeScoutTool, toolExecutions, setTakeover, markRead, bookings, movers, loadMessages } = useOperations();
  const [message, setMessage] = useState("");
  const [handover, setHandover] = useState(false);
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ── Mobile bottom-sheet panel (used when fullScreen and no onContextPanelChange) ──
  const [mobilePanel, setMobilePanel] = useState<"none" | "quickReplies" | "templates" | "scoutTools">("none");
  const [templateQuery, setTemplateQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateParameters, setTemplateParameters] = useState<Record<string, string>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [toolId, setToolId] = useState<string | null>(null);
  const [toolValues, setToolValues] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const closed = conversation.window === "closed";
  const thread = messages[conversation.id] ?? [];
  const booking = bookings.find((item) => item.customerId === conversation.contactId || item.moverId === conversation.contactId);
  const mover = conversation.role === "Mover" ? movers.find((item) => item.id === conversation.contactId) : undefined;
  const takeover = conversation.takeover;

  const matchingTemplates = approvedTemplates
    .filter((t) => t.target === conversation.role || t.target === "Admin Ops")
    .filter((t) => t.name.toLowerCase().includes(templateQuery.toLowerCase()));
  const selectedTemplate = approvedTemplates.find((t) => t.id === selectedTemplateId) ?? matchingTemplates[0];
  const templateDefaults_: Record<string, string> = (() => {
    const [pickup = "", dropoff = ""] = booking?.route.split(" → ") ?? [];
    const customer = booking?.customer ?? (conversation.role === "Customer" ? conversation.name : "");
    return { "1": customer.split(" ")[0] ?? "", "2": pickup, "3": dropoff, "4": mover?.businessName ?? "Verified Cary mover", "5": "", "6": booking ? formatLondon(booking.moveAt) : "", "7": booking?.items ?? "", "8": "Driver + 1 helper", "9": "", "10": booking?.ref ?? "", "11": conversation.role === "Mover" ? (mover?.businessName ?? conversation.name) : "" };
  })();
  const templateValues = { ...templateDefaults_, ...templateParameters };
  const renderedTemplate = selectedTemplate ? renderTemplate(selectedTemplate, templateValues) : "";
  const templateReady = Boolean(selectedTemplate?.parameters.every((p) => templateValues[p.key]?.trim()));
  const toolGroups = scoutTools.reduce<Record<string, Array<(typeof scoutTools)[number]>>>((groups, tool) => { const g = tool.group; (groups[g] ??= []).push(tool); return groups; }, {});
  const selectedTool = scoutTools.find((t) => t.id === toolId);

  function openPanel(panel: "quickReplies" | "templates" | "scoutTools") {
    if (!onContextPanelChange) {
      setMobilePanel((current) => current === panel ? "none" : panel);
    } else {
      onContextPanelChange(panel);
    }
  }


  useEffect(() => {
    markRead(conversation.id);
    loadMessages(conversation.id);
    endRef.current?.scrollIntoView({ block: "end" });
    inputRef.current?.focus();
  }, [conversation.id, markRead, loadMessages, thread.length]);


  useEffect(() => {
    if (quickReplyRequest) {
      setMessage(quickReplyRequest.body);
      inputRef.current?.focus();
    }
  }, [quickReplyRequest]);

  function send(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (closed) {
      onContextPanelChange?.("templates");
      return;
    }
    sendMessage(conversation.id, message, attachment || undefined);
    setMessage("");
    setAttachment("");
    inputRef.current?.focus();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <section className={`relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-card ${fullScreen ? "h-[100svh]" : ""}`}>
      {/* ── HEADER ── */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:flex sm:justify-between sm:gap-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {fullScreen && (
              <Button variant="ghost" size="icon" aria-label="Back to inbox" onClick={() => void navigate({ to: "/inbox" })}>
                <ArrowLeft />
              </Button>
            )}
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              {conversation.name.split(" ").map((name) => name[0]).join("")}
            </span>
            <div className="min-w-0">
              <Link
                to={conversation.role === "Mover" ? "/movers/$id" : "/customers/$id"}
                params={{ id: conversation.contactId }}
                className="block truncate text-sm font-semibold hover:underline"
              >
                {conversation.name}
              </Link>
              <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                <span className="shrink-0 text-xs text-muted-foreground">{conversation.role}</span>
                <span className={`truncate text-xs ${closed ? "text-warning" : "text-live-foreground"}`}>
                  {closed ? "24h window closed" : "Window open · Active"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {booking && onAssignMover && (
              <Button variant="outline" size="sm" onClick={onAssignMover}>
                Assign mover
              </Button>
            )}
            <Button
              variant={takeover ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (takeover) setTakeover(conversation.id, false, "");
                else setHandover(true);
              }}
            >
              <PauseCircle size={15} />
              <span className="hidden sm:inline">{takeover ? "Resume Scout" : "Take over"}</span>
            </Button>
          </div>
        </div>
        {!takeover && (
          <div className="flex items-center justify-between gap-2 border-t border-border bg-live-tint px-4 py-1.5 text-xs text-live-foreground">
            <span className="flex items-center gap-1.5 font-medium">
              <Bot size={14} />Scout auto-pilot active
            </span>
            <span className="hidden sm:inline text-[11px] text-muted-foreground">Human replies will pause Scout.</span>
          </div>
        )}
      </header>

      {handover && (
        <div className="shrink-0 border-b border-border bg-muted p-3">
          <label className="block text-xs font-semibold">
            Handover note
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 min-h-20"
              placeholder="What should the next operator know?"
            />
          </label>
          <div className="mt-2 flex gap-2">
            <Button size="sm" disabled={!note.trim()} onClick={() => { setTakeover(conversation.id, true, note); setHandover(false); setNote(""); }}>
              Confirm takeover
            </Button>
            <Button size="sm" variant="outline" onClick={() => setHandover(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {takeover && (
        <div className="shrink-0 flex items-center gap-2 border-b border-warning/30 bg-warning-tint px-4 py-2 text-xs text-warning">
          <StatusBadge status="operator" label="Human takeover" />
          <span>Scout is paused while operator replies directly.</span>
        </div>
      )}

      {/* ── SCROLLABLE MESSAGE THREAD ── */}
      <Conversation className="flex-1 min-h-0 overflow-y-auto bg-muted/30">
        <ConversationContent className="gap-4 p-4 sm:p-5">
          <div className="text-center">
            <span className="border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground rounded-full">
              Live WhatsApp Transcript · London Time
            </span>
          </div>

          {thread.map((item) => {
            const agentMessage = item.sender === "scout";
            const operatorMessage = item.sender === "operator";
            const own = agentMessage || operatorMessage;
            const { text, images } = extractImagesFromMessage(item.body);

            return (
              <Message key={item.id} from={own ? "user" : "assistant"} className={own ? "ml-auto max-w-[92%] sm:max-w-[78%]" : "max-w-[92%] sm:max-w-[78%]"}>
                <MessageContent className={agentMessage ? "border-l-2 border-live bg-card px-3.5 py-2.5 shadow-sm" : operatorMessage ? "border border-border bg-accent px-3.5 py-2.5 shadow-sm" : "border border-border bg-card px-3.5 py-2.5 shadow-sm"}>
                  <div className={`mb-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground ${own ? "justify-end" : ""}`}>
                    {agentMessage ? <Bot size={12} className="text-live" /> : operatorMessage ? <UserRound size={12} /> : null}
                    <span className="font-semibold">{operatorMessage ? "Amelia · Operator" : agentMessage ? "Scout · AI" : conversation.name}</span>
                    {item.templateName && <span className="rounded bg-muted px-1 py-0.2 text-[9px]">{item.templateName}</span>}
                  </div>

                  {/* Message Text Content */}
                  {text && <MessageResponse>{text}</MessageResponse>}

                  {/* Customer / Mover Photos */}
                  {images.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {images.map((imgUrl, i) => (
                        <div
                          key={i}
                          onClick={() => setPreviewImage(imgUrl)}
                          className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-black/5 hover:border-live transition-all shadow-sm"
                        >
                          <img
                            src={imgUrl}
                            alt="Shared photo"
                            className="max-h-56 max-w-[280px] sm:max-w-[340px] rounded-lg object-cover group-hover:scale-102 transition-transform"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                            <Eye size={15} /> Click to enlarge
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Attachment metadata */}
                  {item.mediaName && (
                    <div className="mt-2 flex items-center gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
                      <FileText size={14} />Attachment: {item.mediaName}
                    </div>
                  )}

                  <p className="mt-1.5 text-right text-[10px] text-muted-foreground">
                    {formatMessageTime(item.createdAt)}{" "}
                    {own && (
                      item.delivery === "failed" ? (
                        <span className="text-destructive font-semibold text-[10px]">Failed</span>
                      ) : item.delivery === "sent" ? (
                        <Check className="inline size-3" />
                      ) : (
                        <CheckCheck className="inline size-3 text-live-foreground" />
                      )
                    )}
                  </p>
                </MessageContent>
              </Message>
            );
          })}
          <div ref={endRef} />
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* ── STICKY INPUT COMPOSER ── */}
      <div className="shrink-0 border-t border-border bg-card p-3 sm:p-4">
        {closed ? (
          <div className="border border-warning/30 bg-warning-tint p-3 rounded-md">
            <p className="text-xs text-warning font-medium">24h WhatsApp window closed. Send an approved Meta template instead.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => openPanel("templates")}>
              Choose approved template <ChevronDown size={14} />
            </Button>
          </div>
        ) : (
          <>
            <PromptInput onSubmit={(_message, event) => send(event)}>
              <PromptInputTextarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Message as operator…"
                className="min-h-10 max-h-24 resize-none"
              />
              <PromptInputFooter className="justify-between">
                <div className="flex items-center gap-1">
                  <input
                    id={`attachment-${conversation.id}`}
                    type="file"
                    className="sr-only"
                    onChange={(event) => setAttachment(event.target.files?.[0]?.name ?? "")}
                  />
                  <label htmlFor={`attachment-${conversation.id}`}>
                    <Button type="button" variant="ghost" size="icon" aria-label="Attach file" asChild>
                      <span><Paperclip size={16} /></span>
                    </Button>
                  </label>
                </div>
                <PromptInputSubmit status="ready" disabled={!message.trim() && !attachment}>
                  <Send size={15} />
                </PromptInputSubmit>
              </PromptInputFooter>
            </PromptInput>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button type="button" variant={mobilePanel === "quickReplies" ? "secondary" : "ghost"} size="sm" onClick={() => openPanel("quickReplies")}>
                <Zap size={14} />Quick replies
              </Button>
              <Button type="button" variant={mobilePanel === "templates" ? "secondary" : "ghost"} size="sm" onClick={() => openPanel("templates")}>
                <FileText size={14} />Templates
              </Button>
              <Button type="button" variant={mobilePanel === "scoutTools" ? "secondary" : "ghost"} size="sm" onClick={() => openPanel("scoutTools")}>
                <Bot size={14} />Scout tools
              </Button>
              <span className="hidden text-[10px] text-muted-foreground sm:inline ml-auto">
                Press Enter to send · Shift+Enter for newline
              </span>
            </div>

            {/* placeholder — drawer is rendered at section root below */}

            {/* ── MOBILE TOOL EXECUTION DIALOG ── */}
            {!onContextPanelChange && selectedTool && (
              <Dialog open={Boolean(selectedTool)} onOpenChange={(open) => { if (!open) setToolId(null); }}>
                <DialogContent className="max-h-[85svh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedTool.name}</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-3">
                    {selectedTool.fields.map((field) => (
                      <label className="text-sm font-medium" key={field}>
                        {field}
                        <Input className="mt-1" value={toolValues[field] ?? ""} onChange={(e) => setToolValues((v) => ({ ...v, [field]: e.target.value }))} />
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setToolId(null)}>Cancel</Button>
                    <Button
                      disabled={!selectedTool.fields.every((f) => toolValues[f]?.trim())}
                      onClick={() => {
                        executeScoutTool({ conversationId: conversation.id, toolId: selectedTool.id, toolName: selectedTool.name, inputSummary: selectedTool.fields.map((f) => `${f}: ${toolValues[f]}`).join(" · "), outcome: selectedTool.outcome });
                        setToolId(null); setToolValues({});
                      }}
                    >Record {selectedTool.outcome}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {attachment && (
              <div className="mt-2 flex items-center justify-between border border-border bg-muted px-2.5 py-1 text-xs rounded">
                <span className="truncate">{attachment}</span>
                <Button type="button" size="icon" variant="ghost" aria-label="Remove attachment" onClick={() => setAttachment("")}>
                  <X size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PHOTO LIGHTBOX DIALOG ── */}
      <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 bg-background">
          <DialogHeader className="p-4 border-b border-border flex flex-row items-center justify-between">
            <DialogTitle className="text-base font-semibold">Customer Shared Photo</DialogTitle>
            {previewImage && (
              <Button asChild variant="outline" size="sm" className="mr-6">
                <a href={previewImage} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} className="mr-1.5" /> Open original
                </a>
              </Button>
            )}
          </DialogHeader>
          <div className="max-h-[75vh] overflow-auto bg-black/95 p-4 flex items-center justify-center">
            {previewImage && (
              <img
                src={previewImage}
                alt="Enlarged customer photo"
                className="max-h-[70vh] max-w-full rounded object-contain shadow-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RIGHT-SLIDING MOBILE DRAWER (no parent side panel) ── */}
      {!onContextPanelChange && (
        <>
          {/* Backdrop — dims chat, closes drawer on tap */}
          <div
            className={`absolute inset-0 z-20 bg-black/40 transition-opacity duration-300 ${mobilePanel !== "none" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
            onClick={() => setMobilePanel("none")}
          />

          {/* Drawer panel */}
          <div
            className={`absolute inset-y-0 right-0 z-30 flex w-[85%] max-w-sm flex-col bg-card shadow-2xl border-l border-border transition-transform duration-300 ease-in-out ${mobilePanel !== "none" ? "translate-x-0" : "translate-x-full"}`}
          >
            {/* Drawer header */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="micro-label">
                  {mobilePanel === "quickReplies" && "Quick replies"}
                  {mobilePanel === "templates" && "Approved templates"}
                  {mobilePanel === "scoutTools" && "Scout tools"}
                </p>
                <p className="mt-0.5 text-sm font-semibold">
                  {mobilePanel === "quickReplies" && "Reply shortcuts"}
                  {mobilePanel === "templates" && "WhatsApp message library"}
                  {mobilePanel === "scoutTools" && "Operations actions"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobilePanel("none")} aria-label="Close panel">
                <X size={16} />
              </Button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-4">

              {/* Quick Replies */}
              {mobilePanel === "quickReplies" && (
                <div className="grid gap-2">
                  <p className="text-xs text-muted-foreground mb-1">Choose a reply to add it to the composer.</p>
                  {["Hi there! I'm jumping in from the Cary operations team to help directly.", "Your mover has confirmed and is currently en route to your pickup location.", "Could you please upload a quick photo of the items and the doorway or stairs?"].map((reply, i) => (
                    <Button key={i} variant="outline" className="h-auto justify-start whitespace-normal px-3 py-3 text-left text-xs" onClick={() => { setMessage(reply); setMobilePanel("none"); inputRef.current?.focus(); }}>
                      <Zap size={13} className="shrink-0" />{reply}
                    </Button>
                  ))}
                </div>
              )}

              {/* Templates */}
              {mobilePanel === "templates" && (
                <div>
                  <p className="text-xs text-muted-foreground mb-3">Use a template when the 24-hour window is closed.</p>
                  <Input className="h-9 mb-3" value={templateQuery} onChange={(e) => setTemplateQuery(e.target.value)} placeholder="Search templates" />
                  <div className="grid gap-1 mb-4">
                    {matchingTemplates.map((t) => (
                      <Button key={t.id} variant={t.id === selectedTemplate?.id ? "secondary" : "ghost"} className="justify-start text-xs h-9" onClick={() => { setSelectedTemplateId(t.id); setTemplateParameters({}); }}>
                        {t.name}
                      </Button>
                    ))}
                    {!matchingTemplates.length && <p className="text-xs text-muted-foreground px-2">No templates match.</p>}
                  </div>
                  {selectedTemplate && (
                    <div className="border border-border bg-muted/40 p-3 rounded-md">
                      <p className="text-sm font-semibold">{selectedTemplate.name}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{selectedTemplate.category} · {selectedTemplate.target}</p>
                      <div className="mt-3 grid gap-2">
                        {selectedTemplate.parameters.map((param) => (
                          <label className="text-xs font-medium" key={param.key}>
                            {`{{${param.key}}}`} · {param.label}
                            <Input className="mt-1 h-8" value={templateValues[param.key] ?? ""} onChange={(e) => setTemplateParameters((cur) => ({ ...cur, [param.key]: e.target.value }))} />
                          </label>
                        ))}
                      </div>
                      {renderedTemplate && (
                        <div className="mt-3 border border-border bg-card p-3 rounded">
                          <p className="micro-label">Preview</p>
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-5">{renderedTemplate}</p>
                        </div>
                      )}
                      <Button
                        className="mt-3 w-full"
                        size="sm"
                        disabled={!templateReady}
                        onClick={() => {
                          const params = selectedTemplate.parameters.map(
                            (p) => templateValues[p.key]?.trim() || ""
                          );
                          sendTemplate(conversation.id, selectedTemplate.id, params, renderedTemplate);
                          setMobilePanel("none");
                        }}
                      >
                        Send approved template
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Scout Tools */}
              {mobilePanel === "scoutTools" && (
                <div>
                  <p className="text-xs text-muted-foreground mb-4">Open only the group you need, then record the operational result.</p>
                  <div className="grid gap-2">
                    {Object.entries(toolGroups).map(([group, tools]) => (
                      <div className="border border-border rounded-md overflow-hidden" key={group}>
                        <Button variant="ghost" className="w-full justify-between rounded-none text-xs font-medium" onClick={() => setExpandedGroups((g) => ({ ...g, [group]: !g[group] }))}>
                          {group}
                          <ChevronDown className={`size-3.5 transition-transform ${expandedGroups[group] ? "rotate-180" : ""}`} />
                        </Button>
                        {expandedGroups[group] && (
                          <div className="border-t border-border bg-muted/20 p-1">
                            {tools.map((tool) => (
                              <Button key={tool.id} variant="ghost" size="sm" className="w-full justify-start text-left text-xs" onClick={() => { setToolId(tool.id); setToolValues({}); }}>
                                <Bot size={12} />{tool.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {toolExecutions.filter((item) => item.conversationId === conversation.id).length > 0 && (
                    <div className="mt-5 border-t border-border pt-4">
                      <p className="micro-label">Recent tool activity</p>
                      {toolExecutions.filter((item) => item.conversationId === conversation.id).slice(0, 3).map((item) => (
                        <p className="mt-2 text-xs" key={item.id}>{item.toolName}<span className="block text-muted-foreground">{item.outcome}</span></p>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </>
      )}

    </section>

  );
}

function formatMessageTime(timestamp: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/London",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
}