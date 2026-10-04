# Cary completion and chat repair plan

## Goal
Make the dashboard dependable in mock mode: conversations work on desktop and phone, record and money actions have visible results, and no visible control is a fake success action.

## 1. Rebuild the inbox around real conversation state
- Replace local-only message state with a shared mock operations store so sent messages, delivery state, read state, takeover state, template sends, and queue counts update across Inbox, profiles, Needs Attention, and activity.
- Make `/inbox/:sessionId` the single URL-synced conversation destination: desktop keeps the three-pane workspace with the selected thread in place; phone opens a full-screen thread with Back, contact details, active booking, and quick actions in a context sheet.
- Fix the phone visibility defect: the composer must remain above the bottom tab bar and keyboard area, with no hidden off-screen input; preserve scrolling to the latest message.
- Implement live Inbox search and All / Needs action / Taken over filters, clear unread state when opened, and keep the selected thread and list state consistent.
- Complete the chat actions: required handover note for Take over, real Resume Scout state, computed 24-hour countdown from the conversation data, freeform lock after closure, template picker with sent template inserted into the thread, attachment picker with selected-file UI, and mock delivery updates / inbound replies.

## 2. Complete the operational actions already visible
- Replace Needs Attention toast-only actions with the correct action page, confirmation, or resolved state; remove resolved work from the queue and add an activity entry.
- Turn the header bell into a notification feed with unread state, timestamps, record links, and mark-as-read; keep Needs Attention as its own work queue.
- Make the command palette and header search actually filter bookings, people, and conversations by name, reference, or masked/full phone; selected results open the exact record or thread.
- Replace profile and mobile Settings placeholder actions with usable account/settings views, including theme preference and sign out; persist the theme preference in mock mode.

## 3. Repair list pages and visible record controls
- Wire Inbox and Bookings search/filter controls to their mock data and show correct counts, empty states, and reset controls.
- Replace disabled Create booking and Add mover controls with dedicated mock forms, including validation and a visible created-result state; add missing loading, empty, and error states to booking, mover, customer, and payment lists.
- Replace profile placeholder fields with explicit mock data or a designed unavailable state; retain full nested profile screens for mover and customer details, documents, jobs, reviews, moves, payments, and chat links.

## 4. Make mock money behaviour explicit and stateful
- Keep the existing typed-word plus 800 ms hold confirmation for refunds and payout release, but update the shared mock ledger, booking/payment status, relevant profile totals, attention items, and activity after confirmation.
- Clearly label simulated payment-provider outcomes and remove fabricated live-provider language; keep live payment/link actions visibly unavailable until a backend is connected, with an explanatory in-app state rather than a dead button.

## 5. Close the visible product gaps in priority order
- Build the missing operational pages that are exposed by navigation or the completed flows: notifications, account/settings, booking reschedule/cancel, mover verification results, and templates.
- Keep broader unlinked surfaces (escalations, quotes, reminders, broadcasts, system, audit) tracked as a second completion slice rather than presenting stub links.
- Update the completion checklist and backend-gaps documentation so mock-only behaviour and real-service dependencies are unambiguous.

## 6. Verification and guardrails
- Add focused tests for: phone chat navigation and visible composer, thread selection/deep links, sending/freeform lock/template flow, takeover/resume, list filtering/search, notification read state, and confirmed money state changes.
- Crawl every visible button at 390px and 1440px: wire it, disable it with persistent explanatory copy, or remove it; no success toast may stand in for unfinished work.
- Verify desktop and phone screenshots in light and dark themes, keyboard navigation and focus for dialogs/menus, no horizontal overflow, and no console/build/type errors.

## Technical notes
- Continue using the existing mock fixtures and Europe/London time utility; no external backend or real payment provider will be connected in this pass.
- Preserve the neutral token-based visual system and separate full detail pages for records.
- Real payment execution, audit persistence, external media storage, and live WhatsApp delivery remain backend-dependent and will be labelled accordingly.
