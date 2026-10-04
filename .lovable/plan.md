# Cary operations dashboard completion plan

## Goal
Turn the present mock dashboard into a coherent operations console that matches the supplied Cary brief, while keeping current mock actions honest until the documented `/api/admin/*` service is connected.

## Confirmed gaps
- The current navigation only exposes Overview, Inbox, Needs Attention, Bookings, Movers, Customers and Payments; there are no dedicated quoting, reminders, tickets/escalations, broadcasts or system-health workspaces.
- The inbox currently has only All, Needs action and Taken over views. Its context is abbreviated, Scout tools are unavailable, and template data is local mock data rather than an API-backed library.
- Booking pages show basic details and assignment/refund links, but lack quote management, redispatch, completion, cancellation and full itinerary/inventory workflows.
- Mover and customer pages lack complete document-vetting, CRM reset/note, and manual onboarding flows.
- The dashboard uses local fixtures and local state. No client currently calls the supplied `/api/admin/*` contract, and `BACKEND_GAPS.md` does not yet distinguish all missing live-contract fields from frontend mock data.
- Existing decisions already mark performance and accessibility validation as unfinished.

## 1. Make the app data-ready without pretending it is live
- Create a typed admin client, Zod response schemas, central error handling and a `mock | live` data-source switch.
- Map every documented endpoint in the supplied contract for stats, conversations, messages, takeover, templates, Scout tools, bookings, movers, customers, tickets, payments, negotiations and WhatsApp status.
- Keep mock fixtures as the exact fallback with equivalent loading, empty and failure states; live actions must surface provider/API failures rather than report invented success.
- Expand `BACKEND_GAPS.md` only for data needed by the UI but absent from the provided contract: complete record histories and attachments, template parameter schema/approval metadata, document/media access controls, queue detail payloads, audit-event reads/writes, map/geocoding, and a real-time event/reconnect contract.

## 2. Finish the inbox as the command centre
- Keep one desktop conversation surface: selecting a conversation updates the middle pane; phone selection remains a dedicated full-screen thread with a back control.
- Complete list filters for customer, mover, needs action and human takeover, with search by name, masked number and booking reference, delivery indicators, unread/escalation state and London-relative timestamps.
- Build a right-side context drawer with masked contact profile, verification, live booking, route, timing, quote/payment summary and direct actions.
- Keep templates as the right slide-out panel; populate six approved operational templates with editable safe parameters and WhatsApp preview. Enforce the 24-hour rule everywhere and label mock sends clearly.
- Add real handover metadata (operator, note, timestamp), tool drawer schemas from the live service, and explicit unavailable feedback until tools are connected.

## 3. Complete booking, dispatch and quoting operations
- Upgrade bookings into a status-pipeline table with URL-backed filters and direct record links.
- Expand booking detail with itinerary/access, inventory/photos placeholder states, mover quotes and payment breakdown.
- Add protected flows for quote override, verified-mover assignment, redispatch exclusions, completion/payout handoff, cancellation reason and refund handoff. Assignment stays a modal entry point from chat and opens the full comparison workspace only after confirmation.
- Build the dedicated manual Quote Tool with the provided van, labour, stairs and surcharge inputs, clear £7 fee math, customer total, and honest unavailable/live actions for WhatsApp and Stripe links.

## 4. Complete fleet and customer operations
- Add mover onboarding, licence/insurance review, verify/request-clearer/reject/defer decisions, notes and audit feedback.
- Show mover vehicles, insurance, availability, historical/upcoming jobs, reviews, payout history and conversation links in the profile.
- Finish customer CRM with move/quote/payment history, internal notes, direct chat, reset-chat confirmation and GDPR-safe privacy controls.
- Keep phone numbers masked until a recorded operator reveal; preserve role restrictions for high-risk and developer-only work.

## 5. Add the missing operational modules
- **Reminders & broadcasts:** scheduled-reminder table, send-now confirmation, rescheduling, and mover broadcast composition; display unavailable state when the queue service is absent.
- **Tickets & disputes:** triage table, booking/contact links, resolution workspace, refund/replacement-mover handoffs and close-with-notes flow.
- **System health:** WhatsApp quality/template status, queue and worker health, London clock, API/data status, and the typed `PAUSE ALL` kill-switch confirmation.
- **Overview:** connect metrics, charts, active moves, fleet status, stuck negotiations, escalations, quick actions and live activity to the common data source.

## 6. Security, performance and quality gate
- Add actual login/route protection and role gates: admin, operator and viewer capabilities must match the operational brief; do not rely on browser-only role flags.
- Preserve typed-word plus hold-to-confirm safeguards for refunds, payouts, kill switch and data deletion, with audit records for every operator action.
- Split the monolithic operations state into focused subscriptions, eliminate duplicated date libraries, defer heavy chart/map/detail modules and pre-load record routes from tables.
- Validate every visible control as functional, intentionally unavailable with a reason, or removed. Test desktop and phone inbox layouts, both themes, all dedicated routes, keyboard flow, no horizontal overflow, and the 24-hour, £7, role and London/DST rules.
- Update `AUDIT.md`, `COMPLETION_GATE.md`, `COMPONENT_CHECKLIST.md`, `DECISIONS.md` and the roadmap as each verified section lands.

## Delivery order
1. Typed mock/live data layer plus route/auth guard foundation.
2. Inbox/context/templates and booking/dispatch/quote operations.
3. Mover/customer vetting and CRM.
4. Reminders, tickets, system health and overview data wiring.
5. Performance, accessibility, responsive validation and completion evidence.

## Technical notes
- Keep `src/lib/time.ts` as the source of Europe/London operational time formatting and keep mock fixtures in `src/features/core/mock-data.ts`.
- No real WhatsApp, Stripe, Scout tool, queue or backend mutation is enabled until its documented service is configured and has returned a successful response.
- The supplied backend uses `/api/admin/*`; this plan treats that as the live contract and does not require changing or replacing the backend.
