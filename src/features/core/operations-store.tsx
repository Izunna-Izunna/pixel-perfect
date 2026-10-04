import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { attentionItems as seedAttention, bookings as seedBookings, conversations as seedConversations, customers as seedCustomers, movers as seedMovers, type AttentionItem, type Booking, type Conversation, type CustomerRecord, type MoverRecord } from "./mock-data";

export type ChatMessage = { id: string; sender: "customer" | "mover" | "scout" | "operator"; body: string; createdAt: string; delivery: "sent" | "delivered" | "read"; mediaName?: string; templateName?: string };
type Notification = { id: string; title: string; detail: string; href: string; read: boolean; createdAt: string };
export type AuditEvent = { id: string; title: string; detail: string; createdAt: string; href?: string };
export type Reminder = { id: string; bookingRef: string; audience: "customer" | "mover"; scheduledFor: string; status: "scheduled" | "sent" | "cancelled"; label: string };
export type Ticket = { id: string; bookingRef: string; customer: string; title: string; status: "open" | "investigating" | "resolved"; priority: "high" | "normal"; detail: string };
type OperationsStore = {
  bookings: Booking[];
  conversations: Conversation[];
  attention: AttentionItem[];
  customers: CustomerRecord[];
  movers: MoverRecord[];
  messages: Record<string, ChatMessage[]>;
  notifications: Notification[];
  audit: AuditEvent[];
  reminders: Reminder[];
  tickets: Ticket[];
  scoutPaused: boolean;
  sendMessage: (sessionId: string, body: string, mediaName?: string) => void;
  sendTemplate: (sessionId: string, templateName: string, body: string) => void;
  setTakeover: (sessionId: string, isPaused: boolean, note: string) => void;
  markRead: (sessionId: string) => void;
  resolveAttention: (id: string) => void;
  assignMover: (bookingRef: string, mover: { id: string; name: string }, payout: number, note: string) => void;
  releasePayout: (bookingRef: string) => void;
  refundPayment: (bookingRef: string, amount: number, note: string) => void;
  createBooking: () => string;
  addMover: () => string;
  addCustomerNote: (customerId: string, note: string) => void;
  setMoverDocumentStatus: (moverId: string, status: MoverRecord["licenceStatus"], note: string) => void;
  completeBooking: (bookingRef: string) => void;
  redispatchBooking: (bookingRef: string) => void;
  sendPaymentLink: (bookingRef: string) => void;
  sendReminder: (id: string) => void;
  toggleScoutPaused: () => void;
  resolveTicket: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
};

