import type { Booking, MoverRecord } from "../core/mock-data";

export type TemplateParameter = {
  key: string;
  label: string;
  required?: boolean;
};

export type ApprovedTemplate = {
  id: string;
  name: string;
  category: "UTILITY";
  target: "Customer" | "Mover" | "Admin Ops";
  parameters: TemplateParameter[];
  body: string;
};

export const approvedTemplates: ApprovedTemplate[] = [
  // ── 1. CUSTOMER ALERTS & ACTIONS ──────────────────────────────────────────
  {
    id: "quote_ready_alert",
    name: "Quote ready",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Customer first name" },
      { key: "2", label: "Pickup area" },
      { key: "3", label: "Drop-off area" },
      { key: "4", label: "Mover business name" },
      { key: "5", label: "Total price (£)" },
      { key: "6", label: "Pickup date" },
    ],
    body: "Hi {{1}}, great news! A verified mover has submitted a quote for your move (*{{2}}* ➔ *{{3}}*):\n🚚 *Mover:* {{4}}\n💰 *Quote Price:* £{{5}}\n📅 *Pickup Date:* {{6}}\nTap below or reply to this message to view details, negotiate, or book now!",
  },
  {
    id: "booking_confirmed",
    name: "Booking confirmed",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Customer first name" },
      { key: "2", label: "Booking reference" },
      { key: "3", label: "Pickup address" },
      { key: "4", label: "Drop-off address" },
      { key: "5", label: "Date & time" },
      { key: "6", label: "Assigned mover" },
    ],
    body: "🎉 *Booking Confirmed!*\nHi {{1}}, your booking for move *{{2}}* is officially confirmed and paid.\n📍 *Pickup:* {{3}}\n🏁 *Drop-off:* {{4}}\n📅 *Date & Time:* {{5}}\n🚚 *Assigned Mover:* {{6}}\nYour mover has received your move details. Reply to this message anytime if you have questions!",
  },
  {
    id: "trip_status_update",
    name: "Trip status update",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Status title (e.g. Driver On The Way)" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Mover name" },
      { key: "4", label: "Booking reference" },
      { key: "5", label: "Current status" },
      { key: "6", label: "ETA / Time" },
    ],
    body: "🚚 *Move Update: {{1}}*\n\nHi {{2}}, your mover *{{3}}* has updated the status for move *{{4}}*:\n\n📍 *Current Status:* {{5}}\n⏰ *ETA / Time:* {{6}}\n\nReply to this chat if you have any questions or special instructions for your driver.",
  },
  {
    id: "move_reminder_customer",
    name: "Customer move reminder",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Scheduled move date & time" },
      { key: "4", label: "Mover name" },
      { key: "5", label: "Pickup address" },
      { key: "6", label: "Drop-off address" },
    ],
    body: "📅 *MOVE REMINDER: {{1}}*\n\nHi {{2}}, your move is scheduled for *{{3}}* with *{{4}}*.\n\n📍 *Pickup:* {{5}}\n🏁 *Drop-off:* {{6}}\n\n💡 *Tip:* Please ensure boxes are taped and access paths are clear. Reply here if you have any questions!",
  },
  {
    id: "review_request",
    name: "Review request",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Customer first name" },
      { key: "2", label: "Booking reference" },
      { key: "3", label: "Mover name" },
    ],
    body: "⭐ *How was your move, {{1}}?*\n\nYour move (*{{2}}*) with *{{3}}* has been marked as completed! 🎉 How was your experience? Reply with a rating from 1 to 5 stars (e.g. \"5\").",
  },
  {
    id: "quote_followup",
    name: "Quote reminder",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Customer first name" },
      { key: "2", label: "Quote price (£)" },
      { key: "3", label: "Move route / description" },
    ],
    body: "Hi {{1}}, this is a reminder about your pending Cary moving quote of £{{2}} for your {{3}}. Reply to this message to continue with your booking.",
  },
  {
    id: "payment_reminder_customer",
    name: "Payment reminder",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Mover name" },
      { key: "4", label: "Total price (£)" },
      { key: "5", label: "Move date" },
    ],
    body: "⏳ *RESERVED MOVE PENDING PAYMENT: {{1}}*\n\nHi {{2}}, your move with *{{3}}* for *£{{4}}* is reserved!\n\nTo lock in your mover and guarantee their availability on *{{5}}*, please complete payment using the link in our previous message.\n\nReply here if you have questions or need assistance!",
  },
  {
    id: "emergency_mover_replacement",
    name: "Emergency mover replacement",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
    ],
    body: "🚨 *MOVE UPDATE: {{1}}*\n\nHi {{2}}, your assigned mover had an unexpected emergency and cannot fulfill booking *{{1}}*.\n\n🛡️ *Don't worry — your payment and booking are 100% protected.* Our operations team is assigning a priority replacement mover right now. We will update you shortly!",
  },
  {
    id: "mover_delayed_alert",
    name: "Mover delayed update",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Mover name" },
      { key: "4", label: "Reason (e.g. traffic)" },
      { key: "5", label: "Updated ETA" },
    ],
    body: "⚠️ *ETA UPDATE: {{1}}*\n\nHi {{2}}, your mover *{{3}}* has reported a slight delay due to {{4}}.\n\n⏰ *Updated ETA:* {{5}}\n\nYour driver is on the way. Reply to this chat if you have any questions or access instructions!",
  },
  {
    id: "booking_cancelled_customer",
    name: "Booking cancelled (Customer)",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Cancellation reason" },
      { key: "4", label: "Refund / resolution details" },
    ],
    body: "⚠️ *BOOKING UPDATE: {{1}}*\n\nHi {{2}}, your booking *{{1}}* has been cancelled ({{3}}).\n\n{{4}}\n\nIf you need assistance or wish to rebook, reply to this message anytime!",
  },
  {
    id: "support_message_customer",
    name: "Support message",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Support note / update" },
    ],
    body: "💬 *CARY SUPPORT UPDATE: {{1}}*\n\nHi {{2}}, our operations team has updated your request:\n\n\"{{3}}\"\n\nReply to this message to chat directly with our team!",
  },
  {
    id: "intake_abandoned_customer",
    name: "Intake abandoned follow-up",
    category: "UTILITY",
    target: "Customer",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Customer first name" },
      { key: "3", label: "Pickup area" },
    ],
    body: "👋 *COMPLETE YOUR MOVE REQUEST: {{1}}*\n\nHi {{2}}, we noticed you started planning your move from {{3}} but haven't finished your request.\n\nVerified movers are ready to send you quotes! Reply to this message to continue right where you left off.",
  },

  // ── 2. MOVER DISPATCH, ONBOARDING & PAYOUTS ────────────────────────────────
  {
    id: "job_invite",
    name: "Job invite",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
      { key: "3", label: "Pickup address" },
      { key: "4", label: "Drop-off address" },
      { key: "5", label: "Date & time" },
      { key: "6", label: "Items list" },
      { key: "7", label: "Loading assistance" },
      { key: "8", label: "Special requirements" },
    ],
    body: "📋 *JOB DISPATCH NOTICE: {{1}}*\nHi {{2}}, a new moving request is available for quotation:\n📍 *Pickup:* {{3}}\n🏁 *Drop-off:* {{4}}\n📅 *Date & Time:* {{5}}\n📦 *Items:* {{6}}\n👥 *Loading Help:* {{7}}\n📝 *Requirements:* {{8}}\nReply with your quote price in GBP (e.g. \"£150\") or claim the job.",
  },
  {
    id: "job_assigned_mover",
    name: "Mover assignment",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Mover name" },
      { key: "2", label: "Booking reference & route" },
      { key: "3", label: "Net payout (£)" },
      { key: "4", label: "Pickup address" },
      { key: "5", label: "Drop-off address" },
      { key: "6", label: "Date & time" },
    ],
    body: "📋 *JOB ASSIGNMENT NOTICE*\nHi {{1}}, you have been assigned to move *{{2}}* at a net payout of *£{{3}}*.\n📍 *Pickup:* {{4}}\n🏁 *Drop-off:* {{5}}\n📅 *Date & Time:* {{6}}\nThe customer has received their quote and payment link. Please reply to this message to confirm your schedule and ETA!",
  },
  {
    id: "move_reminder_mover",
    name: "Mover job reminder",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
      { key: "3", label: "Scheduled move date & time" },
      { key: "4", label: "Customer name" },
      { key: "5", label: "Customer phone" },
      { key: "6", label: "Pickup address" },
      { key: "7", label: "Drop-off address" },
    ],
    body: "🚚 *JOB REMINDER: {{1}}*\n\nHi {{2}}, you have a scheduled move on *{{3}}*.\n\n👤 *Customer:* {{4}} (📞 {{5}})\n📍 *Pickup:* {{6}}\n🏁 *Drop-off:* {{7}}\n\nPlease reply *START* when you begin traveling to the pickup address.",
  },
  {
    id: "payout_notification",
    name: "Payout notification",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Mover name" },
      { key: "2", label: "Payout amount (£)" },
    ],
    body: "Hi {{1}}, your payout of £{{2}} has been sent to your account for your completed job. Thanks for moving with Cary! 💪",
  },
  {
    id: "mover_welcome",
    name: "Mover welcome",
    category: "UTILITY",
    target: "Mover",
    parameters: [{ key: "1", label: "Mover name" }],
    body: "📍 Cardiff & South Wales\n\nHey {{1}}! 👋 I'm Scout from Cary.\n\nWe're building a simpler way for local movers to connect with people who need things moved across Cardiff & South Wales.\n\nWith Cary, you get:\n• 100% of your quoted price\n• More local customers\n• Freedom to choose the jobs you want\n• Fast payouts\n• Quick support\n\nTell me a little about your business and I'll get you set up to start receiving jobs that fit.",
  },
  {
    id: "mover_approved",
    name: "Mover approved",
    category: "UTILITY",
    target: "Mover",
    parameters: [{ key: "1", label: "Mover name" }],
    body: "Hello Great news, {{1}}! Your Cary mover account has been approved ✅ Tap below to confirm you're ready to start receiving jobs.",
  },
  {
    id: "quote_counter_offer_mover",
    name: "Counter-offer alert (Mover)",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
      { key: "3", label: "Customer counter price (£)" },
      { key: "4", label: "Original quote price (£)" },
      { key: "5", label: "Pickup area" },
      { key: "6", label: "Drop-off area" },
    ],
    body: "💬 *COUNTER-OFFER RECEIVED: {{1}}*\n\nHi {{2}}, the customer has submitted a counter-offer of *£{{3}}* for move *{{1}}*.\n\nOriginal Quote: £{{4}}\n📍 {{5}} → {{6}}\n\nReply with *ACCEPT*, or enter a new counter price in GBP (e.g. \"£140\").",
  },
  {
    id: "payout_action_required",
    name: "Payout action required",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
      { key: "3", label: "Payout amount (£)" },
    ],
    body: "⚠️ *ACTION REQUIRED: PAYOUT PENDING: {{1}}*\n\nHi {{2}}, your payout of *£{{3}}* for move *{{1}}* is ready, but your bank account details are missing.\n\nPlease reply to this chat to receive your secure bank setup link and receive your funds! 💰",
  },
  {
    id: "mover_documents_needed",
    name: "Mover documents needed",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Mover name" },
      { key: "2", label: "Document names (e.g. Goods in Transit Insurance)" },
    ],
    body: "📋 *CARY MOVER ONBOARDING: ACTION NEEDED*\n\nHi {{1}}, thank you for joining Cary!\n\nTo activate your account and start receiving jobs, we need a copy of your *{{2}}*.\n\nReply to this message with a photo or PDF of your document to complete verification! 🚚",
  },
  {
    id: "job_cancelled_mover",
    name: "Job cancelled (Mover)",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
    ],
    body: "ℹ️ *JOB CANCELLED: {{1}}*\n\nHi {{2}}, move *{{1}}* has been cancelled by the customer.\n\nYour schedule has been freed up and no further action is required. We'll notify you as soon as new jobs match your area! 🚚",
  },
  {
    id: "job_taken_mover",
    name: "Job taken by another mover",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
    ],
    body: "ℹ️ *JOB UPDATE: {{1}}*\n\nHi {{2}}, job *{{1}}* has been claimed by another mover.\n\nThank you for your availability! We will notify you as soon as the next job is available in your area. 🚚",
  },
  {
    id: "quote_expired_mover",
    name: "Quote expired (Mover)",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Booking reference" },
      { key: "2", label: "Mover name" },
      { key: "3", label: "Quote price (£)" },
    ],
    body: "⏳ *QUOTE EXPIRED: {{1}}*\n\nHi {{2}}, your quote of £{{3}} for move *{{1}}* has expired as the booking was not completed within the time limit.\n\nWe'll alert you with new job requests shortly! 🚚",
  },
  {
    id: "review_received_mover",
    name: "New review received (Mover)",
    category: "UTILITY",
    target: "Mover",
    parameters: [
      { key: "1", label: "Mover name" },
      { key: "2", label: "Star rating (e.g. 5)" },
      { key: "3", label: "Booking reference" },
      { key: "4", label: "Customer comment" },
    ],
    body: "⭐ *NEW REVIEW RECEIVED!*\n\nHi {{1}}, a customer just left you a {{2}}-star review for move *{{3}}*!\n\n\"{{4}}\"\n\nThank you for providing excellent service on Cary! 🚚",
  },

  // ── 3. ADMIN OPERATIONS & TEST ─────────────────────────────────────────────
  {
    id: "admin_escalation_alert",
    name: "Admin escalation",
    category: "UTILITY",
    target: "Admin Ops",
    parameters: [
      { key: "1", label: "Customer name" },
      { key: "2", label: "Phone number" },
      { key: "3", label: "Pickup address" },
      { key: "4", label: "Drop-off address" },
      { key: "5", label: "Date & time" },
      { key: "6", label: "Items list" },
      { key: "7", label: "Photos status" },
      { key: "8", label: "Requirements" },
      { key: "9", label: "Waiting duration" },
    ],
    body: "🚨 *CARY ESCALATION ALERT*\n*Action:* Take over the request and contact the customer by WhatsApp or phone.\n*Customer details:*\n• Name: {{1}}\n• Phone: {{2}}\n• Pickup: {{3}}\n• Drop-off: {{4}}\n• Date/time: {{5}}\n• Items: {{6}}\n• Photos: {{7}}\n• Requirements: {{8}}\n*Priority:* HIGH — customer has been waiting {{9}}.",
  },
  {
    id: "hello_world",
    name: "Hello World (Test)",
    category: "UTILITY",
    target: "Admin Ops",
    parameters: [],
    body: "Hello World",
  },
];

