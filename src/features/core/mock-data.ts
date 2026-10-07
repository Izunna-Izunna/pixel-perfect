export type JobStatus =
  | "draft"
  | "dispatched"
  | "quotes_received"
  | "quote_accepted"
  | "payment_pending"
  | "booked"
  | "in_transit"
  | "completed"
  | "cancelled"
  | "disputed";

export type AttentionItem = {
  id: string;
  type: "overdue" | "payment" | "vetting" | "conversation";
  title: string;
  detail: string;
  waiting: string;
  action: string;
  tone: "danger" | "warning" | "info";
  bookingRef?: string;
  moverId?: string;
  conversationId?: string;
};

export type Booking = {
  id?: string;
  ref: string;
  customer: string;
  customerId: string;
  mover: string | null;
  moverId: string | null;
  route: string;
  moveAt: string;
  status: JobStatus;
  total: number;
  items: string;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  flags: Array<"vip" | "repeat" | "blocked">;
  firstSeenAt: string;
  lastActiveAt: string;
  source: string;
  addressNotes: string;
  preferenceNotes: string;
  openIssue: string | null;
};

export type DocumentStatus = "approved" | "submitted" | "rejected" | "deferred" | "not_submitted";

export type MoverRecord = {
  id: string;
  name: string;
  businessName: string;
  fullName?: string;
  phone: string;
  status: "pending_verification" | "verified" | "rejected" | "suspended";
  vehicles: string[];
  insurance: string;
  insuranceExpiresAt: string;
  licenceStatus: DocumentStatus;
  insuranceStatus?: DocumentStatus;
  licenceUploadedAt: string;
  rating: number | null;
  reviewCount: number;
  joinedAt: string;
  verifiedAt: string | null;
  lastActiveAt: string;
  jobsCompleted: number;
  acceptanceRate: string;
  responseTime: string;
  lifetimeEarnings: number;
  openIssue: string | null;
  // Onboarding & Document fields
  licenceDocUrl?: string | null;
  insuranceDocUrl?: string | null;
  verificationDocUrls?: string[];
  serviceAreas?: string[];
  services?: string[];
  teamSize?: string;
  availability?: string[];
  pricingModel?: string;
  insuranceType?: string;
  drivingLicenceType?: string;
  jobPreferences?: string;
  jobExclusions?: string;
  onboardingData?: Record<string, any>;
};

export type MoverReview = {
  id: string;
  moverId: string;
  author: string;
  rating: number;
  body: string;
  createdAt: string;
};

export type MoverCandidate = {
  id: string;
  name: string;
  phone: string;
  vehicles: string[];
  vehicleFit: boolean;
  distance: string | null;
  available: boolean;
  acceptanceRate: string;
  rating: string;
  responseTime: string;
  jobsCompleted: number;
  openIssue: string | null;
  inviteStatus: "not invited" | "invited" | "declined" | "quoted" | "no response";
};

export type Conversation = {
  id: string;
  name: string;
  role: "Customer" | "Mover";
  contactId: string;
  preview: string;
  at: string;
  unread: boolean;
  takeover: boolean;
  window: "open" | "closed";
};

export const bookings: Booking[] = [
  { ref: "CARY-8291", customer: "Elin Roberts", customerId: "elin-roberts", mover: "Dai Evans", moverId: "dai-evans", route: "CF10 1AA → CF24 4PB", moveAt: "2026-10-04T14:00:00Z", status: "in_transit", total: 157, items: "1-bed flat" },
  { ref: "CARY-8288", customer: "James Patel", customerId: "james-patel", mover: "Gower Vans", moverId: "gower-vans", route: "CF11 6QW → CF14 3NE", moveAt: "2026-10-04T16:30:00Z", status: "booked", total: 129, items: "Sofa + boxes" },
  { ref: "CARY-8284", customer: "Sian Morgan", customerId: "sian-morgan", mover: null, moverId: null, route: "NP20 1FQ → CF3 0EA", moveAt: "2026-10-05T09:00:00Z", status: "quotes_received", total: 0, items: "Studio move" },
  { ref: "CARY-8279", customer: "Rhodri Hughes", customerId: "rhodri-hughes", mover: "Dai Evans", moverId: "dai-evans", route: "CF62 7AA → CF10 5BT", moveAt: "2026-10-04T10:00:00Z", status: "booked", total: 187, items: "2-bed house" },
  { ref: "CARY-8271", customer: "Bethan Lewis", customerId: "bethan-lewis", mover: "Vale Moves", moverId: "vale-moves", route: "SA1 1EE → CF24 0JU", moveAt: "2026-10-07T12:00:00Z", status: "payment_pending", total: 219, items: "Furniture collection" },
];

