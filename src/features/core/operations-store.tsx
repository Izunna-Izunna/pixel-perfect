import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  AttentionItem,
  Booking,
  Conversation,
  CustomerRecord,
  MoverRecord,
} from "./mock-data";
import * as api from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import {
  mapApiBookingToBooking,
  mapApiCustomerToCustomerRecord,
  mapApiMoverToMoverRecord,
  mapApiConversationToConversation,
  mapApiTicketToTicket,
  computeAttentionItems,
} from "./data-mappers";

export type ChatMessage = {
  id: string;
  sender: "customer" | "mover" | "scout" | "operator";
  body: string;
  createdAt: string;
  delivery: "sent" | "delivered" | "read";
  mediaName?: string;
  templateName?: string;
};

export type QuoteRecord = {
  id: string;
  bookingRef: string;
  moverId: string | null;
  moverName: string | null;
  payout: number;
  platformFee: number;
  customerTotal: number;
  vanSize: string;
  loadingHelp: string;
  access: string;
  pickup: string;
  dropoff: string;
  items: string;
  note: string;
  status: "draft" | "submitted" | "payment_prepared";
  createdAt: string;
};

export type ToolExecution = {
  id: string;
  conversationId: string;
  toolId: string;
  toolName: string;
  inputSummary: string;
  outcome: string;
  createdAt: string;
};

type Notification = {
  id: string;
  title: string;
  detail: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  title: string;
  detail: string;
  createdAt: string;
  href?: string;
};

export type Reminder = {
  id: string;
  bookingRef: string;
  audience: "customer" | "mover";
  scheduledFor: string;
  status: "scheduled" | "sent" | "cancelled";
  label: string;
};

export type TicketNote = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  bookingRef: string;
  customer: string;
  title: string;
  status: "open" | "investigating" | "resolved";
  priority: "high" | "normal";
  category: "payment" | "completion" | "dispute" | "other";
  detail: string;
  owner: string | null;
  createdAt: string;
  notes: TicketNote[];
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  status: "active" | "invited";
};

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
  team: TeamMember[];
  quotes: QuoteRecord[];
  toolExecutions: ToolExecution[];
  scoutPaused: boolean;
  isLoading: boolean;
  loadMessages: (sessionId: string) => Promise<void>;
  refreshData: () => Promise<void>;
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
  setTicketStatus: (id: string, status: Ticket["status"]) => void;
  assignTicket: (id: string, owner: string | null) => void;
  addTicketNote: (id: string, body: string) => void;
  createTicket: (ticket: Pick<Ticket, "bookingRef" | "customer" | "title" | "priority" | "category" | "detail">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetCustomerChat: (customerId: string) => void;
  resetAllChatHistory: () => void;
  inviteTeamMember: (email: string, role: TeamMember["role"]) => void;
  recordQuote: (quote: Omit<QuoteRecord, "id" | "createdAt" | "platformFee" | "customerTotal">) => QuoteRecord;
  preparePayment: (bookingRef: string) => void;
  executeScoutTool: (execution: Omit<ToolExecution, "id" | "createdAt">) => void;
};