export const scoutTools = [
  { id: "create_job", name: "Create booking", group: "Booking", fields: ["Service type", "Pickup postcode", "Drop-off postcode", "Move date", "Preferred time", "Items"], outcome: "Booking draft created" },
  { id: "update_job", name: "Update booking", group: "Booking", fields: ["Booking reference", "Updated details"], outcome: "Booking fields updated" },
  { id: "get_customer", name: "Find customer", group: "Customer", fields: ["WhatsApp number"], outcome: "Customer history found" },
  { id: "calculate", name: "Calculate", group: "Quote", fields: ["Expression"], outcome: "Calculation complete" },
  { id: "resolve_date", name: "Resolve date", group: "Booking", fields: ["Natural-language date"], outcome: "London time resolved" },
  { id: "submit_quote", name: "Submit mover quote", group: "Quote", fields: ["Booking reference", "Mover", "Payout", "Notes"], outcome: "Quote recorded" },
  { id: "negotiate", name: "Negotiate quote", group: "Quote", fields: ["Booking reference", "Action", "Counter price"], outcome: "Negotiation recorded" },
  { id: "create_payment", name: "Prepare payment link", group: "Money", fields: ["Booking reference"], outcome: "Payment link prepared" },
  { id: "cancel_job", name: "Cancel booking", group: "Booking", fields: ["Booking reference", "Cancelled by", "Reason"], outcome: "Cancellation prepared" },
  { id: "request_reschedule", name: "Reschedule booking", group: "Booking", fields: ["Booking reference", "New date", "New time"], outcome: "Reschedule recorded" },
  { id: "create_support_ticket", name: "Create support ticket", group: "Support", fields: ["Booking reference", "Raised by", "Category", "Message"], outcome: "Ticket created" },
  { id: "submit_review", name: "Record review", group: "Customer", fields: ["Booking reference", "Rating", "Comment"], outcome: "Review recorded" },
  { id: "save_onboarding_data", name: "Save mover onboarding", group: "Mover", fields: ["Mover", "Business name", "Vehicle", "Licence", "Team size"], outcome: "Onboarding progress saved" },
  { id: "complete_onboarding", name: "Complete mover onboarding", group: "Mover", fields: ["Mover", "Documents deferred"], outcome: "Mover queued for verification" },
  { id: "request_location", name: "Request location", group: "Conversation", fields: ["Prompt"], outcome: "Location request prepared" },
  { id: "send_buttons", name: "Send buttons", group: "Conversation", fields: ["Question", "Button 1", "Button 2", "Button 3"], outcome: "Button message prepared" },
  { id: "send_list", name: "Send choice list", group: "Conversation", fields: ["Header", "Question", "Choices"], outcome: "List message prepared" },
  { id: "show_picker", name: "Present picker", group: "Conversation", fields: ["Picker type", "Context"], outcome: "Picker event recorded" },
] as const;

