# Cary operational UI refresh

## Direction

Use the uploaded screens as a reference for a compact, table-first Cary Admin workspace: a flatter left navigation, a quiet top bar, denser operational tables, small status pills, and practical per-row actions. Keep the existing Cary visual tokens, responsive mobile shell, record-detail routes, and mock-only behaviour. This is an inspired interface update, not a pixel copy.

## 1. Shared application frame

- Rework the desktop workspace frame into the reference’s simpler operational structure: Cary Admin / Cardiff Operations identity, flat navigation, a persistent search trigger, notification control, compact operator menu, quick booking entry point, and operator card/sign-out at the bottom of the rail.
- Map the reference categories to existing working Cary routes without removing the current workflows: Overview, Live Inbox & Scout, Bookings, Movers, Customers, Tickets, Payments, and Settings/System.
- Keep compact mobile navigation and make each header survive narrow widths without clipped controls.

## 2. Overview as an operational snapshot

- Replace the current hero-led overview with four live mock-derived metrics: active bookings, completed moves, customer volume, and Cary’s £7 booking-fee revenue.
- Add the two-column reference composition: a selectable Trips/Volume chart sourced from mock bookings, plus a high-visibility attention list linking into the appropriate ticket, booking, mover review, or payment workflow.
- Replace the current lower dashboard content with a concise Live Trip Board table that exposes customer, mover, status, route, fee, and direct assign/refresh/view actions.
- Derive every figure, table row, and activity item from the shared operations store rather than fixed screen copy.

## 3. Table-first record management

- Rebuild the Bookings list around the reference table schema: Ref, Customer, Mover, Status, Route, Cary fee, and Actions; add All / Active & Live / Completed / Cancelled views, text search, mock-backed date/status controls, accessible sorting, and no-results states.
- Make each row’s actions intentional: open detail, open the dispatcher where assignment is possible, redispatch in mock state where applicable, and open the relevant message thread. Keep destructive and financial changes on their existing dedicated confirmations.
- Turn Customers into a compact table with masked WhatsApp number, total jobs, total spend, joined date, profile action, and a protected mock “reset this chat” flow. Add a separate typed confirmation for the global mock-history reset rather than falsely implying deletion of external records.
- Preserve the existing Mover table but tighten it to the same shared row/action pattern, adding actual fleet, verification, jobs, rating, profile, and message context.

## 4. Inbox command centre

- Keep the corrected behaviour: desktop conversation selection changes the already-visible centre thread; mobile alone opens the full-screen thread route.
- Extend the conversation list with reference-style role/state filters (all, human-taken-over, customer, mover, internal) and visible unread, active-move, and safe-window signals.
- Rebuild the desktop right rail as a contextual Scout Action Palette: approved templates, payment/quote shortcuts, move actions, and safe WhatsApp interaction options. Every entry either performs a mock-store update, opens its existing dedicated workflow, or is visibly unavailable with its reason.
- Keep templates in the right-side slide-out, retain the approved-template preview and 24-hour sending rule, and add useful quick-reply chips above the composer.
- Add mock-only thread utilities that are safe to demonstrate: a local conversation summary based on the stored mock messages, attachment list state, and scheduled-reminder hand-off; do not claim AI, WhatsApp delivery, or external tool execution.

## 5. Operations settings and auditability

- Replace the current individual-only account screen with an operational Settings page inspired by the reference: clearly labelled mock WhatsApp account/template status, mock phone/quality state, operator/team section, and system-memory controls.
- Add a mock team list with role labels and an invite form that records an audit event rather than sending mail.
- Add configurable mock pricing visibility (the £7 platform fee remains fixed for this build) and links to System health, audit log, and template status.
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