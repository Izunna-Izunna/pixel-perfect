import { ArrowLeft, Bot, Check, CheckCheck, ChevronDown, ExternalLink, Eye, FileText, Paperclip, PauseCircle, Send, UserRound, X, Zap } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { type Conversation as ConversationRecord } from "@/features/core/mock-data";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";
import { formatLondon } from "@/lib/time";
import { approvedTemplates, renderTemplate } from "./operations-catalog";
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
  const { messages, sendMessage, sendTemplate, setTakeover, markRead, bookings, movers, loadMessages } = useOperations();
  const [message, setMessage] = useState("");
  const [handover, setHandover] = useState(false);
  const [note, setNote] = useState("");
  const [attachment, setAttachment] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const closed = conversation.window === "closed";
  const thread = messages[conversation.id] ?? [];
  const booking = bookings.find((item) => item.customerId === conversation.contactId || item.moverId === conversation.contactId);
  const mover = conversation.role === "Mover" ? movers.find((item) => item.id === conversation.contactId) : undefined;
  const takeover = conversation.takeover;

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
                    {own && (item.delivery === "sent" ? <Check className="inline size-3" /> : <CheckCheck className="inline size-3 text-live-foreground" />)}
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
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => onContextPanelChange?.("templates")}>
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
              <Button type="button" variant="ghost" size="sm" onClick={() => onContextPanelChange?.("quickReplies")}>
                <Zap size={14} />Quick replies
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onContextPanelChange?.("templates")}>
                <FileText size={14} />Templates
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onContextPanelChange?.("scoutTools")}>
                Scout tools
              </Button>
              <span className="hidden text-[10px] text-muted-foreground sm:inline ml-auto">
                Press Enter to send · Shift+Enter for newline
              </span>
            </div>

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