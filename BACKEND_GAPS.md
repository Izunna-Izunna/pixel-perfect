# Backend gaps

The dashboard foundation runs in mock mode. The API contract does not yet define the following payloads or behaviours required by the product brief.

- **Record detail payloads:** specify complete booking, mover and customer profile payloads (including notes, activity, attention state and linked records) so the UI does not infer missing fields.
- **Audit writes for client actions:** define a durable audit endpoint or explicit guarantee that each mutation emits an audit record, including masked-phone reveals.
- **Notification preferences and active sessions:** define read/write routes for per-user notification settings, haptic/sound preferences and session revocation.
- **Unanswered conversation threshold:** define the threshold returned by settings and an attention reason shape for it.
- **Map fallback state:** `/map/moves` needs an explicit `coordinates_available` flag and optional region bounds to distinguish unavailable geocoding from zero moves.
- **24-hour window template metadata:** templates need parameter schema, locale and approval status so the closed-window composer can render a safe form.
- **Typed confirmation requirements:** mutations should declare confirmation words and whether hold-to-confirm applies to prevent rules drifting between client and server.
- **SSE events:** `/events` needs an event schema, resume token and reconnection contract.
- **Template library API:** define template IDs, Meta approval/category/locale state, exact numbered parameter schemas, and a preview/send response that includes a provider message ID.
- **Tool execution API:** define authenticated operator execution for all Scout tools, including validated input, permission checks, idempotency key, output schema, and durable execution/audit event.
- **Quote lifecycle:** define quote drafts, selected mover, immutable £7 platform fee, itemised customer total, versioning, negotiation, competing-quote state, and booking status transitions.
- **Dispatch lifecycle:** define candidate eligibility/availability, dispatch invite delivery state, accepted/rejected quotes, assignment reason, customer/mover notification results, and reminder scheduling responses.
- **Payments hand-off:** define itemised checkout preparation for mover payout plus Cary fee, checkout URL/session ID, webhook-driven payment state, refund/payout reconciliation, and safe retry semantics.
- **Conversation context:** define linked booking, quote, payment, reminders, attachments, tool history, message timestamps and delivery receipts in a paginated conversation payload.
