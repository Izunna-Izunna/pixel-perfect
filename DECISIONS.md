# Cary Mission Control decisions

## Foundation assumptions
- The current build defaults to mock data until `VITE_API_MODE=live` is connected to the documented admin API.
- The app treats all operational timestamps as UTC inputs and formats them through `Europe/London`.
- The initial role is an operator in mock mode; high-risk controls remain deliberately unavailable in the foundation.
- Customer, mover, booking, chat, refund and payout-release flows now use local mock state. They demonstrate the intended protected confirmations, but Stripe settlement and audit persistence require the live API.

## Design rationale
- The workspace uses a calm, high-density instrument-panel layout: a neutral canvas and flat surfaces, with green limited to live and positive outcomes, amber for waiting states, and red for failures or risk.
- The refreshed palette removes display-serif, lavender and all decorative gradients, keeping visual hierarchy in typography, spacing and hairlines rather than ornamental colour.
- The overview prioritises the next action above reporting: Needs Attention stays adjacent to live operations and today’s schedule.
- The map is a styled regional operations surface rather than a generic map control until production coordinates are available.

## QA log
- Initial foundation: desktop-first grid with responsive sidebar-to-mobile navigation behaviour and touch-ready controls.
- Completion pass: reviewed the overview and inbox at 1440px and the direct conversation route at 390px; no console errors or horizontal overflow were observed.
- Completion pass: removed the lavender/gradient treatment, rebuilt the map as a restrained greyscale surface, and made the desktop Inbox a fixed three-pane console with direct chat routes.
- Records pass: rebuilt customer, mover and booking profiles around the shared fixtures; the mobile conversation route is a full-height, back-navigable chat surface rather than a list-only card.
- Performance and accessibility measurements are pending a complete feature pass.

## Operations blueprint pass
- Inbox templates now use the supplied approved-template identities, exact numbered parameter format, target audience and message copy; an operator must complete every required parameter before recording an outbound template event.
- Manual quotes use an immutable £7 platform fee and itemise the mover payout separately from the customer price.
- Scout tools remain local operational records until the external execution contract, delivery states and permissions are available; the UI does not claim WhatsApp, Stripe or automated execution occurred.

## Inbox repair pass
- The mover assignment control now follows a two-step safety path: operators choose a verified mover, see their recorded availability, then continue to dispatch rather than assigning directly from chat.
- Desktop keeps the selected conversation in the existing three-pane workspace; phone layouts open the dedicated full-screen conversation route, with its composer and context controls visible.
- The inbox message surface now uses the installed chat primitives, while retaining Cary’s existing visual language and mock-backed operation state.

## Attention queue pass
- Needs Attention is the single operational queue: scheduled reminders are presented in a shareable queue view, while `/reminders` redirects there to preserve existing links.
- Recording a reminder send updates mock operational state only; it does not claim a message was delivered externally.
