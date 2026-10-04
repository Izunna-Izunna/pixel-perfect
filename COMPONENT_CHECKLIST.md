# Component Checklist

This inventory follows the dedicated-flow addendum. Each item is verified through the Completion Gate before status is changed to Done.

| Group | Components | Desktop / mobile behaviour | Required states | Evidence |
| --- | --- | --- | --- | --- |
| Dialogs and sheets | Standard confirmation, money confirmation, takeover, resume Scout, phone reveal, idle/session, kill switch | Dialog on desktop; full-screen sheet or bottom sheet on mobile | idle, loading, validation, error, success, disabled | Pending |
| Privacy and people | Anonymise, export, reset, block, suspend, reject, document request, notes, mention | Dialog/sheet with explicit consequences | permission denied, audit success, failure | Pending |
| Search and preferences | Saved views, columns, filters, range, invitations, roles, shortcuts, palette, global search | Popover/dialog; full-screen picker on phone | empty, query, selected, error | Pending |
| Media and context | Template picker, attachments, voice player, document viewer, image gallery, context panel, entity preview | Modal desktop; full-screen mobile | loading, unavailable, error, ready | Pending |
| Form inputs | Text, UK phone, postcode, money, London date/time, select, combobox, multiselect, vehicle list, upload, textarea, toggle, segment, stepper | Responsive field rows; single-column phone | valid, invalid, disabled, loading | Pending |
| Feedback | Toast, banners, empty, skeleton, error retry/copy, offline, progress, tooltip, popover, badges, avatars, chips | Inline desktop; sticky/mobile-safe alternatives | all data states | Pending |
| Data presentation | Table/mobile cards, stats strip, timeline, notes, key-value, chart kit, map, moves timeline | Table desktop; cards/scrollers phone | loading, empty, partial, error | Pending |
