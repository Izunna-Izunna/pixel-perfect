# Completion Gate

Status legend: Not started · In progress · Done · Done (UI complete, backend gap)

## Routes
- [ ] / — In progress
- [ ] /login — In progress
- [ ] /inbox — In progress
- [ ] /inbox/:sessionId — In progress
- [ ] /attention — In progress
- [ ] /escalations — Not started
- [ ] /escalations/:ticketId — Not started
- [ ] /bookings — In progress
- [ ] /bookings/:ref — Not started
- [ ] /bookings/new — Not started
- [ ] /bookings/:ref/assign — In progress
- [ ] /bookings/:ref/reschedule — Not started
- [ ] /bookings/:ref/cancel — Not started
- [ ] /movers — In progress
- [ ] /movers/new — Not started
- [ ] /movers/:id — Not started
- [ ] /customers — In progress
- [ ] /customers/:id — Not started
- [ ] /payments — In progress
- [ ] /payments/:id/refund — In progress
- [ ] /quotes/new — Not started
- [ ] /reminders — Not started
- [ ] /broadcasts — Not started
- [ ] /broadcasts/new — Not started
- [ ] /broadcasts/:id — Not started
- [ ] /templates — Not started
- [ ] /templates/:name — Not started
- [ ] /templates/:name/send — Not started
- [ ] /templates/history — Not started
- [ ] /notifications — Not started
- [ ] /system — Not started
- [ ] /audit — Not started
- [ ] /settings/account — Not started
- [ ] /settings/team — Not started
- [ ] /settings/operations — Not started
- [ ] /settings/notifications — Not started
- [ ] /search — Not started
- [ ] /_states — In progress

## Dedicated flows
- [ ] A1 Assign mover — In progress
- [ ] A2 Refund — In progress
- [ ] A3 Template messages — Not started
- [ ] A4 Notifications — Not started
- [ ] A5 Reschedule, cancel, booking, verify, raise/resolve ticket, broadcast — Not started

## Dialogs and sheets
- [ ] Standard confirmation
- [ ] Money confirmation (typed word + hold)
- [ ] Takeover / resume Scout
- [ ] Phone reveal / idle timeout / session expired / kill switch
- [ ] Privacy and customer actions
- [ ] Mover verification actions
- [ ] Notes, mentions and saved views
- [ ] Table, filters and date-range controls
- [ ] Team management / shortcuts / command palette / global search
- [ ] Media, document, image, context and entity previews
- [ ] Notifications, user and theme menus

## Forms, feedback and data components
- [ ] Validated text, phone, postcode, money and London date/time inputs
- [ ] Selectors, comboboxes, chips, vehicle list, uploads and steppers
- [ ] Toasts, banners, states, offline, progress, tooltips and popovers
- [ ] Badge, avatar, tabs, pagination and mobile action bar
- [ ] Data table, stats, activity, notes, key-value, chart kit, map and move timeline

## Evidence required
- [ ] Lint, token lint and empty-handler lint
- [ ] Type check, unit and axe checks
- [ ] Dead-control crawl at 390 and 1440
- [ ] Dedicated flow tests at desktop and phone
- [ ] Light/dark screenshots at 390 and 1440 for each route and flow
