# Medical Timeline — Applied AI Hackathon (Swans, Jul 24 2026)

App that ingests an Excel of medical events (personal-injury cases) and
produces a **visual, usable timeline** of the client's treatment, for
attorneys to use with juries, clients, and insurers.

Full challenge context: [`Hackathon Slides July 2026.pdf`](./Hackathon%20Slides%20July%202026.pdf).

- **Submission deadline:** today, **5:00 PM**
- **Top 5 present:** 6:00 PM (order = submission order)
- **Winners:** ~7:00 PM

## The challenge in one sentence

Input: an Excel (one row = one medical encounter, columns: `Encounter Date`,
`Primary Provider`, `Facility`, `Body Parts`, `Medicine Type`, `Record Type`,
`Summary`, `Link To Pdf`).

Output: a visual timeline of the treatment.

**Golden rule:** the app must work with **any** Excel in this format —
judges test with a case they've never seen. No hardcoding against the
sample data.

**Not** in the Excel: the accident date. The app should let the user add
it manually as a milestone.

## Floor (mandatory minimum)

1. Load the provided Excel
2. Parse into structured events
3. Render a clear timeline where every event is visible

This must be done and robust **before** any extra feature.

## Ceiling (where you win) — feature backlog

In order of expected value (see evaluation criteria below):

- [ ] Mark accident date / manual milestones
- [ ] Filter and search (provider, medicine type, date, keyword)
- [ ] Group events (by provider, medicine type, body part)
- [ ] Click an event → open the source PDF (`Link To Pdf`)
- [ ] Compact view (slide overview) + detailed view (walkthrough)
- [ ] "Before/after" the accident view
- [ ] Automatic/manual flagging of key dates (surgery, MRI, discharge)
- [ ] AI: Q&A about the case ("when was the first MRI?", "how many PT sessions?")
- [ ] AI: generate a medical summary of the whole treatment
- [ ] AI: rewrite/edit a summary (manual or AI-assisted)
- [ ] Export to PDF and PowerPoint
- [ ] Save/access previous timelines (local persistence)

You don't need to do everything — the evaluation criteria reward
**depth** over a shallow checklist. Pick fewer features and do them well.

## Stack

- **Next.js + React + TypeScript** (`app/`), Tailwind CSS
- **Gemini API** (`@google/genai`, model `gemini-3.6-flash`) for AI features
- Excel parsing: `xlsx` (SheetJS), client-side
- Export: `jspdf` (PDF) / `pptxgenjs` (PowerPoint)
- Persistence: `localStorage` (client-side, simple and valid for the
  challenge — document this in the submission)
- Deploy: Vercel

## Structure

```
app/                     ← Next.js project
  src/
    types/event.ts       ← shared schema (source of truth for the data)
    lib/parse-excel.ts   ← Excel → MedicalEvent[]
    lib/ai.ts            ← Gemini integration
    components/timeline/ ← main timeline component
    app/                 ← routes / pages
```

## Work split (2 people)

Split by **feature domain** (not pure frontend/backend), so each person
can demo a complete, working vertical slice at any point in the day —
important because the submission is "whatever is ready at 5:00 PM".

### Phase 0 — together (~20 min)
Align the schema in `app/src/types/event.ts` (already created as a
starting point) and the sample Excel format. Once agreed, don't touch
the schema again without telling the other person.

Detailed context for each person, ready to paste into an AI assistant:
[`docs/pessoa-a-contexto.md`](./docs/pessoa-a-contexto.md) and
[`docs/pessoa-b-contexto.md`](./docs/pessoa-b-contexto.md).

### Person A — Data & AI
- Excel upload + parsing (`lib/parse-excel.ts`), validation, handling
  files outside the expected format
- Model and UI to add the accident date / manual milestones
- Gemini integration (`lib/ai.ts`): Q&A, treatment summary, summary
  rephrasing
- Local persistence (save/load previous timelines)
- Approximate cost calculation per case (for the submission)

### Person B — Timeline & UX
- Timeline component (the central deliverable — floor priority #1)
- Filters, search, grouping
- Compact vs detailed view, before/after view
- Click an event → open source PDF
- PDF / PowerPoint export
- Visual polish, responsiveness, "keeper test"

### Continuous integration
Small, frequent commits to `main` (or short branches like
`feat/timeline`, `feat/ai-qa`), merge as soon as something works — no
time for long-lived branches today.

## Submission checklist (5:00 PM)

- [ ] Deployed app link (not localhost) — Vercel/Netlify
- [ ] List of assumptions (e.g. "assumes a Gemini API key")
- [ ] Note on where the data lives (client-side / localStorage is valid)
- [ ] Approximate cost per case processed
- [ ] Short paragraph: what you built and what you're proud of
- [ ] Tested with an Excel different from the sample before submitting
      (golden rule)

## Project status (update throughout the day)

**Already done (Person A — floor + AI + persistence):**
- Repo on GitHub: https://github.com/Miguel-Sequeira07/swans-medical-timeline (public)
- Next.js + TypeScript + Tailwind scaffold, `npx tsc --noEmit` and
  `npm run build` clean
- Dependencies: `xlsx`, `@google/genai` (not `@google/generative-ai`,
  deprecated), `jspdf`, `pptxgenjs`
- Shared schema in `src/types/event.ts` (`MedicalEvent`, `Milestone`, `Case`)
- `src/lib/parse-excel.ts` — Excel → `MedicalEvent[]` parser, validated
  against the 5 real Excel files in `sample-data/` (49-820 rows each),
  including the `Link To Pdf` hyperlink bug (see `CHECKLIST.md`, section
  "Findings from validating with real data")
- `src/components/upload/ExcelUploader.tsx` + `src/app/page.tsx` —
  upload → parse → app state (the full floor, end to end)
- `src/components/milestones/MilestoneForm.tsx` — manual accident-date
  milestone
- `src/lib/ai.ts` + routes `src/app/api/{case-qa,case-summary,rephrase-summary}` +
  `src/components/ai/CaseAssistant.tsx` — Q&A and treatment summary with
  Gemini (`gemini-3.6-flash`, `thinkingLevel: minimal`), **tested with a
  real key, answers in English**
- `src/lib/storage.ts` + `src/hooks/use-cases.ts` — local persistence
  (up to 5 cases), previous cases listed on the upload screen
- Entire UI in English (real users are US attorneys/juries — see `CLAUDE.md`)
- `src/components/timeline/Timeline.tsx` — minimal list-based timeline
  (Person B's starting point, not the final visual floor)

**Up next (suggested order):**
1. Person B: build the real timeline (visual, not a plain list) from
   `Timeline.tsx` — it already receives real data via `page.tsx`,
   including cases with rows that have no date (see findings)
2. Remaining "ceiling" features (see backlog above), pick a few and do
   them well
3. Deploy on Vercel as soon as there's something to show (deploy early,
   iterate in production) — remember to set `GOOGLE_GENERATIVE_AI_API_KEY`
   in Vercel's env vars, not just locally
4. Test in a real browser (real upload, milestone, AI) — so far only
   tested via HTTP/curl, never clicked through a real UI

## Local setup

```bash
cd app
npm install
npm run dev
```

Required environment variable (`app/.env.local`, don't commit):

```
GOOGLE_GENERATIVE_AI_API_KEY=...
```
