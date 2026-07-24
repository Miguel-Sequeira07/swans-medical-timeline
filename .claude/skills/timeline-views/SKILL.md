---
name: timeline-views
description: How the Medical Timeline's view modes work (chronological/category grouping, before/after, compact/detailed, calendar) and the filter bar — read before adding or changing any view mode, filter, or the density/gap/key-event logic in app/src/lib/timeline.ts or app/src/components/timeline/Timeline.tsx.
---

Architecture reference for `app/src/components/timeline/Timeline.tsx` and its
data layer `app/src/lib/timeline.ts`. Read this before adding a new view mode,
filter, or grouping option — it explains the moving pieces so a change in one
place doesn't silently break another.

## Layering

- `lib/timeline.ts` — pure functions only. No React, no JSX. Takes
  `MedicalEvent[]`/`Milestone[]`, returns plain data (grouped, filtered,
  counted). This is what's testable and what every view mode consumes.
- `Timeline.tsx` — owns all UI state (`filters`, `groupBy`, `density`,
  `viewMode`, `showBeforeAfter`) and renders. It should never contain
  business logic that belongs in `lib/timeline.ts` (filtering rules,
  gap-threshold math, key-event keyword matching) — if you're writing an
  `if` that decides something about the DATA rather than the LAYOUT, it
  probably belongs in the lib file.
- `FilterBar.tsx` — controlled component, no state of its own except the
  "show advanced filters" disclosure. It never touches `MedicalEvent`
  directly, only the `TimelineFilters` shape and callback props.

## The four ways to look at the same case

`viewMode` (`"timeline" | "calendar"`) is the top-level switch. Inside
`"timeline"`, `groupBy` (`"month" | "provider" | "medicineType" |
"bodyPart"`) picks a second dimension, and `showBeforeAfter` can further
split the `"month"` view into two columns around the accident milestone.
`"calendar"` ignores `groupBy`/`showBeforeAfter` entirely — it's its own
layout. `density` (`"detailed" | "compact"`) applies inside every mode
except the calendar's day-detail modal, which is always detailed.

Golden rule for this file: it works with **any** shape of medical case, not
just the mock data (`lib/mock-case.ts`) — never assume specific
providers/medicineTypes/dates exist. See `../../CLAUDE.md` at the repo root.

## Adding a new filter

1. Add the field to `TimelineFilters` in `lib/timeline.ts` (`createEmptyFilters`,
   `hasActiveFilters`, `filterEvents`).
2. If it needs new option values pulled from the data (like providers/
   medicineTypes/bodyParts), add it to `collectFilterOptions`/`FilterOptions`.
3. Add the control to `FilterBar.tsx` — put it inside the "advanced" disclosure
   (`showAdvanced`) unless it's a primary, always-relevant control like search.
   The filter bar was deliberately collapsed behind that disclosure because a
   wall of always-visible pills was a real usability complaint — don't
   reintroduce it by defaulting new filters to always-visible.

## Adding a new grouping mode

Extend `GroupBy` in `lib/timeline.ts`, add a case to `primaryLabel()` inside
`buildCategoryGroups`, and add the option to `GROUP_OPTIONS` in
`FilterBar.tsx`. `buildCategoryGroups` picks the *first* value when a field is
array-typed (e.g. `providers[0]`) specifically so an event lands in exactly
one group — don't fan it out to multiple groups, that reads as "duplicating
events" per the project's own definition of done for filters/grouping.

## Gaps and key events (`lib/timeline.ts`)

- `detectKeyEvent(event)` matches only `recordType`/`medicineType` (not the
  free-text `summary`) against a fixed keyword list — this keeps false
  positives low since those fields are short, controlled-ish values. If you
  add a keyword rule, keep it in `KEY_EVENT_RULES` and keep it scoped to
  those two fields.
- Gap detection (`DEFAULT_GAP_THRESHOLD_DAYS`, inside `buildMonthGroups`)
  only fires between two *events* — milestones don't reset the gap clock,
  since they aren't treatment. If you change the threshold, it's a real
  domain number (insurers use treatment gaps against personal-injury claims),
  not just a display tweak — don't drop it below something defensible.

## Calendar view (`CalendarView`/`DayDetailModal` in `Timeline.tsx`)

Reuses `EventRow`/`MilestoneRow` directly inside the day-detail modal instead
of re-implementing card rendering — if you change how an event card looks,
both the grouped-list view and the calendar modal pick it up for free as
long as you keep going through those two components. The modal has no
"gap" row concept (gaps are a chronological-list idea, meaningless for a
single day) and closes on Escape, backdrop click, or the × button — keep
all three if you touch it. Day cells with no encounters are inert
(`disabled`) on purpose — there's nothing to show, so clicking does nothing.
