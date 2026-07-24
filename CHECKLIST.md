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

- [x] **Person A** — Excel upload in the UI → `parseExcelFile()` → app state
- [x] **Person A** — tested with the 5 real sample Excel files (not just made-up data)
- [x] **Person B** — `Timeline.tsx` rendering the received event list (real visual timeline, not a plain list)
- [x] **Both** — end-to-end flow working: upload → parse → timeline visible, no hardcoding of sample data
- [x] First Vercel deploy done — live at https://swans-medical-timeline.vercel.app

## 2. Person A — Data & AI

- [x] Clear validation/error when the Excel doesn't match the expected format
- [x] Model + UI to add the **accident date** / manual milestones (not in the Excel)
- [x] AI Q&A about the case (`askCaseQuestion` in `lib/ai.ts`, wired via `/api/case-qa` and `CaseAssistant.tsx`)
- [x] AI: full treatment summary (`summarizeTreatment`, wired via `/api/case-summary`)
- [x] AI: `rephraseSummary` wired to a per-event "Rephrase in plain English" button inside `Timeline.tsx`'s `EventCard`
- [x] Local persistence — save/load previous timelines (`localStorage`, `useSyncExternalStore`)
- [x] Approximate cost per case, measured with real data — [`docs/custo-por-caso.md`](./docs/custo-por-caso.md)

## 3. Person B — Timeline & UX

- [x] Real visual timeline (not a plain list): time axis, readable event density
- [x] Filters: provider, medicine type, date, keyword
- [x] Grouping: by provider / medicine type / body part
- [x] Click an event → open `pdfUrl` (the source PDF)
- [ ] Compact view (overview) vs detailed view (walkthrough)
- [ ] "Before/after" the accident view (uses Person A's milestone)
- [ ] Export to PDF
- [ ] Export to PowerPoint
- [x] Responsive, no complex instructions needed to use it ("ease of use" is an evaluation criterion)

## 4. Continuous integration (both, all day)

- [x] GitHub repo connected to Vercel (Root Directory = `app`), pushes auto-deploy
- [ ] Small commits, frequent pushes to `master`
- [ ] No long-lived branches — merge as soon as a feature works
- [ ] Test the app with an Excel **different** from the sample before calling any feature done (golden rule of the challenge)

**Vercel gotcha:** it dedupes deployments by commit SHA. If you push the same
commit to two branches (e.g. merge a feature branch into `master` as a
fast-forward and push both), only the branch whose push arrives first gets
built — the other doesn't trigger a fresh deploy, so production can go stale
silently. After merging into `master`, don't assume it auto-deployed —
confirm with `vercel ls swans-medical-timeline` that the newest "Ready" row
is tagged `Production` with the right age, and if not, force one from the
repo root: `vercel deploy --prod --force --yes`.

## 5. Before submitting (5:00 PM)

- [x] **Deployed** app link, not localhost — https://swans-medical-timeline.vercel.app
- [ ] List of assumptions (e.g. "assumes a Gemini API key")
- [ ] Note on where the data lives (client-side / localStorage is a valid answer)
- [x] Approximate cost per case processed — real numbers measured in
      [`docs/custo-por-caso.md`](./docs/custo-por-caso.md) (~$0.05 to ~$1.00
      per case, depending on size)
- [ ] Short paragraph: what you built and what you're proud of
- [ ] Tested end-to-end with a new Excel, no errors in the browser
- [ ] Link submitted **before 5:00 PM** (the earlier you submit, the earlier you present)
