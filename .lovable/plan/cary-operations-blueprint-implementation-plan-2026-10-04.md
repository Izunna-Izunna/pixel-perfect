# Cary operations blueprint implementation plan

## Goal
Bring the Inbox, quoting, dispatch, approved WhatsApp templates, and Scout operations controls in line with the supplied Cary Operations & Scout Engine blueprint—without changing Cary’s established cockpit design or its desktop-in-place / mobile-full-screen conversation model.

## 1. Canonical operational data and audit trail
- Expand the shared operations store with typed records for quote drafts/submissions, template metadata and parameters, dispatch invitations, payment-link state, scheduled reminders, tool executions, and conversation events.
- Keep all visible changes consistent across Inbox, bookings, payments, reminders, notifications, profiles, and the audit log.
- Record every operator action with actor, target, timestamp, before/after summary, and the generated customer/mover message preview.
- Add the blueprint-defined contract gaps to `BACKEND_GAPS.md` rather than inventing unseen service behaviour.

## 2. Rebuild manual quote creation around the Cary price model
- Replace the current heuristic calculator with an operator quote workflow available from a booking and the relevant conversation.
- Capture the blueprint fields: linked booking/customer, pickup and drop-off postcodes, van size, loading assistance, access/stairs/lift, item summary, mover payout, and operator notes.
- Lock the Cary platform fee at £7.00; calculate and display the customer total as `mover payout + £7.00`, with an itemised price review.
- Show the exact customer-facing quote-ready/booking link preview, require a selected mover or clearly mark the quote as unassigned, and record the resulting quote against its booking.
- Let operators submit a quote, begin a payment-link hand-off, or open the correct approved template flow. Keep payment delivery visibly pending until an external payment service is connected.

## 3. Make template operations complete and safe
- Replace the abbreviated template list with the full supplied library: job invite, mover assignment, quote-ready alert, booking confirmation, mover welcome, admin escalation, customer/mover reminders, payout notification, and emergency replacement.
- Store target audience, category, approval, language, body copy, parameter definitions, validation, and booking/conversation eligibility for every template.
- Make the template drawer prefill known booking fields while allowing operators to review or enter required parameters before sending; block dispatch while required values are incomplete.
- Preserve the 24-hour rule: freeform only in an open customer-care window; when closed, route directly to the approved-template drawer and explain why.
- Render WhatsApp-native previews with named parameter values, attachment/message events, status ticks, and a recorded outbound event after send.

## 4. Turn the right-side Scout tools into real in-app flows
- Keep Scout tools and quick replies in the desktop right context panel, as requested; do not restore the left action palette.
- Replace the four generic shortcuts with a grouped, searchable execution surface covering all 18 blueprint tools: job create/update, customer lookup, calculator, London date resolver, quote submission, negotiation, payment preparation, cancel/reschedule, ticket/review, mover onboarding, location request, WhatsApp buttons/list, and picker notification.
- Each tool opens an appropriate prefilled flow or modal, validates its documented input shape, presents a precise outcome preview, and writes an event/audit record on completion.
- Treat tool effects that require external delivery, Stripe, WhatsApp, or automation queues as prepared/recorded states—not falsely delivered—until the connected service defines and supports them.
- Surface tool history in the thread/context panel so an operator can see what Scout or another operator initiated.

## 5. Complete mover assignment and booking operations
- Evolve assignment from a candidate selection page into a dispatch workflow: candidate fit, availability, mover payout, customer total, dispatch note, booking status transition, competing-quote outcome, customer/mover notification previews, and reminder schedule (10h, 5h, 1h, 30m).
- Add manual dispatch invitations for eligible movers using the full `job_invite` template, with reply/quote status visible against each candidate.
- Make reassignment and emergency replacement clear: preserve reason, release the previous mover, send the correct customer update, and keep the booking timeline coherent.
- Link every action back to the booking, mover, customer, payment, and message thread it affects.

## 6. Conversation experience and verification
- Keep desktop selection inside the existing three-pane Inbox; phones continue to open the dedicated full-screen thread with a visible composer and back navigation.
- Upgrade the context panel to show linked booking, customer/mover history, active quote/payment state, reminders, attachments, and recent tools without duplicating the conversation.
- Use London-formatted timestamps and existing privacy safeguards throughout message/template/assignment previews.
- Verify the essential flows at phone and desktop sizes: open conversation, freeform send, closed-window template send, quick reply, Scout tool execution, quote creation, mover invitation/assignment, payment-link preparation, and action/audit updates.

## Technical details
- Preserve the shared operations store as the in-app source of truth until the external project is connected and its schema is inspected.
- Keep the £7 fee immutable in the UI and calculate all amounts with the existing money formatter.
- Route high-impact money, cancellation, and destructive actions through their existing typed confirmation patterns; use dedicated routes where an action changes money, assignment, or outbound messaging.
- Update `DECISIONS.md`, `BACKEND_GAPS.md`, and the roadmap with only verified implementation decisions and unresolved external-service requirements.
