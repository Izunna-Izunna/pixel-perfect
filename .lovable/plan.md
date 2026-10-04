# Mover availability from chat

## Goal
Make the chat’s **Assign mover** action let an operator choose a mover, then show a compact availability result before they continue to the existing assignment workspace.

## Changes
- Replace the current generic assignment dialog with a picker listing the current movers, their verification state, and vehicle summary.
- After selection, show a small confirmation dialog with a clear **Available** or **Not available** result, plus the relevant operational reason when known.
- Keep the existing full assignment workspace as the final action, preselected for the chosen mover where supported.
- Use the existing mock mover candidate availability data; do not imply live dispatch availability or contact any mover.

## Technical details
- Update the inbox page state and dialogs only.
- Match mover records to the existing candidate availability fixture by mover ID.
- Preserve the existing desktop workspace and mobile full-screen chat behavior.
