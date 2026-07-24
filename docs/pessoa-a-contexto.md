# Context — Person A: Data & AI

Paste this into your AI assistant (Claude Code, Codex, etc.) at the
start of the day, or ask it to read this file. General project context
in [`../CLAUDE.md`](../CLAUDE.md) and [`../README.md`](../README.md) —
read those first if you haven't.

## Status (updated 24 Jul, afternoon)

The Person A backlog below is done — floor, milestones, AI (Q&A/summary/
rephrase), persistence, cost estimate. Latest UI change: the AI assistant
(`CaseAssistant.tsx`) is no longer an inline block at the bottom of the
page — it's a **floating chat widget**: a fixed circular button
(bottom-right, 💬/✕ icon) that toggles a small chat panel above it. Both
use `position: fixed`, so it stays reachable while scrolling a long
timeline (Garrison: 820 events) without pushing the timeline content
around or competing with it for space. `AssistantPanel` inside the same
file has the actual Q&A/summary logic, unchanged from before — only the
outer shell changed.

## Your slice of the product

Everything that gets data into the system, and everything that uses AI.
If this breaks, Person B has nothing to show on the timeline — so the
**floor is your absolute priority** before any AI feature.

## Files you own

- `app/src/lib/parse-excel.ts` — Excel → `MedicalEvent[]` (an initial
  parser already exists; validate/harden it)
- `app/src/lib/ai.ts` — Gemini integration (`askCaseQuestion`,
  `summarizeTreatment` already exist as stubs, need testing and wiring
  to the UI)
- `app/src/types/event.ts` — shared schema (don't change it alone, it's
  the boundary with Person B — tell them before altering it)
- Upload components, the milestone/accident-date form, and any AI panel
  (Q&A, summary, rephrase) in the UI

## Recommended work order

1. **Floor**: a file-upload component → calls `parseExcelFile()` →
   stores the result in app state so Person B can consume it
   (`Case.events`). Test with the real hackathon sample Excel (the
   "Slides & Excel files" QR code in the slides), not just made-up data.
2. Validation: what happens if the Excel doesn't have the right
   columns, has empty rows, dates in different formats? Clear error for
   the user, never a silent crash.
3. Accident date / manual milestones: not in the Excel. Build the model
   (`Milestone` already exists in `event.ts`) and a simple UI to add
   them. Person B will use this for the before/after view.
4. Gemini: get an API key at https://aistudio.google.com/apikey, put it
   in `app/.env.local` (`GOOGLE_GENERATIVE_AI_API_KEY=...`, never
   commit it). Test `askCaseQuestion` and `summarizeTreatment` with real
   data.
5. Wire the AI functions to the UI: a free-text question field (Q&A), a
   "generate treatment summary" button, and a way to rewrite a summary
   (manual or AI-assisted) — decide with Person B where this lives in
   the interface.
6. Local persistence: save/load previous cases via `localStorage`
   (client-side is a valid answer for the submission, document that).
7. Approximate cost per case: count typical Gemini tokens/calls per case
   and estimate cost — this is a required item for the final submission.

## Rules you can't forget

- **Never hardcode** values from the sample Excel (names, dates,
  providers). The app is tested at the end with a different Excel.
- Medical data is sensitive — clearly document where it's stored (it's
  fine to answer "client-side, lost on refresh" if that's the case;
  that's a perfectly valid answer, it just needs to be documented).
- If you change `event.ts`, tell Person B immediately — her timeline
  component depends directly on that schema.

## Definition of "done" for each piece

- Upload + parse: works with the sample Excel AND with a manually
  modified Excel (fewer rows, same column order but different values).
- AI: relevant, factual answers, without inventing dates that aren't in
  the data (check this manually before calling it done).
- Milestone: the accident date survives a reload if persistence is
  wired up; otherwise, it's clear in the UI that it's session-only.
