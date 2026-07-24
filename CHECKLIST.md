# Day-of checklist — Medical Timeline

Submission deadline: **5:00 PM**. Check off each item as you go. Full
context in [`README.md`](./README.md) and [`CLAUDE.md`](./CLAUDE.md).
Individual context: [`docs/pessoa-a-contexto.md`](./docs/pessoa-a-contexto.md) ·
[`docs/pessoa-b-contexto.md`](./docs/pessoa-b-contexto.md) — paste into
your AI assistant at the start of the day.

## 0. Before coding (both, ~15 min)

- [ ] Teammate accepted the repo invite: https://github.com/Miguel-Sequeira07/swans-medical-timeline
- [ ] Both did a local `git clone`, `cd app && npm install` runs with no errors
- [ ] Gemini API key obtained and set in `app/.env.local` (see `app/.env.local.example`)
- [ ] Hackathon sample Excel (QR "Slides & Excel files") downloaded and saved locally for testing
- [ ] Quick confirmation: the schema in `app/src/types/event.ts` works for both — if it needs to change, tell the other person before touching it

## Findings from validating with real data (5 Excel files in `sample-data/`)

- [x] **Bug fixed:** `Link To Pdf` isn't text containing the URL — it's
  the word "pdf" with a **hyperlink** underneath the cell.
  `parse-excel.ts` now reads the actual hyperlink (`cell.l.Target`),
  not the visible text.
- **Rows with no date genuinely exist** (e.g. "Administrative Record"
  with no `Encounter Date`, 7 cases in the Caldwell file). The parser
  returns `Date(NaN)` for those — the timeline (Person B) has to show
  them without breaking (e.g. an "undated" section), not assume every
  row has a date.
- **Scale varies a lot**: 49 to 820 events per case across the 5 sample
  files. Test the timeline with Garrison (820 rows) for performance/
  readability, not just with small cases.
- 2 of the 5 files (`Middleswarth`, `Rogers`) have real links to PDFs
  that exist in `sample-data/Medical Records/` — good for testing
  "click an event → open source PDF" end to end.

## 1. Floor — blocks everything else, do this first

- [ ] **Person A** — Excel upload in the UI → `parseExcelFile()` → app state
- [ ] **Person A** — tested with the real sample Excel (not just made-up data)
- [ ] **Person B** — `Timeline.tsx` rendering the received event list (can still be visually simple)
- [ ] **Both** — end-to-end flow working: upload → parse → timeline visible, no hardcoding of sample data
- [ ] First Vercel deploy done (even if ugly) — deploy early, iterate in production

## 2. Person A — Data & AI

- [ ] Clear validation/error when the Excel doesn't match the expected format
- [ ] Model + UI to add the **accident date** / manual milestones (not in the Excel)
- [ ] AI Q&A about the case (`askCaseQuestion` already exists in `lib/ai.ts` — wire it to the UI)
- [ ] AI: full treatment summary (`summarizeTreatment` — wire it to the UI)
- [ ] AI: rewrite/edit a summary (manual or AI-assisted)
- [ ] Local persistence — save/load previous timelines (`localStorage`)
- [ ] Calculate approximate cost per case (Gemini tokens × price) — needed for the submission

## 3. Person B — Timeline & UX

- [ ] Real visual timeline (not a plain list): time axis, readable event density
- [ ] Filters: provider, medicine type, date, keyword
- [ ] Grouping: by provider / medicine type / body part
- [ ] Click an event → open `pdfUrl` (the source PDF)
- [ ] Compact view (overview) vs detailed view (walkthrough)
- [ ] "Before/after" the accident view (uses Person A's milestone)
- [ ] Export to PDF
- [ ] Export to PowerPoint
- [ ] Responsive, no complex instructions needed to use it ("ease of use" is an evaluation criterion)

## 4. Continuous integration (both, all day)

- [ ] Small commits, frequent pushes to `master`
- [ ] No long-lived branches — merge as soon as a feature works
- [ ] Redeploy on Vercel at every important milestone
- [ ] Test the app with an Excel **different** from the sample before calling any feature done (golden rule of the challenge)

## 5. Before submitting (5:00 PM)

- [ ] **Deployed** app link, not localhost
- [ ] List of assumptions (e.g. "assumes a Gemini API key")
- [ ] Note on where the data lives (client-side / localStorage is a valid answer)
- [ ] Approximate cost per case processed
- [ ] Short paragraph: what you built and what you're proud of
- [ ] Tested end-to-end with a new Excel, no errors in the browser
- [ ] Link submitted **before 5:00 PM** (the earlier you submit, the earlier you present)
