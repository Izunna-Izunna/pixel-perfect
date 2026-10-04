# Cary chat console improvement plan

## Goal
Turn the existing inbox into a reliable, WhatsApp-native human-takeover workspace while keeping mock-mode behaviour honest until the separate backend is connected.

## What will change
1. **Conversation list**
   - Add customer, mover, needs-action, and takeover filters.
   - Show role, unread state, active-move/takeover status, latest delivery state, and accurate London-relative time.
   - Make search cover contact name, masked phone reference, and linked booking reference.

2. **Thread experience**
   - Use clear WhatsApp-like incoming, Scout, operator, system, attachment, and delivery-state messages.
   - Add live-looking Scout typing and DST-safe London timestamps/relative hints.
   - Keep the 24-hour messaging countdown visible and enforce the approved-template path after closure.
   - Retain the upgraded multi-line composer, keyboard send behaviour, quick replies, attachments, and clear unavailable states for backend-only actions.

3. **Human takeover**
   - Make the Scout-active and operator-takeover states prominent in the header and operational chrome.
   - Keep notes with the takeover event, show who owns the thread, and make resume behavior auditable in mock data.

4. **Operational context and actions**
   - Replace the sparse context area with linked contact, booking, route, timing, payment, and mover-verification details.
   - Add direct actions for opening the booking, assigning a mover, sending a payment-link request, redispatching, and escalating.
   - Route every supported action to its existing full page; label unavailable connected-service actions clearly rather than faking completion.
   - Make the same context and actions available on phones without obscuring the thread or composer.

5. **Safety and responsive quality**
   - Keep phone numbers masked until an audited reveal interaction.
   - Preserve mobile full-screen thread navigation, sticky composer, and touch-reachable controls.
   - Verify the chat at phone and desktop widths, including sending, template sending, takeover, record links, and unavailable-action feedback.

## Technical details
- Continue using the existing frontend mock store and `Europe/London` time utilities; no external messaging, payment, or AI request will be simulated as real.
- Extend the existing chat and inbox route components rather than introducing a separate chat product.
- Follow the uploaded prompt for visual and workflow direction, but defer backend-only pieces (real-time transport, Meta delivery, Stripe link generation, voice transcription, and tool execution) to explicit unavailable states and the backend-gap documentation.