# Cary dashboard completion plan

## Goal
Finish every incomplete dashboard workflow, remove misleading or dead controls, and make the Cary cockpit reliable on desktop and phone while preserving the current visual language and mock-backed operation model.

## Phase 0 — Repair the visible contract first
- Restore the shared states workspace at the promised `/_states` URL and use it to verify loading, empty, error, offline and permission-denied states in light and dark themes.
- Give every content page complete, unique social metadata; fix pages currently missing titles/descriptions and make all payment routes consistently named.
- Replace raw interactive elements with the shared control system, including accessible selected states and keyboard behavior.
- Update the roadmap, decisions, README and backend-gap record so the product scope, mock boundaries and evidence match the implemented dashboard.

## Phase 1 — Make the inbox complete on every screen
- Build the phone conversation context as a bottom sheet: customer/mover/booking details, quick replies, approved templates, Scout tools and the existing two-step mover availability flow. Keep desktop selection inside the three-pane workspace.
- Calculate the 24-hour WhatsApp window/countdown from the conversation’s UTC data with London display and an automatic transition to template-only sending. Add a live Scout typing state and screen-reader announcements.
- Make unread counts, filtering, search (name, booking reference and masked phone), context reset, phone reveal/audit and message delivery state truly reflect shared operations state.
- Finish quote-to-chat handoff: open the linked customer thread with the approved quote template and quote parameters ready to review instead of returning to a generic inbox.
- Clearly label simulated attachments and retain draft/selection state safely during related chat actions.

## Phase 2 — Complete operations workspaces
- Rebuild Overview around live derived data: correct London-day range/compare controls, the full required operational metrics/charts, map fallback and tabular fallback, active trip board, attention queue and meaningful all-clear/empty states.
- Complete bookings, mover and customer workspaces with reliable search/filter/sort/pagination, mobile table treatment, full profile tabs, audit-backed note/privacy actions and linked-record navigation everywhere.
- Finish money workflows: payment-link preparation, held/released/refunded ledger states, exact typed-word plus hold confirmation for payout/refund actions, amount/consequence review, and audit trail evidence.
- Complete reminders, tickets, notifications, team/settings and system health so every visible action records a real mock-state outcome; make admin-only actions unavailable to operator/viewer roles.
- Add a dedicated Audit Log workspace with filters, target links, before/after context and actor/time data; connect System and Settings links to it rather than labeling unrelated views as audit logs.

## Phase 3 — Reliability, access and performance
- Add a mock authentication guard with role-aware navigation and page/action restrictions; preserve the existing login accounts and session clearing behavior.
- Split heavier pages and defer visual tools where appropriate; stop serializing the whole mock dataset into the initial page payload and tune route preloading so static screens do not refetch on every hover.
- Add route-level loading/error/offline states, resilient action feedback and no false success language for unavailable external systems.
- Improve accessibility: semantic chart/map alternatives, labelled data visualizations, focus management, keyboard-first command palette, live status announcements and zero-violation dialog/form behavior.

## Phase 4 — Verification and completion evidence
- Add unit tests for time/DST formatting, 24-hour-window rules, money confirmation guards, role rules and shared-store transitions.
- Add browser flows for login/role access, desktop inbox selection, phone chat actions, mover assignment, template send, quote handoff, refund/payout confirmation, privacy reveal/export and kill switch.
- Perform visual QA at 390, 768 and 1440px in light and dark themes for every changed workspace; fix overflow, touch-target, focus and text-fit defects.
- Record route-by-route completion in the roadmap and decisions, then produce a concise audit report showing what remains blocked solely on the external backend contract.

## Technical notes
- Stay frontend/mock-backed until the connected external backend’s data contract is inspected; do not represent delivery, payment settlement, Scout automation or realtime events as live.
- Keep operational time logic in `src/lib/time.ts` using `Europe/London`, fixtures in `src/features/core/mock-data.ts`, and shared interaction state in the operations store.
- Preserve desktop three-pane inbox behavior, the phone full-screen thread, the right-panel placement of templates/quick replies/Scout tools, and the £7 Cary fee rule.
- Any external API, realtime, payment or privacy endpoint still undefined must remain recorded in `BACKEND_GAPS.md` rather than guessed.
