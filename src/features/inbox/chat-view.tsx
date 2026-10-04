import { ArrowLeft, Bot, CheckCheck, Paperclip, Send, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Conversation } from "@/features/core/mock-data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/features/core/status-badge";

export function ChatView({ conversation, fullScreen = false }: { conversation: Conversation; fullScreen?: boolean }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  const [takeover, setTakeover] = useState(conversation.takeover);
  const [templates, setTemplates] = useState(false);
  const closed = conversation.window === "closed";

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim() || closed) return;
    setSent((current) => [...current, message.trim()]);
    setMessage("");
  }

  return (
    <section className={`flex min-h-0 flex-1 flex-col bg-card ${fullScreen ? "min-h-[calc(100vh-4rem)]" : ""}`}>
      <header className="flex min-h-16 items-center justify-between border-b border-border px-4">
        <div className="flex min-w-0 items-center gap-3">
          {fullScreen && (
            <Button variant="ghost" size="icon" aria-label="Back to inbox" onClick={() => void navigate({ to: "/inbox" })}>
              <ArrowLeft />
            </Button>
          )}
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {conversation.name.split(" ").map((name) => name[0]).join("")}
          </span>
          <div className="min-w-0">
            <Link to={conversation.role === "Mover" ? "/movers/$id" : "/customers/$id"} params={{ id: conversation.contactId }} className="block truncate text-sm font-semibold hover:underline">
              {conversation.name}
            </Link>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{conversation.role}</span>
              <span className={closed ? "text-xs text-warning" : "text-xs text-live-foreground"}>
                {closed ? "24h window closed" : "Window open for 8h 24m"}
              </span>
            </div>
          </div>
        </div>
        <Button variant={takeover ? "default" : "outline"} size="sm" onClick={() => setTakeover(!takeover)}>
          {takeover ? "Resume Scout" : "Take over"}
        </Button>
      </header>
      
      {takeover && (
        <div className="flex items-center gap-2 border-b border-border bg-muted px-5 py-2 text-xs">
          <StatusBadge status="operator" label="Operator" />
          <span className="text-muted-foreground">Amelia took over this conversation 3 minutes ago.</span>
        </div>
      )}
      
      <div className="flex-1 space-y-4 overflow-y-auto bg-muted/40 p-5">
        <div className="text-center">
          <span className="border border-border bg-card px-2 py-1 text-[10px] text-muted-foreground">Today, London time</span>
        </div>
        <div className="max-w-[78%] border border-border bg-card p-3 text-sm">
          <p>Hi {conversation.name.split(" ")[0]}, I’m finding a verified mover for you now.</p>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">13:38</p>
        </div>
        <div className="ml-auto max-w-[78%] border border-border bg-muted p-3 text-sm">
          <div className="mb-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground"><Bot size={11} />Scout</div>
          <p>{conversation.preview}</p>
          <p className="mt-1 text-right text-[10px] text-muted-foreground">13:42 <CheckCheck className="inline size-3" /></p>
        </div>
        {sent.map((item) => (
          <div className="ml-auto max-w-[78%] border border-border bg-muted p-3 text-sm" key={item}>
            <div className="mb-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground"><UserRound size={11} />Amelia</div>
            <p>{item}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={send} className="border-t border-border p-4">
        {closed ? (
          <div className="border border-warning/30 bg-warning-tint p-3">
            <p className="text-xs text-warning">24h window closed. Send an approved template instead.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setTemplates(!templates)}>Choose template</Button>
            {templates && (
              <div className="mt-2 border border-border bg-card p-3 text-xs">
                <p className="font-semibold">Move availability update</p>
                <p className="mt-1 text-muted-foreground">Hello {conversation.name.split(" ")[0]}, we are checking availability for your move.</p>
                <Button size="sm" className="mt-3" onClick={() => { setTemplates(false); toast.success("Template sent!"); }}>Send template</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" aria-label="Attach file" onClick={() => toast.info("File attachment coming soon.")}>
              <Paperclip size={18} />
            </Button>
            <Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message as Amelia…" className="h-10" />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send size={16} />
            </Button>
          </div>
        )}
      </form>
    </section>
  );
}
