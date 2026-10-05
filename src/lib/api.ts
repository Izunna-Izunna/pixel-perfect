/**
 * Cary Backend Admin API Client
 *
 * Wraps all /api/admin/* endpoints exposed by the Fastify server.
 * Falls back to VITE_API_URL env var → http://localhost:3000.
 */

const BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.['VITE_API_URL']) ||
  'https://cary-backend-production.up.railway.app';

async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Stats ──────────────────────────────────────────────────────────────────
export type AdminStats = {
  totalGrossVolume: number;
  totalPlatformFees: number;
  totalMoverPayouts: number;
  activeBookingsCount: number;
  completedTodayCount: number;
  openTicketsCount: number;
  chartData: number[];
  chartPoints: Array<{
    date: string;
    shortDate: string;
    dayLabel: string;
    trips: number;
    volume: number;
  }>;
};

export const fetchStats = () => api<AdminStats>('/api/admin/stats');

// ─── Customers ──────────────────────────────────────────────────────────────
export type ApiCustomer = {
  id: string;
  name: string;
  whatsapp_number: string;
  total_jobs: number;
  total_spent: number;
  created_at: string;
};

export const fetchCustomers = () => api<ApiCustomer[]>('/api/admin/customers');

export const clearCustomerChat = (customerId: string) =>
  api<{ success: boolean; message: string }>(
    `/api/admin/customers/${customerId}/clear-chat`,
    { method: 'POST' },
  );

// ─── Movers ─────────────────────────────────────────────────────────────────
export type ApiMover = {
  id: string;
  name: string;
  whatsapp_number: string;
  van_size: string;
  service_areas: string[];
  status: string;
  rating: number | null;
  total_jobs: number;
  created_at: string;
};

export const fetchMovers = () => api<ApiMover[]>('/api/admin/movers');

export const addMover = (body: {
  name: string;
  whatsapp_number: string;
  van_size?: string;
  service_areas?: string[];
}) => api<ApiMover>('/api/admin/movers', { method: 'POST', body: JSON.stringify(body) });

