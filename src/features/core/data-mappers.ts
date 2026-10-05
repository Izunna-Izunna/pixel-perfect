import type { AttentionItem, Booking, Conversation, CustomerRecord, MoverRecord, JobStatus, MoverCandidate } from './mock-data';
import type { ChatMessage, Ticket, QuoteRecord } from './operations-store';
import type { ApiBooking, ApiCustomer, ApiMover, ApiConversation, ApiTicket } from '@/lib/api';

export function normalizeJobStatus(status: string | null | undefined): JobStatus {
  if (!status) return 'draft';
  const s = status.toLowerCase();
  if (s === 'quote_received' || s === 'negotiating') return 'quotes_received';
  if (s === 'awaiting_payment' || s === 'payment_pending') return 'payment_pending';
  if (s === 'dispatching' || s === 'dispatched') return 'dispatched';
  if (s === 'booked') return 'booked';
  if (s === 'in_transit') return 'in_transit';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'disputed') return 'disputed';
  return 'draft';
}

export function mapApiBookingToBooking(b: ApiBooking): Booking {
  const ref = b.booking_ref || `CARY-${b.id.slice(0, 4).toUpperCase()}`;
  const customerName = b.customers?.name || 'Customer';
  const moverName = b.movers?.name || null;
  const moverId = b.assigned_mover_id || null;
  const route = `${b.pickup_postcode || 'Pickup'} → ${b.dropoff_postcode || 'Dropoff'}`;
  const moveAt = b.pickup_slot || b.created_at || new Date().toISOString();
  const status = normalizeJobStatus(b.status);
  
  const paymentAmount = b.payments?.[0]?.total_amount;
  const quotePrice = b.quotes?.[0]?.price;
  const total = Number(paymentAmount) || (Number(quotePrice) ? Number(quotePrice) + 7 : 0);

  return {
    id: b.id,
    ref,
    customer: customerName,
    customerId: b.customer_id,
    mover: moverName,
    moverId,
    route,
    moveAt,
    status,
    total,
    items: b.items_summary || 'Move items',
  };
}

export function mapApiCustomerToCustomerRecord(c: ApiCustomer): CustomerRecord {
  return {
    id: c.id,
    name: c.name || 'Anonymous Customer',
    phone: c.whatsapp_number,
    flags: (c.total_spent || 0) > 250 ? ['vip'] : (c.total_jobs || 0) > 1 ? ['repeat'] : [],
    firstSeenAt: c.created_at,
    lastActiveAt: c.created_at,
    source: 'WhatsApp',
    addressNotes: '',
    preferenceNotes: '',
    openIssue: null,
  };
}

export function mapApiMoverToMoverRecord(m: ApiMover): MoverRecord {
  const isVerified = m.status === 'verified';
  const ob = (m.onboarding_data || {}) as Record<string, any>;
  const fullName = m.full_name || ob['full_name'] || m.name;
  const businessName = m.business_name || ob['business_name'] || m.name;
  const licenceUrl = m.licence_doc_url || ob['licence_doc_url'] || null;
  const insuranceUrl = m.insurance_doc_url || ob['insurance_doc_url'] || null;
  const verificationUrls = m.verification_doc_urls || ob['verification_doc_urls'] || [];
  const serviceAreas = m.service_areas || ob['service_areas'] || [];
  const services = m.services || ob['services'] || [];
  const teamSize = m.team_size || ob['team_size'] || undefined;
  const availability = m.availability || ob['availability'] || [];
  const pricingModel = m.pricing_model || ob['pricing_model'] || undefined;
  const insuranceType = m.insurance_type || ob['insurance_type'] || undefined;
  const drivingLicenceType = m.driving_licence_type || ob['driving_licence_type'] || undefined;
  const jobPreferences = m.job_preferences || ob['job_preferences'] || undefined;
  const jobExclusions = m.job_exclusions || ob['job_exclusions'] || undefined;

  const vehicleDisplay = m.van_size || ob['vehicle'] || 'Luton van';
  const cleanVehicles = [vehicleDisplay.replace(/_/g, ' ')];

  return {
    id: m.id,
    name: m.name,
    businessName,
    fullName,
    phone: m.whatsapp_number,
    status: isVerified ? 'verified' : m.status === 'rejected' ? 'rejected' : 'pending_verification',
    vehicles: cleanVehicles,
    insurance: insuranceType ? `${insuranceType.replace(/_/g, ' ')} insurance` : 'Public liability and goods in transit',
    insuranceExpiresAt: new Date(Date.now() + 180 * 86400000).toISOString(),
    licenceStatus: isVerified ? 'approved' : m.status === 'rejected' ? 'rejected' : 'submitted',
    licenceUploadedAt: m.created_at,
    rating: m.rating ?? 5.0,
    reviewCount: m.total_jobs ?? 0,
    joinedAt: m.created_at,
    verifiedAt: isVerified ? m.created_at : null,
    lastActiveAt: m.created_at,
    jobsCompleted: m.total_jobs ?? 0,
    acceptanceRate: '95%',
    responseTime: '5 min',
    lifetimeEarnings: (m.total_jobs ?? 0) * 120,
    openIssue: isVerified ? null : 'Documents require review',
    licenceDocUrl: licenceUrl,
    insuranceDocUrl: insuranceUrl,
    verificationDocUrls: verificationUrls,
    serviceAreas,
    services,
    teamSize,
    availability,
    pricingModel,
    insuranceType,
    drivingLicenceType,
    jobPreferences,
    jobExclusions,
    onboardingData: ob,
  };
}

