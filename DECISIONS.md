# Cary Mission Control decisions

## Foundation assumptions
- The current build defaults to mock data until `VITE_API_MODE=live` is connected to the documented admin API.
- The app treats all operational timestamps as UTC inputs and formats them through `Europe/London`.
- The initial role is an operator in mock mode; high-risk controls remain deliberately unavailable in the foundation.

## Design rationale
- The workspace uses a calm, high-density instrument-panel layout: a neutral canvas and flat surfaces, with green limited to live and positive outcomes, amber for waiting states, and red for failures or risk.
- The refreshed palette removes display-serif, lavender and all decorative gradients, keeping visual hierarchy in typography, spacing and hairlines rather than ornamental colour.
- The overview prioritises the next action above reporting: Needs Attention stays adjacent to live operations and today’s schedule.
- The map is a styled regional operations surface rather than a generic map control until production coordinates are available.

## QA log
- Initial foundation: desktop-first grid with responsive sidebar-to-mobile navigation behaviour and touch-ready controls.
- Performance and accessibility measurements are pending a complete feature pass.
