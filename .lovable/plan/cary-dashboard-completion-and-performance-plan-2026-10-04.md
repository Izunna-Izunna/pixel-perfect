# Cary dashboard completion and performance plan

## Goal
Make the Cary dashboard feel deliberate and dependable: every visible control either completes a useful mock workflow or is clearly unavailable for a stated reason, profiles open as full pages, and navigation is fast across phone and desktop.

## 1. Complete the shell and navigation
- Replace the overview's toast-only date, timeline, attention and activity controls with URL-synced filters, real destination links, or remove them when they do not serve an operator task.
- Complete global search and the command palette so results include bookings, movers, customers and conversations, then open the exact record or thread.
- Make sidebar counts live from the shared mock store; fix active navigation on nested record and chat pages.
- Replace raw clickable elements in the app shell and error screen with the existing button controls and add tooltips for icon-only actions.

## 2. Rebuild weak pages and cards
- Redesign the overview into operational sections with a clear action hierarchy, working date range, linked attention items and purposeful empty/loading states.
- Rework remaining list cards and tables for booking, mover, customer and payment records so each row opens its dedicated full-page detail view and no control is decorative.
- Finish the component-state page as a real reference for loading, empty, error, unavailable and permission states.
- Review all current record profile tabs and replace placeholder content with explicit mock data or a clear unavailable state; retain mover licence, documents, completed jobs and reviews, plus customer moves and payments.

## 3. Finish stateful mock operations
- Expand the shared operations store to own booking, payout, refund, attention, activity and notification state.
- Make payout release and customer refund confirmations update payment status, booking totals, mover/customer profile totals, attention items and notification/activity history.
- Complete assignment, document review, booking cancellation/reschedule and template-message flows with validation, confirmation and visible outcomes.
- Add the missing dedicated pages: booking creation, mover creation, templates and template history, plus operational settings views that are exposed by the interface.
- Keep external payment delivery and payment-link creation visibly unavailable until a real service is connected, without fake success messages.

## 4. Make every page and control intentional
- Crawl all desktop and mobile controls. For each one: wire it to a real mock flow, disable it with permanent explanatory copy where an external service is required, or remove it.
- Remove success toasts used in place of unfinished work and replace generic placeholder copy with domain-specific states.
- Add not-found handling for invalid record/thread URLs and make each current content route carry its own app-specific sharing metadata.

## 5. Improve load and navigation speed
- Convert list/search/filter state that belongs in the address to typed URL search parameters, preserving shareable filtered views.
- Avoid unnecessary full-page work on navigation by splitting heavier record and dashboard visual modules, keeping persistent shell state stable, and using intent preloading on record links.
- Use the shared store as the single mock-data source so mutations do not cause duplicated or inconsistent rendering.
- Add concise pending states only where navigation takes long enough to need feedback; ensure phone layouts do not mount hidden desktop workspaces.

## 6. Verification and evidence
- Add focused tests for each money rule, assignment, document review, filters, search, notifications, invalid-record states and message-window behavior.
- Test every route and visible button at 390px and 1440px, including phone chat composer, profile navigation, refund/release confirmation holds and theme switching.
- Check current build/runtime logs, keyboard focus, no horizontal overflow and light/dark screenshots before marking each completion-gate item done.

## Technical details
- Continue frontend-only mock mode with the existing Europe/London time utility and token-based styling.
- Do not invent live payment or messaging delivery; show simulated outcomes clearly and document the external-service gap.
- Keep operational actions as dedicated pages when they change assignment, money or outbound messaging.
