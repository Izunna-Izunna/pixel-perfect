# Inbox workflow and responsiveness

## Goal
Make the inbox a reliable operations workspace across desktop and mobile, and give chat operators a clear mover-availability check before dispatching.

## Mover assignment
- Replace the generic chat assignment prompt with a mover picker that lists verified mover records.
- Selecting a mover opens a compact result dialog showing whether they are free for the linked move, including any known issue or availability reason.
- Keep the existing dispatch workspace as the explicit final confirmation step, with the selected mover carried into that flow where the route supports it.
- Use the existing internal availability fixtures only; do not represent this as live mover location or acceptance.

## Inbox rework
- Audit the desktop three-column workspace and mobile list-to-full-screen-thread flow for clipping, fixed-interface overlap, and unusable controls.
- Make every visible inbox control perform its stated action: filters, conversation selection, takeover, attachments, send, quick replies, templates, Scout tools, right-panel close/open actions, and assignment.
- Improve dense layouts with stable widths, truncation, accessible controls, and compact empty states without changing Cary’s visual direction.

## Validation
- Check the inbox at desktop and phone widths, including opening a thread, selecting a mover, seeing both availability states, and exercising each visible control.
- Resolve any current build or runtime errors before completion.

## Technical details
- Update the inbox page and its existing chat integration; preserve the full-page mobile chat route.
- Reuse the shared operations store and existing mover candidate availability fixture so all interactions remain internally consistent.
