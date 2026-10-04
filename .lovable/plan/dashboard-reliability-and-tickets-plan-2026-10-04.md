# Dashboard reliability and tickets plan

## Scope
Verify every public dashboard workspace, repair the confirmed state/navigation defects, and rebuild Tickets as a practical operator workspace. The product remains mock-backed; no external delivery, payment, or messaging is claimed.

## Confirmed repairs
1. **Booking consistency**
   - Make booking details read the shared operations store rather than static fixtures.
   - Ensure freshly created bookings resolve to their own record and display the latest assignment, money, and status changes.
2. **Correct conversation links**
   - Replace hard-coded customer-to-thread fallbacks with a shared lookup from the live conversation store.
   - Show an honest unavailable state when a record has no conversation, instead of opening another customer’s thread.
3. **Accurate navigation counts**
   - Derive inbox, attention, and ticket counts from shared state so badges update after operator actions.
4. **Route quality pass**
   - Give Payments and the internal component-state route complete page metadata.
   - Remove the redundant Attention queue branch and retain `/reminders` as the working compatibility redirect.

## Tickets rebuild
1. Extend ticket records with category, creation time, owner, and internal notes; seed open, investigating, and resolved examples.
2. Add real local workflows: create a ticket, assign an owner, move it between Open / Investigating / Resolved, reopen it, and add an internal note. Each records an audit event.
3. Rebuild Tickets around an operator queue: live counts, search, status controls, priority filtering, linked booking/customer context, London-relative age, and an expandable ticket history.
4. Keep compact rows on phones with deliberate touch targets and an empty filtered state. Add the live unresolved count to navigation.

## Verification
- Run static checks after the changes.
- Test every dashboard route at desktop and phone sizes, including booking assignment persistence, correct message links, ticket filtering/assignment/status/note flows, and the reminders redirect.
- Check the preview build log and update the roadmap and decisions record with the completed work.

## Technical details
- Use `useOperations()` as the single in-app record source.
- Render timestamps through `src/lib/time.ts` using Europe/London.
- Keep the existing Cary tokens, components, panel patterns, and mock-only disclosure.