export const customers: CustomerRecord[] = [
  { id: "elin-roberts", name: "Elin Roberts", phone: "+44 7700 900 108", flags: ["repeat"], firstSeenAt: "2025-10-15T09:20:00Z", lastActiveAt: "2026-10-04T13:42:00Z", source: "WhatsApp", addressNotes: "Third floor, lift available. Concierge can hold the entrance open.", preferenceNotes: "Prefers confirmation messages in the afternoon.", openIssue: null },
  { id: "james-patel", name: "James Patel", phone: "+44 7700 900 288", flags: [], firstSeenAt: "2026-09-22T10:10:00Z", lastActiveAt: "2026-10-04T11:20:00Z", source: "WhatsApp", addressNotes: "Parking bay reserved at pickup.", preferenceNotes: "One bulky sofa; call on arrival.", openIssue: null },
  { id: "sian-morgan", name: "Sian Morgan", phone: "+44 7700 900 789", flags: [], firstSeenAt: "2026-10-03T16:00:00Z", lastActiveAt: "2026-10-04T13:24:00Z", source: "WhatsApp", addressNotes: "Ground-floor studio; pickup access still to confirm.", preferenceNotes: "Needs a morning slot.", openIssue: "Waiting for a mover quote" },
  { id: "rhodri-hughes", name: "Rhodri Hughes", phone: "+44 7700 900 611", flags: [], firstSeenAt: "2026-07-09T12:15:00Z", lastActiveAt: "2026-10-03T18:05:00Z", source: "Referral", addressNotes: "Townhouse with stairs at both ends.", preferenceNotes: "Large furniture requires two movers.", openIssue: null },
  { id: "bethan-lewis", name: "Bethan Lewis", phone: "+44 7700 900 990", flags: ["vip"], firstSeenAt: "2025-05-11T08:00:00Z", lastActiveAt: "2026-10-04T09:12:00Z", source: "Returning customer", addressNotes: "Collection from storage unit; access code saved in booking notes.", preferenceNotes: "Requires careful handling for antique cabinet.", openIssue: "Payment link awaits completion" },
];

export const movers: MoverRecord[] = [
  { id: "dai-evans", name: "Dai Evans", businessName: "Dai Evans Removals", phone: "+44 7700 900 123", status: "verified", vehicles: ["Luton van", "Transit", "2 movers"], insurance: "Public liability and goods in transit", insuranceExpiresAt: "2027-03-18T00:00:00Z", licenceStatus: "approved", licenceUploadedAt: "2026-01-16T09:20:00Z", rating: 4.9, reviewCount: 47, joinedAt: "2025-11-08T10:00:00Z", verifiedAt: "2026-01-18T14:00:00Z", lastActiveAt: "2026-10-04T13:38:00Z", jobsCompleted: 118, acceptanceRate: "92%", responseTime: "4 min", lifetimeEarnings: 18472, openIssue: null },
  { id: "megan-price", name: "Megan Price", businessName: "Megan Moves", phone: "+44 7700 900 672", status: "pending_verification", vehicles: ["Transit Custom"], insurance: "Public liability", insuranceExpiresAt: "2027-02-03T00:00:00Z", licenceStatus: "submitted", licenceUploadedAt: "2026-10-04T11:18:00Z", rating: null, reviewCount: 0, joinedAt: "2026-10-03T15:05:00Z", verifiedAt: null, lastActiveAt: "2026-10-04T11:22:00Z", jobsCompleted: 0, acceptanceRate: "—", responseTime: "—", lifetimeEarnings: 0, openIssue: "Licence and insurance need review" },
  { id: "gower-vans", name: "Gower Vans", businessName: "Gower Vans Ltd", phone: "+44 7700 900 456", status: "verified", vehicles: ["Long-wheelbase van", "Loading help"], insurance: "Public liability and goods in transit", insuranceExpiresAt: "2026-12-12T00:00:00Z", licenceStatus: "approved", licenceUploadedAt: "2025-12-10T09:00:00Z", rating: 4.8, reviewCount: 36, joinedAt: "2025-08-03T10:00:00Z", verifiedAt: "2025-08-06T12:00:00Z", lastActiveAt: "2026-10-04T13:10:00Z", jobsCompleted: 86, acceptanceRate: "88%", responseTime: "7 min", lifetimeEarnings: 13950, openIssue: null },
  { id: "vale-moves", name: "Vale Moves", businessName: "Vale Moves", phone: "+44 7700 900 789", status: "suspended", vehicles: ["Sprinter", "Loading help"], insurance: "Goods in transit", insuranceExpiresAt: "2026-10-16T00:00:00Z", licenceStatus: "approved", licenceUploadedAt: "2025-07-03T09:00:00Z", rating: 4.4, reviewCount: 14, joinedAt: "2025-06-19T10:00:00Z", verifiedAt: "2025-06-21T12:00:00Z", lastActiveAt: "2026-09-22T08:30:00Z", jobsCompleted: 63, acceptanceRate: "81%", responseTime: "12 min", lifetimeEarnings: 8620, openIssue: "Insurance renewal due in 12 days" },
];

