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
  {
    id: "job_invite",
    name: "Job invite",
    category: "UTILITY",
    target: "Mover",
    parameters: ["Booking reference", "Mover name", "Pickup", "Drop-off", "Date & time", "Items", "Loading help", "Requirements"].map((label, index) => ({ key: String(index + 1), label })),
    body: "📋 *JOB DISPATCH NOTICE: {{1}}*\nHi {{2}}, a new moving request is available for quotation:\n📍 *Pickup:* {{3}}\n🏁 *Drop-off:* {{4}}\n📅 *Date & Time:* {{5}}\n📦 *Items:* {{6}}\n👥 *Loading Help:* {{7}}\n📝 *Requirements:* {{8}}\nReply with your quote price in GBP (e.g. \"£150\") or tap below to claim.",
  },
  {
    id: "job_assigned_mover",
    name: "Mover assignment",
    category: "UTILITY",
    target: "Mover",
    parameters: ["Mover name", "Booking reference & route", "Net payout", "Pickup", "Drop-off", "Date & time"].map((label, index) => ({ key: String(index + 1), label })),
    body: "📋 *JOB ASSIGNMENT NOTICE*\nHi {{1}}, you have been assigned to move *{{2}}* at a net payout of *£{{3}}*.\n📍 *Pickup:* {{4}}\n🏁 *Drop-off:* {{5}}\n📅 *Date & Time:* {{6}}\nThe customer has received their quote and payment link. Please reply to this message to confirm your schedule and ETA!",
  },
  {
    id: "quote_ready_alert",
    name: "Quote ready",
    category: "UTILITY",
    target: "Customer",
    parameters: ["Customer first name", "Pickup area", "Drop-off area", "Mover business name", "Total price", "Move date"].map((label, index) => ({ key: String(index + 1), label })),
    body: "Hi {{1}}, great news! A verified mover has submitted a quote for your move (*{{2}}* ➔ *{{3}}*):\n🚚 *Mover:* {{4}}\n💰 *Quote Price:* £{{5}}\n📅 *Pickup Date:* {{6}}\nTap below or reply to this message to view details, negotiate, or book now!",
  },
  {
    id: "booking_confirmed",
    name: "Booking confirmed",
    category: "UTILITY",
    target: "Customer",
    parameters: ["Customer name", "Booking reference", "Pickup", "Drop-off", "Date & time", "Assigned mover"].map((label, index) => ({ key: String(index + 1), label })),
    body: "🎉 *Booking Confirmed!*\nHi {{1}}, your booking for move *{{2}}* is officially confirmed and paid.\n📍 *Pickup:* {{3}}\n🏁 *Drop-off:* {{4}}\n📅 *Date & Time:* {{5}}\n🚚 *Assigned Mover:* {{6}}\nYour mover has received your move details. Reply to this message anytime if you have questions!",
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
    id: "admin_escalation_alert",
    name: "Admin escalation",
    category: "UTILITY",
    target: "Admin Ops",
    parameters: ["Customer name", "Phone", "Pickup", "Drop-off", "Date/time", "Items", "Photos", "Requirements", "Waiting time"].map((label, index) => ({ key: String(index + 1), label })),
    body: "🚨 *CARY ESCALATION ALERT*\n*Action:* Take over the request and contact the customer by WhatsApp or phone.\n*Customer details:*\n• Name: {{1}}\n• Phone: {{2}}\n• Pickup: {{3}}\n• Drop-off: {{4}}\n• Date/time: {{5}}\n• Items: {{6}}\n• Photos: {{7}}\n• Requirements: {{8}}\n*Priority:* HIGH — customer has been waiting {{9}}.",
  },
  {
    id: "move_reminder_customer",
    name: "Customer move reminder",
    category: "UTILITY",
    target: "Customer",
    parameters: ["Booking reference", "Customer name", "Move time", "Mover", "Pickup", "Drop-off"].map((label, index) => ({ key: String(index + 1), label })),
    body: "📅 MOVE REMINDER: {{1}}\nHi {{2}}, your move is scheduled for *{{3}}* with *{{4}}*.\nPickup: {{5}}\nDrop-off: {{6}}\nTip: Please ensure boxes are taped and paths clear!",
  },
  {
    id: "move_reminder_mover",
    name: "Mover job reminder",
    category: "UTILITY",
    target: "Mover",
    parameters: ["Booking reference", "Mover name", "Move time", "Customer", "Customer phone", "Pickup", "Drop-off"].map((label, index) => ({ key: String(index + 1), label })),
    body: "🚚 JOB REMINDER: {{1}}\nHi {{2}}, you have a move on *{{3}}*.\nCustomer: {{4}} ({{5}})\nPickup: {{6}}\nDrop-off: {{7}}\nPlease reply START when en route.",
  },
  {
    id: "payout_notification",
    name: "Payout notification",
    category: "UTILITY",
    target: "Mover",
    parameters: [{ key: "1", label: "Mover name" }, { key: "2", label: "Payout" }],
    body: "Hi {{1}}, your payout of £{{2}} has been sent to your account for your completed job. Thanks for moving with Cary! 💪",
  },
  {
    id: "emergency_mover_replacement",
    name: "Emergency mover replacement",
    category: "UTILITY",
    target: "Customer",
    parameters: [{ key: "1", label: "Booking reference" }, { key: "2", label: "Customer name" }],
    body: "🚨 MOVE UPDATE: {{1}}\nHi {{2}}, your assigned mover had an unexpected emergency. Your payment is 100% protected. Our operations team is assigning a priority replacement mover right now.",
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