export function mapMoverRecordToCandidate(m: MoverRecord): MoverCandidate {
  return {
    id: m.id,
    name: m.name,
    phone: m.phone,
    vehicles: m.vehicles,
    vehicleFit: true,
    distance: null,
    available: m.status === 'verified',
    acceptanceRate: m.acceptanceRate,
    rating: m.rating ? `${m.rating}` : '5.0',
    responseTime: m.responseTime,
    jobsCompleted: m.jobsCompleted,
    openIssue: m.openIssue,
    inviteStatus: 'not invited',
  };
}

export function mapApiConversationToConversation(c: ApiConversation): Conversation {
  const atDate = c.lastMessageAt ? new Date(c.lastMessageAt) : new Date();
  const diffMinutes = Math.floor((Date.now() - atDate.getTime()) / 60000);
  const at = diffMinutes < 1 ? 'Now' : diffMinutes < 60 ? `${diffMinutes}m` : `${Math.floor(diffMinutes / 60)}h`;

  return {
    id: c.sessionId,
    name: c.name || c.phone,
    role: c.role === 'mover' ? 'Mover' : 'Customer',
    contactId: c.phone || c.sessionId,
    preview: c.lastMessage || 'Conversation started',
    at,
    unread: c.lastMessageRole === 'user',
    takeover: Boolean(c.isPaused),
    window: 'open',
  };
}

export function mapApiTicketToTicket(t: ApiTicket): Ticket {
  const id = t.id.startsWith('TKT-') ? t.id : `TKT-${t.id.slice(0, 4).toUpperCase()}`;
  const bookingRef = t.jobs?.booking_ref || (t.job_id ? `CARY-${t.job_id.slice(0, 4).toUpperCase()}` : 'CARY-OPS');
  const customer = t.jobs?.customers?.name || t.raised_by || 'Customer';
  const status: Ticket['status'] = t.status === 'resolved' ? 'resolved' : t.status === 'in_progress' ? 'investigating' : 'open';

  return {
    id,
    bookingRef,
    customer,
    title: t.message.length > 50 ? `${t.message.slice(0, 50)}…` : t.message || 'Support inquiry',
    status,
    priority: t.status === 'open' ? 'high' : 'normal',
    category: 'other',
    detail: t.message,
    owner: null,
    createdAt: t.created_at,
    notes: [],
  };
}

export function computeAttentionItems(
  bookings: Booking[],
  conversations: Conversation[],
  movers: MoverRecord[],
  tickets: Ticket[]
): AttentionItem[] {
  const items: AttentionItem[] = [];

  // 1. Open tickets need attention
  for (const t of tickets) {
    if (t.status === 'open') {
      items.push({
        id: `att-ticket-${t.id}`,
        type: 'conversation',
        title: `${t.bookingRef} has an open ticket`,
        detail: t.detail,
        waiting: 'Requires response',
        action: 'View ticket',
        tone: 'danger',
        bookingRef: t.bookingRef,
      });
    }
  }

  // 2. Pending movers need vetting
  for (const m of movers) {
    if (m.status === 'pending_verification') {
      items.push({
        id: `att-mover-${m.id}`,
        type: 'vetting',
        title: `${m.name} is ready for review`,
        detail: 'Licence and insurance documents require review.',
        waiting: 'Pending review',
        action: 'Review',
        tone: 'info',
        moverId: m.id,
      });
    }
  }

  // 3. Bookings awaiting mover or payment
  for (const b of bookings) {
    if (b.status === 'quotes_received' && !b.moverId) {
      items.push({
        id: `att-booking-${b.ref}`,
        type: 'overdue',
        title: `${b.ref} waiting for mover assignment`,
        detail: `Route: ${b.route}`,
        waiting: 'Needs mover',
        action: 'Redispatch',
        tone: 'warning',
        bookingRef: b.ref,
      });
    } else if (b.status === 'payment_pending') {
      items.push({
        id: `att-payment-${b.ref}`,
        type: 'payment',
        title: `Payment pending for ${b.ref}`,
        detail: `Amount: £${b.total.toFixed(2)}`,
        waiting: 'Awaiting payment',
        action: 'Send link',
        tone: 'warning',
        bookingRef: b.ref,
      });
    }
  }

  return items;
}
