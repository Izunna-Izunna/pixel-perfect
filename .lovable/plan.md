# Cary operational feature expansion

## Direction

Keep Cary’s current cockpit design, navigation, data density, record-detail routes, mobile shell, and mock-only behaviour. Use the uploaded former dashboard only as a feature inventory: add the operational capabilities it contains that Cary does not yet offer, while expressing them in Cary’s established visual system rather than replacing it with the old design.

## 1. Shared capabilities without a shell redesign

- Preserve the current workspace frame, navigation hierarchy, command palette, theme support, and responsive shell.
- Add only missing cross-product capabilities indicated by the former dashboard: a quick booking entry point, clearer operational filters, contextual action access, explicit system/template readiness, and richer team-level controls.
- Keep compact mobile navigation and make every new control usable at narrow widths without altering the desktop interaction model.

## 2. Overview: add missing operational intelligence

- Keep the existing Pulse, live operations map, attention queue, activity feed, charts, and Today’s Moves layout.
- Add the missing derived measures as supplemental operational metrics: active bookings, completed-today count, customer volume, and Cary £7 fee revenue.
- Add Trips/Volume data switching to the existing chart area, with values calculated from the mock booking store using London-day buckets.
- Add a compact Live Trip Board table alongside—not instead of—the existing map/timeline experience, with direct links to booking detail, assignment, redispatch, and messages.
- Derive every new figure, table row, and activity item from the shared operations store rather than fixed screen copy.

## 3. Records: add missing controls and history

- Extend the existing Bookings table with missing operational views (Active/Live, Completed, Cancelled), date/region/mover filtering, sortable time and money columns, urgency markers, and reference-style per-row quick actions where their mock workflow exists.
- Keep the current booking detail and dispatch routes. Row actions will open detail, dispatcher, redispatch, or the relevant conversation; financial and destructive actions stay on their existing dedicated confirmation flows.
- Add the former dashboard’s customer-management features to the existing customers experience: masked WhatsApp reference, total jobs/spend, joined date, per-customer chat reset confirmation, a global mock-history reset with typed confirmation, plus a unified mock event timeline on the profile.
- Preserve the existing mover table and profile; add any missing fleet, verification, availability, past-job, review, and messaging context without replacing its established layout.

## 4. Inbox: add the former action palette capabilities

- Keep the corrected behaviour: desktop conversation selection changes the already-visible centre thread; mobile alone opens the full-screen thread route.
- Extend the conversation list with the missing role/state filters (all, human-taken-over, customer, mover, internal) and visible unread, active-move, and safe-window signals.
- Add a contextual Scout Action Palette to the existing desktop context rail: approved templates, payment/quote shortcuts, move actions, and safe WhatsApp interaction options. Every entry either performs a mock-store update, opens its existing dedicated workflow, or is visibly unavailable with its reason.
- Keep templates in the right-side slide-out, retain the approved-template preview and 24-hour sending rule, and add useful quick-reply chips above the composer.
- Add mock-only thread utilities that are safe to demonstrate: local conversation summary based on the stored mock messages, attachment list state, and scheduled-reminder hand-off; do not claim AI, WhatsApp delivery, or external tool execution.

## 5. Operations settings, team, and templates

- Add a dedicated operational settings view in addition to—not in place of—the existing account page: clearly labelled mock WhatsApp account/template status, mock phone/quality state, operator/team management, template inventory, and system-memory controls.
- Add a mock team list with role labels and an invite form that records an audit event rather than sending mail.
- Add pricing visibility (the £7 platform fee remains fixed for this build) and links to System health, audit log, and template status.
- Expand System audit browsing with search/filter controls and make global chat-history reset, Scout pause, payout, refund, and personal-data controls retain their typed-confirmation safeguards.

## 6. Quality and verification

- Ensure every new control performs a visible mock update, routes to a real screen, or is removed/disabled with a plain-language reason; no fake live WhatsApp, payment, AI, queue, or message-delivery claims.
- Add unique metadata to any changed or added content route and proper unavailable/not-found states for unknown records or conversations.
- Verify desktop at 1440px and phone at 390px: table overflow behaviour, inbox selection versus mobile navigation, quick actions, template panel, reset confirmation, account controls, keyboard focus, dark/light themes, and no horizontal page overflow.
- Update the completion checklist, audit notes, decisions, backend gap list where the future integration contract changes, and the project roadmap with evidence of the completed work.

## Technical notes

- Continue using the shared mock operations store as the only source of operational state; do not add a database or third-party connection in this pass.
- Continue using the Europe/London time helpers for every operational timestamp and the existing semantic CSS tokens for all visual styling.
- Keep money rules explicit: customer price includes the £7 Cary fee; mover payout is the quote amount; actions affecting money remain dedicated, auditable confirmation flows.