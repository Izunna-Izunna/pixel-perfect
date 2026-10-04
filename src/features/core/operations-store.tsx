import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { attentionItems as seedAttention, bookings as seedBookings, conversations as seedConversations, type AttentionItem, type Booking, type Conversation } from "./mock-data";

export type ChatMessage = { id: string; sender: "customer" | "mover" | "scout" | "operator"; body: string; createdAt: string; delivery: "sent" | "delivered" | "read"; mediaName?: string; templateName?: string };
type Notification = { id: string; title: string; detail: string; href: string; read: boolean; createdAt: string };
type OperationsStore = {
  bookings: Booking[];
  conversations: Conversation[];
  attention: AttentionItem[];
  messages: Record<string, ChatMessage[]>;
  notifications: Notification[];
  sendMessage: (sessionId: string, body: string, mediaName?: string) => void;
  sendTemplate: (sessionId: string, templateName: string, body: string) => void;
  setTakeover: (sessionId: string, isPaused: boolean, note: string) => void;
  markRead: (sessionId: string) => void;
  resolveAttention: (id: string) => void;
  assignMover: (bookingRef: string, mover: { id: string; name: string }, payout: number, note: string) => void;
  releasePayout: (bookingRef: string) => void;
  refundPayment: (bookingRef: string, amount: number, note: string) => void;
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

export function OperationsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState(seedBookings);
  const [conversations, setConversations] = useState(seedConversations);
  const [attention, setAttention] = useState(seedAttention);
  const [messages, setMessages] = useState(initialMessages);
  const [notifications, setNotifications] = useState(initialNotifications);
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
  }, []);
  const resolveAttention = useCallback((id: string) => setAttention((items) => items.filter((item) => item.id !== id)), []);
  const assignMover = useCallback((bookingRef: string, mover: { id: string; name: string }, payout: number, note: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, mover: mover.name, moverId: mover.id, total: payout + 7, status: "booked" } : booking));
    setAttention((items) => items.filter((item) => item.id !== "a2"));
    setNotifications((items) => [{ id: `n-assignment-${Date.now()}`, title: "Mover assigned", detail: `${mover.name} is assigned to ${bookingRef}.${note ? ` Note: ${note}` : ""}`, href: `/bookings/${bookingRef}`, read: false, createdAt: now }, ...items]);
  }, []);
  const releasePayout = useCallback((bookingRef: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, status: "completed" } : booking));
    setNotifications((items) => [{ id: `n-release-${Date.now()}`, title: "Mover payout released", detail: `The payout for ${bookingRef} is marked released in the mock ledger.`, href: `/bookings/${bookingRef}`, read: false, createdAt: now }, ...items]);
  }, []);
  const refundPayment = useCallback((bookingRef: string, amount: number, note: string) => {
    setBookings((items) => items.map((booking) => booking.ref === bookingRef ? { ...booking, total: Math.max(0, booking.total - amount), status: "cancelled" } : booking));
    setAttention((items) => items.filter((item) => item.type !== "payment"));
    setNotifications((items) => [{ id: `n-refund-${Date.now()}`, title: "Customer refund created", detail: `${bookingRef}: ${amount.toFixed(2)} refund logged.${note ? ` ${note}` : ""}`, href: `/payments`, read: false, createdAt: now }, ...items]);
  }, []);
  const markNotificationRead = useCallback((id: string) => setNotifications((items) => items.map((item) => item.id === id ? { ...item, read: true } : item)), []);
  const markAllNotificationsRead = useCallback(() => setNotifications((items) => items.map((item) => ({ ...item, read: true }))), []);
  const value = useMemo(() => ({ bookings, conversations, attention, messages, notifications, sendMessage, sendTemplate, setTakeover, markRead, resolveAttention, assignMover, releasePayout, refundPayment, markNotificationRead, markAllNotificationsRead }), [bookings, conversations, attention, messages, notifications, sendMessage, sendTemplate, setTakeover, markRead, resolveAttention, assignMover, releasePayout, refundPayment, markNotificationRead, markAllNotificationsRead]);
  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}
export function useOperations() { const context = useContext(OperationsContext); if (!context) throw new Error("OperationsProvider is required"); return context; }