export const moverReviews: MoverReview[] = [
  { id: "review-1", moverId: "dai-evans", author: "Elin Roberts", rating: 5, body: "Careful, calm and kept us updated from start to finish.", createdAt: "2026-09-28T16:40:00Z" },
  { id: "review-2", moverId: "dai-evans", author: "Rhodri Hughes", rating: 5, body: "Turned up on time and handled the difficult stair carry brilliantly.", createdAt: "2026-08-19T18:10:00Z" },
  { id: "review-3", moverId: "gower-vans", author: "James Patel", rating: 5, body: "Quick response and very straightforward collection.", createdAt: "2026-09-12T13:15:00Z" },
];

export const moverCandidates: MoverCandidate[] = [
  { id: "dai-evans", name: "Dai Evans", phone: "+44 7700 900 123", vehicles: ["Luton van", "2 movers"], vehicleFit: true, distance: "2.1 mi from pickup", available: true, acceptanceRate: "92%", rating: "4.9", responseTime: "4 min", jobsCompleted: 118, openIssue: null, inviteStatus: "not invited" },
  { id: "gower-vans", name: "Gower Vans", phone: "+44 7700 900 456", vehicles: ["Long-wheelbase van"], vehicleFit: true, distance: "5.8 mi from pickup", available: true, acceptanceRate: "88%", rating: "4.8", responseTime: "7 min", jobsCompleted: 86, openIssue: null, inviteStatus: "quoted" },
  { id: "vale-moves", name: "Vale Moves", phone: "+44 7700 900 789", vehicles: ["Transit", "Loading help"], vehicleFit: true, distance: null, available: false, acceptanceRate: "81%", rating: "4.7", responseTime: "12 min", jobsCompleted: 63, openIssue: "Insurance renews in 12 days", inviteStatus: "no response" },
];

export const attentionItems: AttentionItem[] = [
  { id: "a1", type: "overdue", title: "CARY-8279 needs a completion check", detail: "The booked time passed without an update.", waiting: "2h 18m", action: "Check in", tone: "danger", bookingRef: "CARY-8279" },
  { id: "a2", type: "conversation", title: "Scout has waited on Sian Morgan", detail: "No mover has answered the request yet.", waiting: "18m", action: "Redispatch", tone: "warning", bookingRef: "CARY-8284", conversationId: "s3" },
  { id: "a3", type: "payment", title: "Payment failed for CARY-8269", detail: "The customer has not received a new payment link.", waiting: "42m", action: "Send link", tone: "warning", bookingRef: "CARY-8271" },
  { id: "a4", type: "vetting", title: "Megan Price is ready for review", detail: "Insurance document is waiting for verification.", waiting: "1h 06m", action: "Review", tone: "info", moverId: "megan-price" },
];

export const conversations: Conversation[] = [
  { id: "s1", name: "Elin Roberts", role: "Customer", contactId: "elin-roberts", preview: "We are nearly there — loading the last boxes now.", at: "Now", unread: true, takeover: false, window: "open" },
  { id: "s2", name: "Dai Evans", role: "Mover", contactId: "dai-evans", preview: "Traffic is clear from Splott. ETA 14:20.", at: "3m", unread: false, takeover: true, window: "open" },
  { id: "s3", name: "Sian Morgan", role: "Customer", contactId: "sian-morgan", preview: "Is there anyone available tomorrow morning?", at: "18m", unread: true, takeover: false, window: "closed" },
  { id: "s4", name: "Gower Vans", role: "Mover", contactId: "gower-vans", preview: "Quote sent for the Newport collection.", at: "31m", unread: false, takeover: false, window: "open" },
];

export const activity = [
  "Payment received for CARY-8291",
  "Dai Evans marked as on the way",
  "Scout collected access details from James Patel",
  "Megan Price uploaded an insurance certificate",
];
