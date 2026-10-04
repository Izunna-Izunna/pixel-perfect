# Cary Mission Control audit

| Page or feature | Route | Status | What is wrong | Planned fix |
| --- | --- | --- | --- | --- |
| Auth and entry | `/login` | Partial | No redirect validation, MFA, password-help sheet, expired session or session state. Uses a decorative dark gradient treatment. | Rebuild auth flow with mock session, safe redirects and neutral login surface. |
| Overview | `/` | Partial | Route range controls, map controls and quick actions are inert. Only a few KPI panels appear; chart kit and full insight suite are missing. | Build data controls, chart kit, all overview charts and stateful quick actions. |
| Inbox | `/inbox` | Partial | Conversation selection only changes inline state; URL never changes and the chat is not reusable. Several context controls are inert. | Build shared `ChatView`, add `/inbox/:sessionId`, fixed desktop console and full-screen small-screen flow. |
| Needs Attention | `/attention` | Partial | Every action is inert and no all-clear or queue mutation exists. | Connect queue actions to stateful mock mutations and add all states. |
| Bookings list | `/bookings` | Partial | Filters, search and create button are inert. Rows link back to the same list, not profiles. | Rebuild list pattern and add booking profile routes with URL-synced tabs. |
| Movers list | `/movers` | Partial | Hard-coded mini fixture, cards do not open profiles, add mover is inert. | Use shared mock store, list controls, add mover flow and mover detail routes. |
| Customers list | `/customers` | Partial | Hard-coded fixture, profile actions and data states are missing. | Use shared mock store, list controls and customer detail routes. |
| Payments | `/payments` | Partial | Ledger is display-only and money actions are missing. | Add payment detail, confirmations and stateful payouts/refunds. |
| Record profiles | `/bookings/:ref`, `/movers/:id`, `/customers/:id` | Missing | Required headers, tabs, notes, activity, attention and document/privacy workflows are absent. | Build shared profile patterns and all required tabs. |
| Escalations | `/escalations`, `/escalations/:ticketId` | Missing | No routes or workspace. | Build queue and ticket workspace with shared chat. |
| Quotes, reminders, broadcasts | `/quotes/new`, `/reminders`, `/broadcasts/*` | Missing | Routes and workflows absent. | Build operational tools and mock mutations. |
| System, audit and settings | `/system`, `/audit`, `/settings/*` | Missing | Routes and governance controls absent. | Build role-aware system, audit and settings screens. |
| Global states and safety | `/_states`, `/notifications`, `/search` | Missing | No 404, access, offline, notifications, search or shared state catalogue. | Add state catalogue, global panels and error routes. |
| Design system | Global | Partial | Lavender and gradients remain; type and surface rules conflict with the completion brief. | Replace with neutral token system and shared status/visual primitives. |
| Interaction quality | Global | Broken | Many controls have no mutation, navigation, or feedback. | Implement stateful mock API, audit entries and automated click-through checks. |