import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Workspace } from "@/features/core/workspace";
import { Input } from "@/components/ui/input";
import { ChatView } from "@/features/inbox/chat-view";
import { StatusBadge } from "@/features/core/status-badge";
import { useOperations } from "@/features/core/operations-store";

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
  const { conversations, markRead } = useOperations();
  const [filter, setFilter] = useState<"all" | "needs" | "taken">("all"); const [query, setQuery] = useState("");
  const selected = conversations[0];
  const filtered = conversations.filter((conversation) => {
    const matches = `${conversation.name} ${conversation.role} ${conversation.preview}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "all" || filter === "taken" ? filter !== "taken" || conversation.takeover : conversation.unread || conversation.window === "closed");
  });

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
            <button onClick={() => setFilter("taken")} className={`${filter === "taken" ? "border-b-2 border-foreground font-semibold" : "text-muted-foreground"} px-3 py-2 text-xs`}>Taken over</button>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((conversation) => (
              <Link 
                to="/inbox/$sessionId" 
                params={{ sessionId: conversation.id }} 
                className={`flex w-full gap-3 p-4 text-left ${selected.id === conversation.id ? "bg-accent" : "hover:bg-muted"}`} 
                key={conversation.id} onClick={() => markRead(conversation.id)}
              >
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
              </Link>
            ))}{!filtered.length && <p className="p-5 text-sm text-muted-foreground">No conversations match this view.</p>}
          </div>
        </aside>
        
        <div className="hidden lg:flex">
          <ChatView conversation={selected} />
        </div>
        
        <aside className="hidden border-l border-border p-5 lg:block">
          <p className="micro-label">Conversation context</p>
          <h2 className="mt-2 text-base font-semibold">{selected.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">+44 7•• ••• 1234</p>
          <div className="mt-6 border-t border-border pt-5">
            <p className="micro-label">Active booking</p>
            <Link to="/bookings" className="mt-2 block border border-border p-3 hover:bg-muted">
              <p className="font-mono text-xs font-semibold">CARY-8291</p>
              <p className="mt-1 text-xs text-muted-foreground">CF10 1AA → CF24 4PB</p>
              <p className="mt-2 text-xs font-medium text-live-foreground">In transit</p>
            </Link>
          </div>
        </aside>
      </div>
    </Workspace>
  );
}