export function renderTemplate(template: ApprovedTemplate, values: Record<string, string>) {
  return template.body.replace(/{{(\d+)}}/g, (_, key: string) => values[key]?.trim() || `{{${key}}}`);
}

/**
 * Intelligent parameter prefilling logic.
 * Derives accurate, contextual values for each placeholder of any approved template
 * from the active conversation, linked booking, and mover records.
 */
export function getTemplatePrefills(
  template: ApprovedTemplate,
  context: {
    conversation: { name?: string; contactId?: string; role?: string };
    booking?: Booking | null | undefined;
    mover?: MoverRecord | null | undefined;
  }
): Record<string, string> {
  const { conversation, booking, mover } = context;

  const [rawPickup = "", rawDropoff = ""] = (booking?.route || "").split(/ → | to /);
  const pickup: string = rawPickup.trim();
  const dropoff: string = rawDropoff.trim();

  const isCustomer = conversation.role === "Customer";
  const customerFullName: string = (isCustomer ? conversation.name : booking?.customer) || "Customer";
  const customerFirstName: string = customerFullName.split(" ")[0] || "there";
  const customerPhone: string = (isCustomer ? conversation.contactId : "") || "Available on Cary";

  const moverName: string =
    mover?.businessName ||
    mover?.name ||
    (conversation.role === "Mover" ? (conversation.name || "") : (booking?.mover || "")) ||
    "Verified Cary mover";
  const moverFirstName: string =
    mover?.name?.split(" ")[0] ||
    (conversation.role === "Mover" ? (conversation.name?.split(" ")[0] || "") : moverName) ||
    "there";

  const bookingRef: string = booking?.ref || "CARY-MOVE";
  const moveDate: string = booking?.moveAt || "Tomorrow @ 10:00 AM";
  const items: string = booking?.items || "Household items";
  const totalPrice: string = booking?.total ? String(booking.total) : "127";
  const moverPayout: string = booking?.total ? String(Math.max(0, booking.total - 7)) : "120";

  const values: Record<string, string> = {};

  switch (template.id) {
    case "quote_ready_alert":
      values["1"] = customerFirstName;
      values["2"] = pickup || "Cardiff";
      values["3"] = dropoff || "Newport";
      values["4"] = moverName;
      values["5"] = totalPrice;
      values["6"] = moveDate;
      break;

    case "booking_confirmed":
      values["1"] = customerFirstName;
      values["2"] = bookingRef;
      values["3"] = pickup || "Pickup address";
      values["4"] = dropoff || "Drop-off address";
      values["5"] = moveDate;
      values["6"] = moverName;
      break;

    case "trip_status_update":
      values["1"] = "Driver On The Way";
      values["2"] = customerFirstName;
      values["3"] = moverName;
      values["4"] = bookingRef;
      values["5"] = "Driver is en route to pickup location";
      values["6"] = "15-30 minutes";
      break;

    case "move_reminder_customer":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = moveDate;
      values["4"] = moverName;
      values["5"] = pickup || "Pickup address";
      values["6"] = dropoff || "Drop-off address";
      break;

    case "review_request":
      values["1"] = customerFirstName;
      values["2"] = bookingRef;
      values["3"] = moverName;
      break;

    case "quote_followup":
      values["1"] = customerFirstName;
      values["2"] = totalPrice;
      values["3"] = pickup && dropoff ? `${pickup} to ${dropoff}` : "upcoming move";
      break;

    case "payment_reminder_customer":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = moverName;
      values["4"] = totalPrice;
      values["5"] = moveDate;
      break;

    case "emergency_mover_replacement":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      break;

    case "mover_delayed_alert":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = moverName;
      values["4"] = "heavy road congestion";
      values["5"] = "20-30 minutes";
      break;

    case "booking_cancelled_customer":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = "per customer request";
      values["4"] = "Any deposit paid will be refunded to your original payment method.";
      break;

    case "support_message_customer":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = "Our operations team has confirmed your requirements and is actively monitoring your move.";
      break;

    case "intake_abandoned_customer":
      values["1"] = bookingRef;
      values["2"] = customerFirstName;
      values["3"] = pickup || "your area";
      break;

    case "job_invite":
      values["1"] = bookingRef;
      values["2"] = moverName;
      values["3"] = pickup || "Pickup area";
      values["4"] = dropoff || "Drop-off area";
      values["5"] = moveDate;
      values["6"] = items;
      values["7"] = "Driver + 1 helper";
      values["8"] = "Ground floor to 1st floor access";
      break;

    case "job_assigned_mover":
      values["1"] = moverName;
      values["2"] = pickup && dropoff ? `${bookingRef} (${pickup} to ${dropoff})` : bookingRef;
      values["3"] = moverPayout;
      values["4"] = pickup || "Pickup address";
      values["5"] = dropoff || "Drop-off address";
      values["6"] = moveDate;
      break;

    case "move_reminder_mover":
      values["1"] = bookingRef;
      values["2"] = moverName;
      values["3"] = moveDate;
      values["4"] = customerFullName;
      values["5"] = customerPhone;
      values["6"] = pickup || "Pickup address";
      values["7"] = dropoff || "Drop-off address";
      break;

    case "payout_notification":
      values["1"] = moverFirstName;
      values["2"] = moverPayout;
      break;

    case "mover_welcome":
      values["1"] = moverFirstName;
      break;

    case "mover_approved":
      values["1"] = moverFirstName;
      break;

    case "quote_counter_offer_mover":
      values["1"] = bookingRef;
      values["2"] = moverName;
      values["3"] = String(Math.max(10, Number(moverPayout) - 15));
      values["4"] = moverPayout;
      values["5"] = pickup || "Pickup";
      values["6"] = dropoff || "Drop-off";
      break;

    case "payout_action_required":
      values["1"] = bookingRef;
      values["2"] = moverFirstName;
      values["3"] = moverPayout;
      break;

    case "mover_documents_needed":
      values["1"] = moverFirstName;
      values["2"] = "Goods in Transit Insurance and Driving Licence";
      break;

    case "job_cancelled_mover":
      values["1"] = bookingRef;
      values["2"] = moverName;
      break;

    case "job_taken_mover":
      values["1"] = bookingRef;
      values["2"] = moverName;
      break;

    case "quote_expired_mover":
      values["1"] = bookingRef;
      values["2"] = moverName;
      values["3"] = moverPayout;
      break;

    case "review_received_mover":
      values["1"] = moverFirstName;
      values["2"] = "5";
      values["3"] = bookingRef;
      values["4"] = "Excellent service, on time and very careful with furniture!";
      break;

    case "admin_escalation_alert":
      values["1"] = customerFullName;
      values["2"] = customerPhone;
      values["3"] = pickup || "Pickup address";
      values["4"] = dropoff || "Drop-off address";
      values["5"] = moveDate;
      values["6"] = items;
      values["7"] = "Photos on file";
      values["8"] = "Driver + 1 helper";
      values["9"] = "10+ minutes";
      break;

    case "hello_world":
    default:
      break;
  }

  return values;
}