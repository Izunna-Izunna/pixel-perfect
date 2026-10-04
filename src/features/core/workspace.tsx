import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Bot, ChevronDown, Command, FileClock, Gauge, HeartPulse, Inbox, ListTodo, MapPin, Menu, MoreHorizontal, Moon, PanelLeft, PanelLeftClose, Search, Settings, ShieldCheck, Sun, Ticket, Users, WalletCards, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { londonClock } from "@/lib/time";
import { useOperations } from "./operations-store";

const groups = [
  { title: "Work", items: [{ label: "Overview", to: "/", icon: Gauge }, { label: "Inbox", to: "/inbox", icon: Inbox, count: 3 }, { label: "Needs attention", to: "/attention", icon: ListTodo, count: 4 }, { label: "Quote tool", to: "/quotes/new", icon: WalletCards }, { label: "Reminders", to: "/reminders", icon: FileClock }, { label: "Tickets", to: "/escalations", icon: Ticket }] },
  { title: "Records", items: [{ label: "Bookings", to: "/bookings", icon: MapPin }, { label: "Movers", to: "/movers", icon: Users }, { label: "Customers", to: "/customers", icon: Users }] },
  { title: "Money", items: [{ label: "Payments", to: "/payments", icon: WalletCards }, { label: "System", to: "/system", icon: HeartPulse }, { label: "Settings", to: "/settings/operations", icon: Settings }] },
];

export function CaryMark({ compact = false }: { compact?: boolean }) { return <div className="flex items-center gap-2"><span className="relative grid size-8 place-items-center rounded-md bg-live text-primary-foreground"><span className="size-2 rounded-sm border-2 border-primary-foreground" /><span className="absolute size-4 border border-primary-foreground/70" /></span>{!compact && <span className="text-base font-semibold tracking-normal">cary</span>}</div>; }