const OperationsContext = createContext<OperationsStore | null>(null);
export function OperationsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [attention, setAttention] = useState<AttentionItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [movers, setMovers] = useState<MoverRecord[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [scoutPaused, setScoutPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isMounted = useRef(true);

  const recordAudit = useCallback((title: string, detail: string, href?: string) => {
    setAudit((items) => [
      { id: `audit-${Date.now()}`, title, detail, ...(href ? { href } : {}), createdAt: new Date().toISOString() },
      ...items,
    ]);
  }, []);

  // ─── Live Data Synchronization ──────────────────────────────────────────────
  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch bookings from backend or Supabase
      const apiBookings = await api.fetchBookings().catch(() => null);
      let mappedBookings: Booking[] = [];
      if (apiBookings && apiBookings.length > 0) {
        mappedBookings = apiBookings.map(mapApiBookingToBooking);
      } else {
        const { data: dbJobs } = await supabase
          .from("jobs")
          .select("*, customers(name, whatsapp_number), payments(total_amount, platform_fee, status), quotes(price, status, mover_id), movers!jobs_assigned_mover_id_fkey(name, whatsapp_number, rating)")
          .order("created_at", { ascending: false });
        if (dbJobs && dbJobs.length > 0) {
          mappedBookings = (dbJobs as unknown as api.ApiBooking[]).map(mapApiBookingToBooking);
        }
      }

      // 2. Fetch customers
      const apiCusts = await api.fetchCustomers().catch(() => null);
      let mappedCustomers: CustomerRecord[] = [];
      if (apiCusts && apiCusts.length > 0) {
        mappedCustomers = apiCusts.map(mapApiCustomerToCustomerRecord);
      } else {
        const { data: dbCusts } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
        if (dbCusts && dbCusts.length > 0) {
          mappedCustomers = (dbCusts as unknown as api.ApiCustomer[]).map(mapApiCustomerToCustomerRecord);
        }
      }

      // 3. Fetch movers
      const apiMovs = await api.fetchMovers().catch(() => null);
      let mappedMovers: MoverRecord[] = [];
      if (apiMovs && apiMovs.length > 0) {
        mappedMovers = apiMovs.map(mapApiMoverToMoverRecord);
      } else {
        const { data: dbMovers } = await supabase.from("movers").select("*").order("created_at", { ascending: false });
        if (dbMovers && dbMovers.length > 0) {
          mappedMovers = (dbMovers as unknown as api.ApiMover[]).map(mapApiMoverToMoverRecord);
        }
      }

      // 4. Fetch conversations
      const apiConvs = await api.fetchConversations().catch(() => null);
      let mappedConvs: Conversation[] = [];
      if (apiConvs && apiConvs.length > 0) {
        mappedConvs = apiConvs.map(mapApiConversationToConversation);
      }

      // 5. Fetch tickets
      const apiTkts = await api.fetchTickets().catch(() => null);
      let mappedTickets: Ticket[] = [];
      if (apiTkts && apiTkts.length > 0) {
        mappedTickets = apiTkts.map(mapApiTicketToTicket);
      } else {
        const { data: dbTickets } = await supabase.from("support_tickets").select("*, jobs(booking_ref, customer_id, customers(name, whatsapp_number))").order("created_at", { ascending: false });
        if (dbTickets && dbTickets.length > 0) {
          mappedTickets = (dbTickets as unknown as api.ApiTicket[]).map(mapApiTicketToTicket);
        }
      }

      if (!isMounted.current) return;

      setBookings(mappedBookings);
      setCustomers(mappedCustomers);
      setMovers(mappedMovers);
      setConversations(mappedConvs);
      setTickets(mappedTickets);

      // Compute dynamic attention items from live data
      const liveAttention = computeAttentionItems(mappedBookings, mappedConvs, mappedMovers, mappedTickets);
      setAttention(liveAttention);
    } catch (err) {
      console.warn("Live data refresh error (using existing data):", err);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  // Poll on mount and interval
  useEffect(() => {
    isMounted.current = true;
    refreshData();
    const interval = setInterval(refreshData, 10_000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, [refreshData]);

  // Load chat messages for a specific conversation session
  const loadMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await api.fetchConversationMessages(sessionId).catch(() => null);
      if (res && res.messages && res.messages.length > 0) {
        const isMover = sessionId.startsWith("mover:");
        const mappedMsgs: ChatMessage[] = res.messages.map((m) => {
          let sender: ChatMessage["sender"] = "customer";
          if (m.role === "user") {
            sender = isMover ? "mover" : "customer";
          } else if (m.metadata?.sent_by === "admin_live_chat") {
            sender = "operator";
          } else {
            sender = "scout";
          }

          let delivery: ChatMessage["delivery"] = "sent";
          if (m.delivery_status === "read") delivery = "read";
          else if (m.delivery_status === "delivered") delivery = "delivered";

          return {
            id: String(m.id),
            sender,
            body: m.content,
            createdAt: m.created_at,
            delivery,
            mediaName: m.metadata?.media_name,
            templateName: m.metadata?.template_name,
          };
        });

        setMessages((curr) => ({
          ...curr,
          [sessionId]: mappedMsgs,
        }));
      }
    } catch (err) {
      console.warn(`Could not load messages for session ${sessionId}:`, err);
    }
  }, []);

  // ─── Actions & Mutations ───────────────────────────────────────────────────
  const markRead = useCallback((sessionId: string) => {
    setConversations((items) =>
      items.map((item) => (item.id === sessionId ? { ...item, unread: false } : item))
    );
    loadMessages(sessionId);
  }, [loadMessages]);

  const sendMessage = useCallback((sessionId: string, body: string, mediaName?: string) => {
    const trimmed = body.trim();
    if (!trimmed && !mediaName) return;
    const msgId = `${sessionId}-${Date.now()}`;
    const newMessage: ChatMessage = mediaName
      ? { id: msgId, sender: "operator", body: trimmed || `Attached ${mediaName}`, createdAt: new Date().toISOString(), delivery: "sent", mediaName }
      : { id: msgId, sender: "operator", body: trimmed, createdAt: new Date().toISOString(), delivery: "sent" };

    setMessages((current) => ({
      ...current,
      [sessionId]: [...(current[sessionId] ?? []), newMessage],
    }));

    setConversations((items) =>
      items.map((item) =>
        item.id === sessionId
          ? { ...item, preview: trimmed || `Attachment: ${mediaName ?? "file"}`, at: "Now", unread: false }
          : item
      )
    );

    // Call Railway backend to send live message to WhatsApp
    api.sendMessageToConversation(sessionId, trimmed || `Attached ${mediaName}`).catch((err) => {
      console.warn("Failed to dispatch live WhatsApp message:", err);
    });
  }, []);

  const sendTemplate = useCallback((sessionId: string, templateName: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const msgId = `${sessionId}-template-${Date.now()}`;
    setMessages((current) => ({
      ...current,
      [sessionId]: [
        ...(current[sessionId] ?? []),
        { id: msgId, sender: "operator", body: trimmed, createdAt: new Date().toISOString(), delivery: "sent", templateName },
      ],
    }));

    setConversations((items) =>
      items.map((item) =>
        item.id === sessionId
          ? { ...item, preview: `Template: ${templateName}`, at: "Now", unread: false }
          : item
      )
    );

    api.sendTemplateMessage(sessionId, templateName, [trimmed]).catch((err) => {
      console.warn("Failed to dispatch WhatsApp template message:", err);
    });
  }, []);

  const setTakeover = useCallback(
    (sessionId: string, isPaused: boolean, note: string) => {
      setConversations((items) =>
        items.map((item) => (item.id === sessionId ? { ...item, takeover: isPaused } : item))
      );

      setMessages((current) => ({
        ...current,
        [sessionId]: [
          ...(current[sessionId] ?? []),
          {
            id: `${sessionId}-takeover-${Date.now()}`,
            sender: "operator",
            body: isPaused ? `Scout paused. Handover note: ${note}` : "Scout resumed automatic replies.",
            createdAt: new Date().toISOString(),
            delivery: "read",
          },
        ],
      }));

      recordAudit(
        isPaused ? "Scout paused for a conversation" : "Scout resumed for a conversation",
        note || `Conversation ${sessionId}`,
        `/inbox/${sessionId}`
      );

      // Call Railway takeover endpoint
      api.toggleTakeover(sessionId, isPaused, note).catch((err) => {
        console.warn("Failed to update takeover on Railway:", err);
      });
    },
    [recordAudit]
  );

  const resolveAttention = useCallback((id: string) => {
    setAttention((items) => items.filter((item) => item.id !== id));
  }, []);

  const assignMover = useCallback(
    (bookingRef: string, mover: { id: string; name: string }, payout: number, note: string) => {
      const target = bookings.find((b) => b.ref === bookingRef || b.id === bookingRef);
      const idToUse = target?.id || bookingRef;

      setBookings((items) =>
        items.map((booking) =>
          booking.ref === bookingRef || booking.id === bookingRef
            ? { ...booking, mover: mover.name, moverId: mover.id, total: payout + 7, status: "booked" }
            : booking
        )
      );

      setNotifications((items) => [
        {
          id: `n-assignment-${Date.now()}`,
          title: "Mover assigned",
          detail: `${mover.name} is assigned to ${bookingRef}.${note ? ` Note: ${note}` : ""}`,
          href: `/bookings/${bookingRef}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);

      recordAudit("Mover assigned", `${mover.name} assigned to ${bookingRef} for £${payout.toFixed(2)}. ${note}`.trim(), `/bookings/${bookingRef}`);

      // Call Railway assign-mover endpoint
      api.assignMoverToBooking(idToUse, mover.id, payout).catch((err) => {
        console.warn("Failed to assign mover on Railway:", err);
      });
    },
    [bookings, recordAudit]
  );

  const releasePayout = useCallback(
    (bookingRef: string) => {
      setBookings((items) =>
        items.map((booking) => (booking.ref === bookingRef ? { ...booking, status: "completed" } : booking))
      );

      setNotifications((items) => [
        {
          id: `n-release-${Date.now()}`,
          title: "Mover payout released",
          detail: `The payout for ${bookingRef} is marked released.`,
          href: `/bookings/${bookingRef}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);

      recordAudit("Mover payout released", `Payout released for ${bookingRef}.`, `/payments`);

      api.releasePayout(bookingRef).catch((err) => {
        console.warn("Failed to release payout on Railway:", err);
      });
    },
    [recordAudit]
  );

  const refundPayment = useCallback(
    (bookingRef: string, amount: number, note: string) => {
      setBookings((items) =>
        items.map((booking) =>
          booking.ref === bookingRef
            ? { ...booking, total: Math.max(0, booking.total - amount), status: "cancelled" }
            : booking
        )
      );

      setNotifications((items) => [
        {
          id: `n-refund-${Date.now()}`,
          title: "Customer refund created",
          detail: `${bookingRef}: £${amount.toFixed(2)} refund logged.${note ? ` ${note}` : ""}`,
          href: `/payments`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);

      recordAudit("Customer refund recorded", `${bookingRef}: £${amount.toFixed(2)}. ${note}`, `/payments`);

      api.refundBooking(bookingRef).catch((err) => {
        console.warn("Failed to trigger refund on Railway:", err);
      });
    },
    [recordAudit]
  );

  const createBooking = useCallback(() => {
    const ref = `CARY-${8300 + bookings.length}`;
    setBookings((items) => [
      {
        ref,
        customer: "New customer",
        customerId: "new-customer",
        mover: null,
        moverId: null,
        route: "CF10 1AA → CF24 4PB",
        moveAt: new Date(Date.now() + 86400000).toISOString(),
        status: "draft",
        total: 0,
        items: "Move details to confirm",
      },
      ...items,
    ]);
    recordAudit("Booking created", `${ref} created as a draft.`, `/bookings/${ref}`);
    return ref;
  }, [bookings.length, recordAudit]);

  const addMover = useCallback(() => {
    const id = `mover-${Date.now()}`;
    const timeNow = new Date().toISOString();
    setMovers((items) => [
      ...items,
      {
        id,
        name: "New mover candidate",
        businessName: "New removals service",
        phone: "+44 7700 900 000",
        status: "pending_verification",
        vehicles: ["Luton van"],
        insurance: "Awaiting document",
        insuranceExpiresAt: timeNow,
        licenceStatus: "submitted",
        licenceUploadedAt: timeNow,
        rating: null,
        reviewCount: 0,
        joinedAt: timeNow,
        verifiedAt: null,
        lastActiveAt: timeNow,
        jobsCompleted: 0,
        acceptanceRate: "—",
        responseTime: "—",
        lifetimeEarnings: 0,
        openIssue: "Documents require review",
      },
    ]);
    recordAudit("Mover candidate added", "New mover is ready for document review.", `/movers/${id}`);
    return id;
  }, [recordAudit]);

  const addCustomerNote = useCallback(
    (customerId: string, note: string) => {
      recordAudit("Customer note added", note, `/customers/${customerId}`);
    },
    [recordAudit]
  );

  const setMoverDocumentStatus = useCallback(
    (moverId: string, status: MoverRecord["licenceStatus"], note: string) => {
      const timeNow = new Date().toISOString();
      setMovers((items) =>
        items.map((mover) =>
          mover.id === moverId
            ? {
                ...mover,
                licenceStatus: status,
                status: status === "approved" ? "verified" : status === "rejected" ? "rejected" : mover.status,
                verifiedAt: status === "approved" ? timeNow : mover.verifiedAt,
                openIssue: status === "approved" ? null : note || mover.openIssue,
              }
            : mover
        )
      );

      recordAudit("Mover document reviewed", `${moverId}: ${status}. ${note}`, `/movers/${moverId}`);

      api.updateMoverStatus(moverId, status === "approved" ? "verified" : status).catch((err) => {
        console.warn("Failed to update mover status on Railway:", err);
      });
    },
    [recordAudit]
  );

  const completeBooking = useCallback(
    (bookingRef: string) => {
      setBookings((items) =>
        items.map((booking) => (booking.ref === bookingRef ? { ...booking, status: "completed" } : booking))
      );
      recordAudit("Booking marked complete", bookingRef, `/bookings/${bookingRef}`);
      api.completeBooking(bookingRef).catch((err) => {
        console.warn("Failed to mark booking complete on Railway:", err);
      });
    },
    [recordAudit]
  );

  const redispatchBooking = useCallback(
    (bookingRef: string) => {
      setBookings((items) =>
        items.map((booking) =>
          booking.ref === bookingRef ? { ...booking, mover: null, moverId: null, status: "dispatched" } : booking
        )
      );
      recordAudit("Booking redispatched", `${bookingRef} returned to the mover pool.`, `/bookings/${bookingRef}/assign`);
      api.redispatchBooking(bookingRef).catch((err) => {
        console.warn("Failed to redispatch booking on Railway:", err);
      });
    },
    [recordAudit]
  );

  const sendPaymentLink = useCallback(
    (bookingRef: string) => {
      setNotifications((items) => [
        {
          id: `n-payment-${Date.now()}`,
          title: "Payment link prepared",
          detail: `${bookingRef} payment checkout prepared.`,
          href: `/bookings/${bookingRef}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...items,
      ]);
      recordAudit("Payment link sent", bookingRef, `/bookings/${bookingRef}`);
    },
    [recordAudit]
  );

  const sendReminder = useCallback(
    (id: string) => {
      setReminders((items) => items.map((item) => (item.id === id ? { ...item, status: "sent" } : item)));
      const reminder = reminders.find((item) => item.id === id);
      if (reminder) recordAudit("Reminder sent", `${reminder.label} for ${reminder.bookingRef}.`, `/bookings/${reminder.bookingRef}`);
    },
    [recordAudit, reminders]
  );

  const toggleScoutPaused = useCallback(() => {
    setScoutPaused((paused) => !paused);
    recordAudit("Global Scout status changed", scoutPaused ? "Scout resumed." : "Scout paused.");
  }, [recordAudit, scoutPaused]);

  const setTicketStatus = useCallback(
    (id: string, status: Ticket["status"]) => {
      setTickets((items) => items.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)));
      recordAudit(`Ticket ${status}`, id, "/escalations");
      if (status === "resolved") {
        api.resolveTicket(id).catch((err) => {
          console.warn("Failed to resolve ticket on Railway:", err);
        });
      }
    },
    [recordAudit]
  );

  const resolveTicket = useCallback(
    (id: string) => setTicketStatus(id, "resolved"),
    [setTicketStatus]
  );

  const assignTicket = useCallback(
    (id: string, owner: string | null) => {
      setTickets((items) => items.map((ticket) => (ticket.id === id ? { ...ticket, owner } : ticket)));
      recordAudit("Ticket owner changed", `${id} ${owner ? `assigned to ${owner}` : "unassigned"}.`, "/escalations");
    },
    [recordAudit]
  );

  const addTicketNote = useCallback(
    (id: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const note: TicketNote = {
        id: `ticket-note-${Date.now()}`,
        author: "Operator",
        body: trimmed,
        createdAt: new Date().toISOString(),
      };
      setTickets((items) => items.map((ticket) => (ticket.id === id ? { ...ticket, notes: [...ticket.notes, note] } : ticket)));
      recordAudit("Ticket note added", id, "/escalations");
      api.replyToTicket(id, trimmed).catch((err) => {
        console.warn("Failed to reply to ticket on Railway:", err);
      });
    },
    [recordAudit]
  );

  const createTicket = useCallback(
    (ticket: Pick<Ticket, "bookingRef" | "customer" | "title" | "priority" | "category" | "detail">) => {
      const record: Ticket = {
        ...ticket,
        id: `TKT-${100 + tickets.length + 4}`,
        status: "open",
        owner: null,
        createdAt: new Date().toISOString(),
        notes: [],
      };
      setTickets((items) => [record, ...items]);
      recordAudit("Ticket created", `${record.id} for ${record.bookingRef}.`, "/escalations");
      supabase.from("support_tickets").insert({
        message: `${ticket.title}: ${ticket.detail}`,
        status: "open",
        raised_by: ticket.customer,
      }).then(({ error }) => {
        if (error) console.warn("Failed to create ticket in Supabase:", error);
      });
    },
    [recordAudit, tickets.length]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  }, []);

  const resetCustomerChat = useCallback(
    (customerId: string) => {
      const session = conversations.find((item) => item.contactId === customerId);
      if (!session) return;
      setMessages((items) => ({ ...items, [session.id]: [] }));
      setConversations((items) =>
        items.map((item) =>
          item.id === session.id
            ? { ...item, preview: "Conversation cleared by an operator", unread: false, at: "Now" }
            : item
        )
      );
      recordAudit("Customer chat history cleared", customerId, `/customers/${customerId}`);
      api.clearCustomerChat(customerId).catch((err) => {
        console.warn("Failed to clear customer chat on Railway:", err);
      });
    },
    [conversations, recordAudit]
  );

  const resetAllChatHistory = useCallback(() => {
    setMessages(Object.fromEntries(conversations.map((conversation) => [conversation.id, []])));
    setConversations((items) =>
      items.map((item) => ({ ...item, preview: "Conversation cleared by an administrator", unread: false, at: "Now" }))
    );
    recordAudit("All chat histories cleared", "Administrator reset all conversation histories.", "/settings/operations");
    api.clearAllChatHistory().catch((err) => {
      console.warn("Failed to clear chat history on Railway:", err);
    });
  }, [conversations, recordAudit]);

  const inviteTeamMember = useCallback(
    (email: string, role: TeamMember["role"]) => {
      const safeEmail = email.trim().toLowerCase();
      if (!safeEmail || team.some((member) => member.email === safeEmail)) return;
      const id = `team-${Date.now()}`;
      setTeam((items) => [...items, { id, name: safeEmail.split("@")[0] || "New teammate", email: safeEmail, role, status: "invited" }]);
      recordAudit("Team invite created", `${safeEmail} invited as ${role}.`, "/settings/operations");
    },
    [recordAudit, team]
  );

  const recordQuote = useCallback(
    (draft: Omit<QuoteRecord, "id" | "createdAt" | "platformFee" | "customerTotal">) => {
      const quote: QuoteRecord = {
        ...draft,
        id: `quote-${Date.now()}`,
        createdAt: new Date().toISOString(),
        platformFee: 7,
        customerTotal: draft.payout + 7,
      };
      setQuotes((items) => [quote, ...items]);
      setBookings((items) =>
        items.map((booking) =>
          booking.ref === quote.bookingRef
            ? { ...booking, total: quote.customerTotal, mover: quote.moverName, moverId: quote.moverId, status: quote.status === "draft" ? booking.status : "quotes_received" }
            : booking
        )
      );
      recordAudit("Quote recorded", `${quote.bookingRef}: £${quote.payout.toFixed(2)} mover payout + £7.00 Cary fee.`, `/bookings/${quote.bookingRef}`);
      return quote;
    },
    [recordAudit]
  );

  const preparePayment = useCallback(
    (bookingRef: string) => {
      setQuotes((items) =>
        items.map((quote) =>
          quote.bookingRef === bookingRef && quote.status === "submitted"
            ? { ...quote, status: "payment_prepared" }
            : quote
        )
      );
      sendPaymentLink(bookingRef);
      recordAudit("Payment link prepared", `${bookingRef}: itemised checkout hand-off prepared.`, `/bookings/${bookingRef}`);
    },
    [recordAudit, sendPaymentLink]
  );

  const executeScoutTool = useCallback(
    (execution: Omit<ToolExecution, "id" | "createdAt">) => {
      const record: ToolExecution = { ...execution, id: `tool-${Date.now()}`, createdAt: new Date().toISOString() };
      setToolExecutions((items) => [record, ...items]);
      recordAudit(`Scout tool: ${record.toolName}`, `${record.inputSummary} · ${record.outcome}`, `/inbox/${record.conversationId}`);
      api.executeScoutTool(execution.toolName, {}).catch((err) => {
        console.warn("Failed to execute tool on Railway:", err);
      });
    },
    [recordAudit]
  );

  const value = useMemo(
    () => ({
      bookings,
      conversations,
      attention,
      customers,
      movers,
      messages,
      notifications,
      audit,
      reminders,
      tickets,
      team,
      quotes,
      toolExecutions,
      scoutPaused,
      isLoading,
      loadMessages,
      refreshData,
      sendMessage,
      sendTemplate,
      setTakeover,
      markRead,
      resolveAttention,
      assignMover,
      releasePayout,
      refundPayment,
      createBooking,
      addMover,
      addCustomerNote,
      setMoverDocumentStatus,
      completeBooking,
      redispatchBooking,
      sendPaymentLink,
      sendReminder,
      toggleScoutPaused,
      resolveTicket,
      setTicketStatus,
      assignTicket,
      addTicketNote,
      createTicket,
      markNotificationRead,
      markAllNotificationsRead,
      resetCustomerChat,
      resetAllChatHistory,
      inviteTeamMember,
      recordQuote,
      preparePayment,
      executeScoutTool,
    }),
    [
      bookings,
      conversations,
      attention,
      customers,
      movers,
      messages,
      notifications,
      audit,
      reminders,
      tickets,
      team,
      quotes,
      toolExecutions,
      scoutPaused,
      isLoading,
      loadMessages,
      refreshData,
      sendMessage,
      sendTemplate,
      setTakeover,
      markRead,
      resolveAttention,
      assignMover,
      releasePayout,
      refundPayment,
      createBooking,
      addMover,
      addCustomerNote,
      setMoverDocumentStatus,
      completeBooking,
      redispatchBooking,
      sendPaymentLink,
      sendReminder,
      toggleScoutPaused,
      resolveTicket,
      setTicketStatus,
      assignTicket,
      addTicketNote,
      createTicket,
      markNotificationRead,
      markAllNotificationsRead,
      resetCustomerChat,
      resetAllChatHistory,
      inviteTeamMember,
      recordQuote,
      preparePayment,
      executeScoutTool,
    ]
  );

  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}

export function useOperations() {
  const context = useContext(OperationsContext);
  if (!context) throw new Error("OperationsProvider is required");
  return context;
}
