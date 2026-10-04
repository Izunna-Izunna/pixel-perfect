# Cary records, chat and payments completion plan

## Goal
Make Cary feel like a working operations product: complete customer and mover records, reliable chat on phones, faster navigation, and usable payment-release/refund actions.

## What will change
1. **Rebuild customer records**
   - Create individual customer pages linked from every list and mention.
   - Show a clear header, masked contact details, flags, key totals, current and past moves, quotes, payments, address/preferences, notes, activity and conversations.
   - Give each relevant action working feedback and permission-aware controls.

2. **Rebuild mover records**
   - Replace the current card-only mover experience with a full mover page.
   - Include licence and insurance documents, verification history, vehicles, availability, past and upcoming jobs, payouts, reviews, issues, notes, activity and conversations.
   - Build working verification controls with clear outcomes and an audit entry in mock mode.

3. **Complete booking links and operational actions**
   - Link booking, customer and mover mentions consistently to their records.
   - Finish the booking detail page actions required to support reassignment, rescheduling, cancellation and messaging.
   - Keep sensitive contact information masked until the move is live.

4. **Make payments operational**
   - Add payment detail actions to release a held mover payout and refund a customer.
   - Retain the existing typed-word and press-and-hold protection for money actions, show the exact amount and consequence, then update mock status and activity feedback.
   - Clearly label mock payment/Stripe results until the separate backend is connected.

5. **Fix chat, especially on mobile**
   - Use one conversation surface across Inbox and record pages.
   - On phones, tapping a person opens a dedicated full-screen thread with a visible back control, header details, messages and composer—rather than leaving the user in the list.
   - Preserve the 24-hour message-window rule, template flow and takeover state.

6. **Make controls genuinely usable**
   - Replace non-functional visible controls on the rebuilt records, payments, booking and chat screens with working navigation, inputs, dialogs, state changes, feedback or an intentionally disabled explanation.
   - Add a focused click-through check at desktop and phone widths to catch dead controls.

7. **Improve perceived page-change speed**
   - Profile the current route-change path and remove avoidable blocking work from the main screens.
   - Add appropriate loading states and defer heavy record/chart/map content so navigation gives immediate feedback without showing stale or blank content.

8. **Validate the result**
   - Add focused tests for London-time display and the money/permission rules touched here.
   - Check each changed screen at phone and desktop sizes, in both themes, with no horizontal overflow or console errors.
   - Update the delivery checklist, decision log and backend gaps only where these flows expose genuine missing contract data.

## Technical notes
- Keep the existing frontend-only mock mode and Europe/London time utilities.
- Use the established neutral Cary tokens and shared UI elements; do not add a new visual style.
- Keep real money movement, Stripe confirmation and persistent data as clearly marked backend integration gaps; mock mode will demonstrate the full interface and state transitions.