export function Workspace({ title, children, immersive = false }: { title: string; children: ReactNode; immersive?: boolean }) {
  const location = useLocation(); const navigate = useNavigate(); const { bookings, conversations, customers, movers, notifications, attention } = useOperations(); const [menuOpen, setMenuOpen] = useState(false); const [paletteOpen, setPaletteOpen] = useState(false); const [paletteQuery, setPaletteQuery] = useState(""); const [dark, setDark] = useState(false); const [clock, setClock] = useState(londonClock());
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { const timer = window.setInterval(() => setClock(londonClock()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { const saved = window.sessionStorage.getItem("cary-theme"); setDark(saved === "dark"); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); window.sessionStorage.setItem("cary-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setPaletteOpen(true); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); }, []);
  const openResult = (to: string) => { setPaletteOpen(false); void navigate({ to }); };
  const query = paletteQuery.trim().toLowerCase();
  const bookingResults = bookings.filter((booking) => `${booking.ref} ${booking.customer} ${booking.route}`.toLowerCase().includes(query)).slice(0, 4);
  const conversationResults = conversations.filter((conversation) => `${conversation.name} ${conversation.preview}`.toLowerCase().includes(query)).slice(0, 4);
  const moverResults = movers.filter((mover) => `${mover.name} ${mover.businessName}`.toLowerCase().includes(query)).slice(0, 3);
  const customerResults = customers.filter((customer) => customer.name.toLowerCase().includes(query)).slice(0, 3);
  const unreadNotifications = notifications.filter((notification) => !notification.read).length;

  return <div className="min-h-screen bg-background">
    <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-card p-4 transition-all duration-300 md:flex md:flex-col ${collapsed ? "w-20" : "w-60"}`}>
      <div className={`flex items-center px-2 py-2 ${collapsed ? "justify-center" : "justify-between"}`}>
        <CaryMark compact={collapsed} />
        {!collapsed && <Button variant="ghost" size="icon" aria-label="Collapse navigation" onClick={() => setCollapsed(true)}><PanelLeftClose /></Button>}
        {collapsed && <Button variant="ghost" size="icon" aria-label="Expand navigation" onClick={() => setCollapsed(false)}><PanelLeft /></Button>}
      </div>
      <nav className="mt-7 flex-1 space-y-6">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed && <p className="micro-label px-3">{group.title}</p>}
            <div className={`mt-2 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${active ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"} ${collapsed ? "w-10 justify-center px-0" : "w-full"}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={17} />
                    {!collapsed && <span className="flex-1">{item.label}</span>}
                    {!collapsed && (item.to === "/attention" ? attention.length : item.count) ? <span className="grid size-5 place-items-center rounded-full bg-danger text-[10px] font-bold text-destructive-foreground">{item.to === "/attention" ? attention.length : item.count}</span> : null}
                    {collapsed && item.count ? <span className="absolute ml-6 mt-[-16px] grid size-4 place-items-center rounded-full bg-danger text-[8px] font-bold text-destructive-foreground">{item.count}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="rounded-md border border-border bg-muted/60 p-3">
          <div className="flex items-center gap-2 text-xs font-medium"><span className="pulse-dot size-2 rounded-full bg-live" />System healthy</div>
          <p className="mt-1 text-xs text-muted-foreground">All services reporting normally.</p>
        </div>
      )}
    </aside>
    <main className={`transition-all duration-300 ${collapsed ? "md:pl-20" : "md:pl-60"}`}>
      {!immersive && <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-7">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu /></Button>
          <h1 className="text-base font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPaletteOpen(true)} className="hidden h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground sm:flex">
            <Search size={15} />
            <span>Search anything</span>
            <kbd className="rounded border border-border px-1.5 text-[10px]">⌘K</kbd>
          </button>
          <span className="hidden px-2 font-mono text-xs text-muted-foreground lg:block">{clock}</span>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button>
          <Button asChild variant="ghost" size="icon" aria-label={`Notifications${unreadNotifications ? `, ${unreadNotifications} unread` : ""}`}><Link to="/notifications"><Bell />{unreadNotifications ? <span className="sr-only">{unreadNotifications} unread</span> : null}</Link></Button>
          <Link to="/settings/account" className="ml-1 flex items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted">
            <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground">AO</span>
            <span className="hidden sm:block">
              <span className="block text-xs font-semibold">Amelia Owen</span>
              <span className="block text-[10px] text-muted-foreground">Operator</span>
            </span>
            <ChevronDown size={14} />
          </Link>
        </div>
      </header>}
      <div className={immersive ? "h-[100svh] md:h-screen" : "mx-auto max-w-[1600px] p-4 pb-24 md:p-7 md:pb-7"}>{children}</div>
    </main>
    {!immersive && <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-border bg-card px-2 md:hidden">
      <Link to="/" className="grid place-items-center gap-1 text-[10px] text-muted-foreground"><Gauge size={18} />Overview</Link>
      <Link to="/inbox" className="grid place-items-center gap-1 text-[10px] text-muted-foreground"><Inbox size={18} />Inbox</Link>
      <Link to="/attention" className="grid place-items-center gap-1 text-[10px] text-muted-foreground"><ListTodo size={18} />Attention</Link>
      <button onClick={() => setMenuOpen(true)} className="grid place-items-center gap-1 text-[10px] text-muted-foreground"><MoreHorizontal size={18} />More</button>
    </nav>}
    {menuOpen && (
      <div className="fixed inset-0 z-50 bg-background p-5 md:hidden">
        <div className="flex items-center justify-between"><CaryMark /><Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></Button></div>
        <div className="mt-8 space-y-7">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="micro-label">{group.title}</p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium">
                    <item.icon size={18} />{item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
    {paletteOpen && (
      <div className="fixed inset-0 z-50 grid place-items-start bg-foreground/20 px-4 pt-[12vh]">
        <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-popover shadow-sm">
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Command size={18} className="text-foreground" />
            <Input autoFocus value={paletteQuery} onChange={(event) => setPaletteQuery(event.target.value)} placeholder="Search bookings, people and actions…" className="h-14 border-0 px-0 shadow-none focus-visible:ring-0" onKeyDown={(event) => { if (event.key === "Escape") setPaletteOpen(false); }} />
          </div>
          <div className="p-2">
            <p className="micro-label px-2 py-2">Jump to</p>
            {bookingResults.map((booking) => (
                <button key={booking.ref} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted" onClick={() => openResult(`/bookings/${booking.ref}`)}>
                <span className="grid size-8 place-items-center rounded-md bg-live-tint text-live-foreground"><MapPin size={16} /></span>
                <span className="flex-1"><span className="block font-mono text-sm font-semibold">{booking.ref}</span><span className="block text-xs text-muted-foreground">{booking.customer} · {booking.route}</span></span>
              </button>
            ))}
            {conversationResults.map((conversation) => (
               <button key={conversation.id} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted" onClick={() => openResult(`/inbox/${conversation.id}`)}>
                <span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground"><Bot size={16} /></span>
                <span><span className="block text-sm font-medium">Message {conversation.name}</span><span className="block text-xs text-muted-foreground">{conversation.role}</span></span>
              </button>
             ))}
             {moverResults.map((mover) => <button key={mover.id} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted" onClick={() => openResult(`/movers/${mover.id}`)}><span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground"><Users size={16} /></span><span><span className="block text-sm font-medium">{mover.name}</span><span className="block text-xs text-muted-foreground">Mover · {mover.businessName}</span></span></button>)}
             {customerResults.map((customer) => <button key={customer.id} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted" onClick={() => openResult(`/customers/${customer.id}`)}><span className="grid size-8 place-items-center rounded-md bg-muted text-muted-foreground"><Users size={16} /></span><span><span className="block text-sm font-medium">{customer.name}</span><span className="block text-xs text-muted-foreground">Customer</span></span></button>)}
             {!bookingResults.length && !conversationResults.length && !moverResults.length && !customerResults.length && <p className="px-3 py-8 text-center text-sm text-muted-foreground">No matching records.</p>}
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground"><ShieldCheck className="mr-1 inline size-3" />Search stays inside Cary.</div>
        </div>
      </div>
    )}
  </div>;
}
