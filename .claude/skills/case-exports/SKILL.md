---
name: case-exports
description: How the PDF and PowerPoint export (app/src/lib/export-pdf.ts, app/src/lib/export-pptx.ts) are built, and the readability/accessibility rules they follow — read before changing either export or adding a new export format.
---

Reference for the two case-export functions: `exportCaseToPdf` (jsPDF) and
`exportCaseToPptx` (pptxgenjs), both in `app/src/lib/`. Both are plain,
manually-laid-out documents (no design system, no shared component with the
web UI) — the bar for "done" is that the file opens and shows the right
information at a normal reading size, not visual parity with the web view.

## Why the colors aren't the same hex values as the web UI

The web UI's `--ink-muted` etc. tokens are tuned for screen viewing on the
paper-colored background. Exports get read differently — a PDF printed or
viewed at 100%, a slide deck read from across a room on a projector or in a
screen-share — so both export files use their **own**, deliberately darker
palette:

- `export-pdf.ts`: `INK` / `INK_SECONDARY` / `INK_MUTED` constants. Even the
  "muted" tone is picked to hold roughly 6:1+ contrast against the white
  page — body parts, gap markers, and the page footer are still content a
  reader needs, not decoration, so none of them get the lightest gray
  available.
- `export-pptx.ts`: `INK` / `MUTED` / `RUST`, all noticeably darker than
  their web-UI namesakes for the same reason, plus a minimum 12pt body font
  in tables (slides get read from a distance) and alternating row banding
  (`ROW_BANDING_FILL`) so a 9-12 row table stays scannable.

If you touch either palette, keep this reasoning — don't copy the web UI's
`ink-muted`/`accent-*` hex values back in without re-checking contrast.

## Structure

Both exports pull from the same source of truth: `splitByDateValidity` and
(PDF only) `buildMonthGroups` from `lib/timeline.ts` — reuse those instead of
re-deriving "which events are dated" or "which month does this fall in".

- PDF: single continuous document, one section per month (via
  `buildMonthGroups`, so it includes gap markers and milestones inline,
  same order as the on-screen chronological view). Manual pagination via
  `ensureSpace()` — there's no auto-flow text engine, every block explicitly
  checks it'll fit before writing.
- PPTX: title slide → key-dates slide (bulleted, skipped if no milestones) →
  paginated table slides (`ROWS_PER_SLIDE`) of the plain chronological event
  list (no gap/milestone rows — a slide table isn't the place for that
  nuance, milestones already got their own slide). Summaries are truncated
  (`SUMMARY_MAX_CHARS`) — this is intentionally the "compact/overview for a
  slide" reading of the case; the full text lives in the PDF and the app.

## Verifying a change actually works

Neither format can be sanity-checked by "it ran with no error" — a broken
layout still generates a file.

- PDF: download it and read the actual rendered pages (the `Read` tool can
  render PDF pages directly if `poppler`/`pdftoppm` is installed —
  `brew install poppler` if not).
- PPTX: it's an OOXML zip — `unzip -p file.pptx ppt/slides/slideN.xml | grep
  -oE "<a:t>[^<]*</a:t>"` dumps the text runs on a slide, enough to confirm
  real data (not placeholders) landed in the deck, and `grep -oE
  'sz="[0-9]+"'` on the same file confirms font sizes if you're checking a
  readability change.

## Adding a new export format

Follow the same shape: a pure function `exportCaseTo<Format>(medicalCase:
Case): void | Promise<void>` in its own `lib/export-<format>.ts`, reusing
`splitByDateValidity`/`buildMonthGroups` rather than re-deriving date logic,
and a button in `Timeline.tsx`'s header next to the existing two.