export const updateMoverStatus = (id: string, status: string) =>
  api<ApiMover>(`/api/admin/movers/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });

// ─── Bookings (Jobs) ────────────────────────────────────────────────────────
export type ApiBooking = {
  id: string;
  booking_ref: string | null;
  customer_id: string;
  assigned_mover_id: string | null;
  status: string;
  pickup_postcode: string | null;
  dropoff_postcode: string | null;
  items_summary: string | null;
  pickup_slot: string | null;
  created_at: string;
  customers?: { name: string; whatsapp_number: string } | null;
  movers?: { name: string; whatsapp_number: string; rating: number | null } | null;
  payments?: Array<{ total_amount: number; platform_fee: number; status: string }>;
  quotes?: Array<{ price: number; status: string; mover_id: string }>;
};

export const fetchBookings = () => api<ApiBooking[]>('/api/admin/bookings');

export const completeBooking = (id: string) =>
  api<any>(`/api/admin/bookings/${id}/complete`, { method: 'POST' });

export const cancelBooking = (id: string) =>
  api<{ success: boolean }>(`/api/admin/bookings/${id}/cancel`, { method: 'POST' });

export const refundBooking = (id: string) =>
  api<{ success: boolean; message: string; refundTriggered: boolean }>(
    `/api/admin/bookings/${id}/refund`,
    { method: 'POST' },
  );

export const assignMoverToBooking = (
  id: string,
  moverId: string,
  price: number,
) =>
  api<{ success: boolean; message: string; quote_id: string }>(
    `/api/admin/bookings/${id}/assign-mover`,
    { method: 'POST', body: JSON.stringify({ mover_id: moverId, price }) },
  );

export const redispatchBooking = (id: string) =>
  api<{ success: boolean; message: string }>(
    `/api/admin/bookings/${id}/redispatch`,
    { method: 'POST' },
  );

// ─── Payments ───────────────────────────────────────────────────────────────
export type ApiPayment = {
  id: string;
  job_id: string;
  total_amount: number;
  platform_fee: number;
  mover_payout: number;
  status: string;
  stripe_payment_intent_id: string | null;
  created_at: string;
  jobs?: { booking_ref: string; assigned_mover_id: string | null };
};

export const fetchPayments = () => api<ApiPayment[]>('/api/admin/payments');

export const releasePayout = (paymentId: string) =>
  api<ApiPayment>(`/api/admin/payments/${paymentId}/release`, { method: 'PUT' });

// ─── Tickets ────────────────────────────────────────────────────────────────
export type ApiTicket = {
  id: string;
  job_id: string;
  raised_by: string | null;
  raised_by_id: string | null;
  message: string;
  status: string;
  created_at: string;
  jobs?: {
    booking_ref: string;
    customer_id: string;
    customers?: { name: string; whatsapp_number: string };
  };
};

export const fetchTickets = () => api<ApiTicket[]>('/api/admin/tickets');

export const replyToTicket = (id: string, message: string) =>
  api<{ success: boolean }>(`/api/admin/tickets/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

export const resolveTicket = (id: string) =>
  api<any>(`/api/admin/tickets/${id}/resolve`, { method: 'PUT' });

// ─── Reviews ────────────────────────────────────────────────────────────────
export const fetchReviews = () => api<any[]>('/api/admin/reviews');

export const toggleReviewHidden = (id: string, isHidden: boolean) =>
  api<{ success: boolean }>(`/api/admin/reviews/${id}/toggle-hidden`, {
    method: 'PUT',
    body: JSON.stringify({ is_hidden: isHidden }),
  });

// ─── Conversations (Live Chat) ─────────────────────────────────────────────
export type ApiConversation = {
  sessionId: string;
  phone: string;
  name: string;
  role: 'customer' | 'mover' | 'admin';
  lastMessage: string;
  lastMessageRole: string;
  lastMessageAt: string;
  lastDeliveryStatus: string | null;
  totalMessages: number;
  isPaused: boolean;
  pausedAt: string | null;
  pausedBy: string | null;
  handoverNotes: string | null;
  hasOpenTicket: boolean;
  openTicket: { id: string; message: string; createdAt: string } | null;
};

export const fetchConversations = (role?: string) =>
  api<ApiConversation[]>(
    `/api/admin/conversations${role && role !== 'all' ? `?role=${role}` : ''}`,
  );

export type ApiConversationDetail = {
  sessionId: string;
  phone: string;
  contact: any;
  jobs: any[];
  isPaused: boolean;
  pausedAt: string | null;
  pausedBy: string | null;
  handoverNotes: string | null;
  messages: Array<{
    id: number;
    session_id: string;
    role: string;
    content: string;
    created_at: string;
    delivery_status?: string;
    wamid?: string;
    metadata?: any;
  }>;
};

export const fetchConversationMessages = (sessionId: string) =>
  api<ApiConversationDetail>(
    `/api/admin/conversations/${encodeURIComponent(sessionId)}/messages`,
  );

export const sendMessageToConversation = (sessionId: string, message: string) =>
  api<{ success: boolean; wamid?: string }>(
    `/api/admin/conversations/${encodeURIComponent(sessionId)}/messages`,
    { method: 'POST', body: JSON.stringify({ message }) },
  );

export const toggleTakeover = (
  sessionId: string,
  isPaused: boolean,
  handoverNotes?: string,
  pausedBy?: string,
) =>
  api<{ success: boolean; isPaused: boolean; message: string }>(
    `/api/admin/conversations/${encodeURIComponent(sessionId)}/takeover`,
    {
      method: 'POST',
      body: JSON.stringify({
        is_paused: isPaused,
        handover_notes: handoverNotes,
        paused_by: pausedBy,
      }),
    },
  );

export const sendTemplateMessage = (
  sessionId: string,
  templateName: string,
  params: string[],
) =>
  api<{ success: boolean; wamid?: string }>(
    `/api/admin/conversations/${encodeURIComponent(sessionId)}/template`,
    {
      method: 'POST',
      body: JSON.stringify({ template_name: templateName, params }),
    },
  );

// ─── Chat History ───────────────────────────────────────────────────────────
export const clearAllChatHistory = () =>
  api<{ success: boolean; message: string }>('/api/admin/chat-history/clear', {
    method: 'POST',
  });

// ─── Scout Tools ────────────────────────────────────────────────────────────
export const fetchScoutTools = () => api<any[]>('/api/admin/tools/list');

export const executeScoutTool = (toolName: string, input: Record<string, unknown>) =>
  api<any>('/api/admin/tools/execute', {
    method: 'POST',
    body: JSON.stringify({ tool_name: toolName, input }),
  });

// ─── Negotiations ───────────────────────────────────────────────────────────
export const fetchStuckNegotiations = () =>
  api<any[]>('/api/admin/negotiations/stuck');

// ─── WhatsApp Status ────────────────────────────────────────────────────────
export type WhatsAppStatus = {
  phone: {
    id: string;
    displayNumber: string;
    verifiedName: string;
    qualityRating: string;
    messagingLimitTier: string;
    status: string;
    accountMode: string;
  };
  waba: {
    id: string;
    name: string;
    reviewStatus: string;
  };
  templates: {
    total: number;
    statusBreakdown: Record<string, number>;
  };
  fetchedAt: string;
};

export const fetchWhatsAppStatus = () =>
  api<WhatsAppStatus>('/api/admin/whatsapp-status');
