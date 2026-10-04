# Needs Attention rebuild and reminder consolidation

## Goal
Turn **Needs Attention** into the operator’s single, useful action queue. Scheduled reminders will live there instead of having their own workspace.

## What will change
1. **Rebuild the queue around priorities**
   - Add a compact operational summary: overdue items, waiting conversations, mover verification, payment follow-ups, and due reminders.
   - Replace the current single vertical list with clear queue controls for **All**, **Urgent**, **Today**, and **Reminders**.
   - Keep the most time-sensitive work first, with explicit waiting/due time and a linked booking, customer, mover, or conversation wherever one exists.

2. **Make every queue row actionable**
   - Preserve the current direct actions (assign mover, review documents, payment follow-up, resolve).
   - Add a consistent quick-action area per row, including opening the related record and clearing/resolving an item where appropriate.
   - Record queue resolutions and reminder sends in the existing mock audit history.

3. **Move reminders into Needs Attention**
   - Show scheduled and sent reminders under the **Reminders** queue view and in the main queue when due/overdue.
   - Include recipient, booking, London time, delivery status, and an immediate **Record send** action for eligible reminders.
   - Add useful empty states for no urgent work and no scheduled reminders.

4. **Remove the standalone reminder entry point**
   - Remove Reminders from the main navigation so there is one source of operational follow-up.
   - Keep `/reminders` as a compatibility route that redirects to `/attention?view=reminders`, preventing existing links from breaking.
   - Make the selected queue view shareable through the page URL.

5. **Responsive and quality pass**
   - Use a desktop table-like queue with stable columns and compact mobile rows without horizontal overflow.
   - Confirm keyboard-friendly controls, readable status labels beyond colour alone, semantic tokens, London time formatting, and route-specific metadata.
   - Check the page at phone and desktop sizes, including reminder send, queue filtering, direct record navigation, and empty states.

## Technical notes
- Continue using the shared mock operations store; no outbound messages or external queues will be claimed.
- Reminder records already have status, audience, booking reference, and ISO UTC schedule data; display remains in Europe/London through the existing time utility.
- The existing `/reminders` URL will remain valid via redirect rather than a duplicated workspace.
