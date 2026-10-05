/**
 * React Query hooks for live Cary data.
 *
 * Every hook fetches from the Fastify admin API and auto-refetches
 * on an interval so the dashboard stays current.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/lib/api';

const REFETCH = 5_000; // 5s live polling

// ─── Stats ──────────────────────────────────────────────────────────────────
export function useStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: api.fetchStats,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

// ─── Customers ──────────────────────────────────────────────────────────────
export function useLiveCustomers() {
  return useQuery({
    queryKey: ['admin', 'customers'],
    queryFn: api.fetchCustomers,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

export function useClearCustomerChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (customerId: string) => api.clearCustomerChat(customerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
    },
  });
}

// ─── Movers ─────────────────────────────────────────────────────────────────
export function useLiveMovers() {
  return useQuery({
    queryKey: ['admin', 'movers'],
    queryFn: api.fetchMovers,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

export function useAddMover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.addMover,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movers'] }),
  });
}

export function useUpdateMoverStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateMoverStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'movers'] }),
  });
}

// ─── Bookings ───────────────────────────────────────────────────────────────
export function useLiveBookings() {
  return useQuery({
    queryKey: ['admin', 'bookings'],
    queryFn: api.fetchBookings,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.completeBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}

export function useRefundBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.refundBooking(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'payments'] });
    },
  });
}

export function useAssignMover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      moverId,
      price,
    }: {
      id: string;
      moverId: string;
      price: number;
    }) => api.assignMoverToBooking(id, moverId, price),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}

export function useRedispatchBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.redispatchBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'bookings'] }),
  });
}

// ─── Payments ───────────────────────────────────────────────────────────────
export function useLivePayments() {
  return useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: api.fetchPayments,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

export function useReleasePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => api.releasePayout(paymentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'payments'] }),
  });
}

// ─── Tickets ────────────────────────────────────────────────────────────────
export function useLiveTickets() {
  return useQuery({
    queryKey: ['admin', 'tickets'],
    queryFn: api.fetchTickets,
    refetchInterval: REFETCH,
    retry: 2,
  });
}

export function useReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      api.replyToTicket(id, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tickets'] }),
  });
}

export function useResolveTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.resolveTicket(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tickets'] }),
  });
}

// ─── Reviews ────────────────────────────────────────────────────────────────
export function useLiveReviews() {
  return useQuery({
    queryKey: ['admin', 'reviews'],
    queryFn: api.fetchReviews,
    refetchInterval: 15_000,
    retry: 2,
  });
}

// ─── Conversations (Live Chat) ─────────────────────────────────────────────
export function useLiveConversations(role?: string) {
  return useQuery({
    queryKey: ['admin', 'conversations', role],
    queryFn: () => api.fetchConversations(role),
    refetchInterval: 3_000, // faster polling for chat
    retry: 2,
  });
}

export function useConversationMessages(sessionId: string | null) {
  return useQuery({
    queryKey: ['admin', 'conversation-messages', sessionId],
    queryFn: () => api.fetchConversationMessages(sessionId!),
    enabled: !!sessionId,
    refetchInterval: 3_000,
    retry: 2,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, message }: { sessionId: string; message: string }) =>
      api.sendMessageToConversation(sessionId, message),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ['admin', 'conversation-messages', vars.sessionId],
      });
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
    },
  });
}

export function useToggleTakeover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      isPaused,
      handoverNotes,
      pausedBy,
    }: {
      sessionId: string;
      isPaused: boolean;
      handoverNotes?: string;
      pausedBy?: string;
    }) => api.toggleTakeover(sessionId, isPaused, handoverNotes, pausedBy),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
    },
  });
}

export function useSendTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      templateName,
      params,
    }: {
      sessionId: string;
      templateName: string;
      params: string[];
    }) => api.sendTemplateMessage(sessionId, templateName, params),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ['admin', 'conversation-messages', vars.sessionId],
      });
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
    },
  });
}

export function useClearAllChatHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.clearAllChatHistory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
      qc.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
  });
}

// ─── Scout Tools ────────────────────────────────────────────────────────────
export function useScoutTools() {
  return useQuery({
    queryKey: ['admin', 'tools'],
    queryFn: api.fetchScoutTools,
    staleTime: 60_000,
    retry: 2,
  });
}

export function useExecuteScoutTool() {
  return useMutation({
    mutationFn: ({
      toolName,
      input,
    }: {
      toolName: string;
      input: Record<string, unknown>;
    }) => api.executeScoutTool(toolName, input),
  });
}

// ─── Stuck Negotiations ─────────────────────────────────────────────────────
export function useStuckNegotiations() {
  return useQuery({
    queryKey: ['admin', 'negotiations-stuck'],
    queryFn: api.fetchStuckNegotiations,
    refetchInterval: 15_000,
    retry: 2,
  });
}

// ─── WhatsApp Status ────────────────────────────────────────────────────────
export function useWhatsAppStatus() {
  return useQuery({
    queryKey: ['admin', 'whatsapp-status'],
    queryFn: api.fetchWhatsAppStatus,
    staleTime: 30_000,
    retry: 1,
  });
}
