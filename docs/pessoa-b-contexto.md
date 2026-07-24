# Context — Person B: Timeline & UX

Paste this into your AI assistant (Claude Code, Codex, etc.) at the
start of the day, or ask it to read this file. General project context
in [`../CLAUDE.md`](../CLAUDE.md) and [`../README.md`](../README.md) —
read those first if you haven't.

## Your slice of the product

Everything visual and interactive. This is literally the reason the
challenge exists — "that spreadsheet, made into something you can
feel." It's what the judges see in the first 30 seconds, and it's the
highest-weighted evaluation criterion.

## Files you own

- `app/src/components/timeline/Timeline.tsx` — the central component
  (a minimal list version already exists; the real "floor" is still to
  be built)
- Any filter, grouping, compact/detailed view, or export component
- `app/src/types/event.ts` — shared schema (don't change it alone, it's
  the boundary with Person A — tell them before altering it)

## Recommended work order

1. **Floor**: while Person A doesn't have the real parser wired to the
   UI, work with mock data that follows `MedicalEvent[]` exactly (see
   `event.ts`) — this way neither of you blocks the other. Swap the
   mocks for real data as soon as the real parser is ready.
2. The timeline has to answer "what happened to this client?" within 30
   seconds — that's literally evaluation criterion #1 ("first
   impression"). Think about visual density: 80 events have to fit
   without turning into a wall of text.
3. After the floor: filters and grouping (provider, medicine type, body
   part, date, keyword) — the evaluation criteria reward depth, not
   quantity, so choose carefully what you build first.
4. Click an event → open `event.pdfUrl` (new tab).
5. Compact view (for a slide) vs detailed view (for walking a client
   through the case) — two reading modes for the same data.
6. "Before/after" the accident view — depends on the `Milestone` Person
   A is building (type `"accident"`). Coordinate with them on how the
   milestone reaches the timeline.
7. PDF / PowerPoint export — only after the timeline itself is solid.
8. Responsiveness and polish — "ease of use" and the "keeper test" are
   explicit evaluation criteria: no complex instructions, no friction.

## Language

Everything is in **English** — code, comments, docs, and everything the
user sees (labels, buttons, messages). Real users are US
attorneys/juries and the hackathon judges use the app directly. See
[`../CLAUDE.md`](../CLAUDE.md).

## Rules you can't forget

- **Never hardcode** assumptions about the sample data (number of
  events, specific names, specific dates). The timeline has to handle
  an Excel with 5 events or with 200.
- Handle missing/malformed dates carefully — don't let the timeline
  break silently if an event has an invalid date.
- The judges use the app with their own hands — no flows that only work
  "if you know the trick."

## Definition of "done" for each piece

- Timeline: readable with few events (5) and with many (80+), no
  infinite scroll without orientation, no overlapping text.
- Filters/grouping: don't lose events or duplicate them when combining
  filters.
- Export: the generated file opens and shows the right information
  (test by opening it, not just "it ran with no error").