const OperationsContext = createContext<OperationsStore | null>(null);
const now = "2026-10-04T13:45:00Z";
const initialMessages: Record<string, ChatMessage[]> = Object.fromEntries(seedConversations.map((conversation) => [conversation.id, [
  { id: `${conversation.id}-welcome`, sender: conversation.role === "Mover" ? "mover" : "customer", body: `Hi, I’m checking in about the move.`, createdAt: "2026-10-04T12:38:00Z", delivery: "read" },
  { id: `${conversation.id}-scout`, sender: "scout", body: conversation.preview, createdAt: "2026-10-04T12:42:00Z", delivery: "read" },
]]));
const initialNotifications: Notification[] = [
  { id: "n1", title: "Payment needs attention", detail: "CARY-8271 payment link has been waiting for 42 minutes.", href: "/bookings/CARY-8271", read: false, createdAt: now },
  { id: "n2", title: "Mover documents ready", detail: "Megan Price has submitted insurance and licence documents.", href: "/movers/megan-price", read: false, createdAt: now },
  { id: "n3", title: "Conversation waiting", detail: "Sian Morgan has been waiting for a mover response.", href: "/inbox/s3", read: false, createdAt: now },
];
const initialReminders: Reminder[] = [
  { id: "r1", bookingRef: "CARY-8291", audience: "mover", scheduledFor: "2026-10-04T13:30:00Z", status: "scheduled", label: "Arrival check" },
  { id: "r2", bookingRef: "CARY-8288", audience: "customer", scheduledFor: "2026-10-04T15:30:00Z", status: "scheduled", label: "Move reminder" },
  { id: "r3", bookingRef: "CARY-8271", audience: "customer", scheduledFor: "2026-10-05T12:00:00Z", status: "scheduled", label: "Payment follow-up" },
];
const initialTickets: Ticket[] = [
  { id: "TKT-104", bookingRef: "CARY-8279", customer: "Rhodri Hughes", title: "Completion confirmation missing", status: "open", priority: "high", detail: "Move time has passed. Confirm completion before releasing the mover payout." },
  { id: "TKT-105", bookingRef: "CARY-8271", customer: "Bethan Lewis", title: "Payment link follow-up", status: "investigating", priority: "normal", detail: "Customer asked for a new mock payment link after the earlier link expired." },
];

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState(seedBookings);
  const [conversations, setConversations] = useState(seedConversations);
  const [attention, setAttention] = useState(seedAttention);
  const [customers] = useState(seedCustomers);
  const [movers, setMovers] = useState(seedMovers);
  const [messages, setMessages] = useState(initialMessages);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [reminders, setReminders] = useState(initialReminders);
  const [tickets, setTickets] = useState(initialTickets);
  const [scoutPaused, setScoutPaused] = useState(false);
  const recordAudit = useCallback((title: string, detail: string, href?: string) => setAudit((items) => [{ id: `audit-${Date.now()}`, title, detail, ...(href ? { href } : {}), createdAt: now }, ...items]), []);
  const markRead = useCallback((sessionId: string) => setConversations((items) => items.map((item) => item.id === sessionId ? { ...item, unread: false } : item)), []);
  const sendMessage = useCallback((sessionId: string, body: string, mediaName?: string) => {
    const trimmed = body.trim();
    if (!trimmed && !mediaName) return;
    const id = `${sessionId}-${Date.now()}`;
    const newMessage: ChatMessage = mediaName ? { id, sender: "operator", body: trimmed || `Attached ${mediaName}`, createdAt: now, delivery: "sent", mediaName } : { id, sender: "operator", body: trimmed, createdAt: now, delivery: "sent" };
    setMessages((current) => ({ ...current, [sessionId]: [...(current[sessionId] ?? []), newMessage] }));
    setConversations((items) => items.map((item) => item.id === sessionId ? { ...item, preview: trimmed || `Attachment: ${mediaName ?? "file"}`, at: "Now", unread: false } : item));
  }, []);
  const sendTemplate = useCallback((sessionId: string, templateName: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const id = `${sessionId}-template-${Date.now()}`;
    setMessages((current) => ({ ...current, [sessionId]: [...(current[sessionId] ?? []), { id, sender: "operator", body: trimmed, createdAt: now, delivery: "sent", templateName }] }));
    setConversations((items) => items.map((item) => item.id === sessionId ? { ...item, preview: `Template: ${templateName}`, at: "Now", unread: false } : item));
  }, []);
  const setTakeover = useCallback((sessionId: string, isPaused: boolean, note: string) => {
    setConversations((items) => items.map((item) => item.id === sessionId ? { ...item, takeover: isPaused } : item));
    setMessages((current) => ({ ...current, [sessionId]: [...(current[sessionId] ?? []), { id: `${sessionId}-takeover-${Date.now()}`, sender: "operator", body: isPaused ? `Scout paused. Handover note: ${note}` : "Scout resumed automatic replies.", createdAt: now, delivery: "read" }] }));
    recordAudit(isPaused ? "Scout paused for a conversation" : "Scout resumed for a conversation", note || `Conversation ${sessionId}`, `/inbox/${sessionId}`);
  }, [recordAudit]);
  const resolveAttention = useCallback((id: string) => setAttention((items) => items.filter((item) => item.id !== id)), []);
  const assignMover = useCallback((bookingRef: string, mover: { id: string; name: string }, payout: number, note: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, mover: mover.name, moverId: mover.id, total: payout + 7, status: "booked" } : booking));
    setAttention((items) => items.filter((item) => item.id !== "a2"));
    setNotifications((items) => [{ id: `n-assignment-${Date.now()}`, title: "Mover assigned", detail: `${mover.name} is assigned to ${bookingRef}.${note ? ` Note: ${note}` : ""}`, href: `/bookings/${bookingRef}`, read: false, createdAt: now }, ...items]);
    setReminders((items) => [...items, { id: `r-${Date.now()}`, bookingRef, audience: "mover", scheduledFor: now, status: "scheduled", label: "Assignment confirmation" }]);
    recordAudit("Mover assigned", `${mover.name} assigned to ${bookingRef} for £${payout.toFixed(2)}. ${note}`.trim(), `/bookings/${bookingRef}`);
  }, [recordAudit]);
  const releasePayout = useCallback((bookingRef: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, status: "completed" } : booking));
    setNotifications((items) => [{ id: `n-release-${Date.now()}`, title: "Mover payout released", detail: `The payout for ${bookingRef} is marked released in the mock ledger.`, href: `/bookings/${bookingRef}`, read: false, createdAt: now }, ...items]);
    recordAudit("Mover payout released", `Payout released for ${bookingRef} in the mock ledger.`, `/payments`);
  }, [recordAudit]);
  const refundPayment = useCallback((bookingRef: string, amount: number, note: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, total: Math.max(0, booking.total - amount), status: "cancelled" } : booking));
    setAttention((items) => items.filter((item) => item.type !== "payment"));
    setNotifications((items) => [{ id: `n-refund-${Date.now()}`, title: "Customer refund created", detail: `${bookingRef}: ${amount.toFixed(2)} refund logged.${note ? ` ${note}` : ""}`, href: `/payments`, read: false, createdAt: now }, ...items]);
    recordAudit("Customer refund recorded", `${bookingRef}: £${amount.toFixed(2)}. ${note}`, `/payments`);
  }, [recordAudit]);
  const createBooking = useCallback(() => {
    const ref = `CARY-${8300 + bookings.length}`;
    setBookings((items) => [{ ref, customer: "New mock customer", customerId: "elin-roberts", mover: null, moverId: null, route: "CF10 1AA → CF24 4PB", moveAt: "2026-10-06T09:00:00Z", status: "draft", total: 0, items: "Move details to confirm" }, ...items]);
    recordAudit("Mock booking created", `${ref} created as a draft.`, `/bookings/${ref}`);
    return ref;
  }, [bookings.length, recordAudit]);
  const addMover = useCallback(() => {
    const id = `mock-mover-${movers.length + 1}`;
    setMovers((items) => [...items, { id, name: "New mock mover", businessName: "New mock removals", phone: "+44 7700 900 000", status: "pending_verification", vehicles: ["Vehicle to review"], insurance: "Awaiting document", insuranceExpiresAt: now, licenceStatus: "submitted", licenceUploadedAt: now, rating: null, reviewCount: 0, joinedAt: now, verifiedAt: null, lastActiveAt: now, jobsCompleted: 0, acceptanceRate: "—", responseTime: "—", lifetimeEarnings: 0, openIssue: "Documents require review" }]);
    recordAudit("Mock mover added", "New mock mover is ready for document review.", `/movers/${id}`);
    return id;
  }, [movers.length, recordAudit]);
  const addCustomerNote = useCallback((customerId: string, note: string) => recordAudit("Customer note added", note, `/customers/${customerId}`), [recordAudit]);
  const setMoverDocumentStatus = useCallback((moverId: string, status: MoverRecord["licenceStatus"], note: string) => {
    setMovers((items) => items.map((mover) => mover.id === moverId ? { ...mover, licenceStatus: status, status: status === "approved" ? "verified" : status === "rejected" ? "rejected" : mover.status, verifiedAt: status === "approved" ? now : mover.verifiedAt, openIssue: status === "approved" ? null : note || mover.openIssue } : mover));
    setAttention((items) => status === "approved" ? items.filter((item) => item.moverId !== moverId) : items);
    recordAudit("Mover document reviewed", `${moverId}: ${status}. ${note}`, `/movers/${moverId}`);
  }, [recordAudit]);
  const completeBooking = useCallback((bookingRef: string) => { setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, status: "completed" } : booking)); setAttention((items) => items.filter((item) => item.bookingRef !== bookingRef)); recordAudit("Booking marked complete", bookingRef, `/bookings/${bookingRef}`); }, [recordAudit]);
  const redispatchBooking = useCallback((bookingRef: string) => { setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, mover: null, moverId: null, status: "dispatched" } : booking)); recordAudit("Booking redispatched", `${bookingRef} returned to the mock mover pool.`, `/bookings/${bookingRef}/assign`); }, [recordAudit]);
  const sendPaymentLink = useCallback((bookingRef: string) => { setNotifications((items) => [{ id: `n-payment-${Date.now()}`, title: "Mock payment link recorded", detail: `${bookingRef} payment-link follow-up recorded without contacting a payment provider.`, href: `/bookings/${bookingRef}`, read: false, createdAt: now }, ...items]); recordAudit("Mock payment link recorded", bookingRef, `/bookings/${bookingRef}`); }, [recordAudit]);
  const sendReminder = useCallback((id: string) => { setReminders((items) => items.map((item) => item.id === id ? { ...item, status: "sent" } : item)); const reminder = reminders.find((item) => item.id === id); if (reminder) recordAudit("Mock reminder sent", `${reminder.label} for ${reminder.bookingRef}.`, `/bookings/${reminder.bookingRef}`); }, [recordAudit, reminders]);
  const toggleScoutPaused = useCallback(() => { setScoutPaused((paused) => !paused); recordAudit("Global Scout status changed", scoutPaused ? "Scout resumed in mock mode." : "Scout paused in mock mode."); }, [recordAudit, scoutPaused]);
  const resolveTicket = useCallback((id: string) => { setTickets((items) => items.map((ticket) => ticket.id === id ? { ...ticket, status: "resolved" } : ticket)); recordAudit("Ticket resolved", id, "/escalations"); }, [recordAudit]);
  const markNotificationRead = useCallback((id: string) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item)), []);
  const markAllNotificationsRead = useCallback(() => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), []);
  const value = useMemo(() => ({ bookings, conversations, attention, customers, movers, messages, notifications, audit, reminders, tickets, scoutPaused, sendMessage, sendTemplate, setTakeover, markRead, resolveAttention, assignMover, releasePayout, refundPayment, createBooking, addMover, addCustomerNote, setMoverDocumentStatus, completeBooking, redispatchBooking, sendPaymentLink, sendReminder, toggleScoutPaused, resolveTicket, markNotificationRead, markAllNotificationsRead }), [bookings, conversations, attention, customers, movers, messages, notifications, audit, reminders, tickets, scoutPaused, sendMessage, sendTemplate, setTakeover, markRead, resolveAttention, assignMover, releasePayout, refundPayment, createBooking, addMover, addCustomerNote, setMoverDocumentStatus, completeBooking, redispatchBooking, sendPaymentLink, sendReminder, toggleScoutPaused, resolveTicket, markNotificationRead, markAllNotificationsRead]);
  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}
export function useOperations() { const context = useContext(OperationsContext); if (!context) throw new Error("OperationsProvider is required"); return context; }
