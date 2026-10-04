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
};

export type Booking = {
  ref: string;
  customer: string;
  mover: string | null;
  route: string;
  moveAt: string;
  status: JobStatus;
  total: number;
  items: string;
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
  preview: string;
  at: string;
  unread: boolean;
  takeover: boolean;
  window: "open" | "closed";
};

export const bookings: Booking[] = [
  { ref: "CARY-8291", customer: "Elin Roberts", mover: "Dai Evans", route: "CF10 1AA → CF24 4PB", moveAt: "2026-10-04T14:00:00Z", status: "in_transit", total: 157, items: "1-bed flat" },
  { ref: "CARY-8288", customer: "James Patel", mover: "Gower Vans", route: "CF11 6QW → CF14 3NE", moveAt: "2026-10-04T16:30:00Z", status: "booked", total: 129, items: "Sofa + boxes" },
  { ref: "CARY-8284", customer: "Sian Morgan", mover: null, route: "NP20 1FQ → CF3 0EA", moveAt: "2026-10-05T09:00:00Z", status: "quotes_received", total: 0, items: "Studio move" },
  { ref: "CARY-8279", customer: "Rhodri Hughes", mover: "Dai Evans", route: "CF62 7AA → CF10 5BT", moveAt: "2026-10-04T10:00:00Z", status: "booked", total: 187, items: "2-bed house" },
  { ref: "CARY-8271", customer: "Bethan Lewis", mover: "Vale Moves", route: "SA1 1EE → CF24 0JU", moveAt: "2026-10-07T12:00:00Z", status: "payment_pending", total: 219, items: "Furniture collection" },
];

export const moverCandidates: MoverCandidate[] = [
  { id: "dai-evans", name: "Dai Evans", phone: "+44 7700 900 123", vehicles: ["Luton van", "2 movers"], vehicleFit: true, distance: "2.1 mi from pickup", available: true, acceptanceRate: "92%", rating: "4.9", responseTime: "4 min", jobsCompleted: 118, openIssue: null, inviteStatus: "not invited" },
  { id: "gower-vans", name: "Gower Vans", phone: "+44 7700 900 456", vehicles: ["Long-wheelbase van"], vehicleFit: true, distance: "5.8 mi from pickup", available: true, acceptanceRate: "88%", rating: "4.8", responseTime: "7 min", jobsCompleted: 86, openIssue: null, inviteStatus: "quoted" },
  { id: "vale-moves", name: "Vale Moves", phone: "+44 7700 900 789", vehicles: ["Transit", "Loading help"], vehicleFit: true, distance: null, available: false, acceptanceRate: "81%", rating: "4.7", responseTime: "12 min", jobsCompleted: 63, openIssue: "Insurance renews in 12 days", inviteStatus: "no response" },
];

export const attentionItems: AttentionItem[] = [
  { id: "a1", type: "overdue", title: "CARY-8279 needs a completion check", detail: "The booked time passed without an update.", waiting: "2h 18m", action: "Check in", tone: "danger" },
  { id: "a2", type: "conversation", title: "Scout has waited on Sian Morgan", detail: "No mover has answered the request yet.", waiting: "18m", action: "Redispatch", tone: "warning" },
  { id: "a3", type: "payment", title: "Payment failed for CARY-8269", detail: "The customer has not received a new payment link.", waiting: "42m", action: "Send link", tone: "warning" },
  { id: "a4", type: "vetting", title: "Megan Price is ready for review", detail: "Insurance document is waiting for verification.", waiting: "1h 06m", action: "Review", tone: "info" },
];

export const conversations: Conversation[] = [
  { id: "s1", name: "Elin Roberts", role: "Customer", preview: "We are nearly there — loading the last boxes now.", at: "Now", unread: true, takeover: false, window: "open" },
  { id: "s2", name: "Dai Evans", role: "Mover", preview: "Traffic is clear from Splott. ETA 14:20.", at: "3m", unread: false, takeover: true, window: "open" },
  { id: "s3", name: "Sian Morgan", role: "Customer", preview: "Is there anyone available tomorrow morning?", at: "18m", unread: true, takeover: false, window: "closed" },
  { id: "s4", name: "Gower Vans", role: "Mover", preview: "Quote sent for the Newport collection.", at: "31m", unread: false, takeover: false, window: "open" },
];

export const activity = [
  "Payment received for CARY-8291",
  "Dai Evans marked as on the way",
  "Scout collected access details from James Patel",
  "Megan Price uploaded an insurance certificate",
];
