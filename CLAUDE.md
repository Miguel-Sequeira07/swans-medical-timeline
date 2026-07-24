# Project context — Medical Timeline (Applied AI Hackathon, Swans)

Read this before touching any code. Full detail in [`README.md`](./README.md)
and [`Hackathon Slides July 2026.pdf`](./Hackathon%20Slides%20July%202026.pdf).
Day-of checklist in [`CHECKLIST.md`](./CHECKLIST.md).

## What we're building

An app that ingests an Excel of medical events (a US personal-injury case)
and produces a **visual, usable timeline** of the treatment, for attorneys
to use with juries, clients, and insurers.

Submission deadline: **today at 5:00 PM**.

## The golden rule (don't break this)

The app must work with **any** Excel in the format described below, not
just the sample file. Judges test at the end with a case they've never
seen. **Never hardcode** sample values (provider names, medicine types,
specific dates, etc.) — only the *shape* of the columns is guaranteed.

## Input Excel format

One row = one medical encounter:

```
Encounter Date | Primary Provider | Facility | Body Parts | Medicine Type | Record Type | Summary | Link To Pdf
```

**Not in the Excel:** the accident date. The app must let the user add it
manually as a milestone.

## Priority order

1. **Floor** (mandatory, before anything else): load the Excel → parse into
   structured events → render a timeline where every event is visible.
2. **Ceiling** (where you win): depth on a few well-executed features,
   not a shallow checklist. Full list in `README.md`.

## Shared schema — don't change without telling the rest of the team

`app/src/types/event.ts` defines `MedicalEvent`, `Milestone`, `Case`. It's
the boundary between Person A's work (data/AI) and Person B's
(timeline/UX). Read that file before writing any code that touches data.

## Stack

Next.js + React + TypeScript (`app/`), Tailwind CSS, `xlsx` for parsing,
`@google/genai` (Gemini, model `gemini-3.6-flash` — **not** the
deprecated `@google/generative-ai` package, and not `gemini-2.0-flash`,
retired on Jun 1 2026) for AI, `jspdf`/`pptxgenjs` for export,
`localStorage` for client-side persistence. Deployed on Vercel.

## Language: everything is in English

Real users are US attorneys/juries, and the hackathon judges use the app
directly — confirmed by testing with a real API key that a Portuguese
prompt makes Gemini answer in Portuguese, which would be unusable. Rule:
**UI, error messages, code comments, commits, and all project
documentation (this file, README, CHECKLIST, docs/) are in English,
always.** There is no internal-only exception — everything is English.

## UI patterns worth knowing

- **AI assistant is a floating widget, not inline content.** `CaseAssistant.tsx`
  renders a fixed circular button (bottom-right) that toggles a small chat
  panel, both `position: fixed`. It used to be a block at the bottom of
  the page; that pushed content around and got buried under a long
  timeline. Follow this pattern for any other persistent/global UI —
  don't add more inline blocks competing with the timeline for space.
- **Never nest interactive elements** (e.g. a `<button>` inside an `<a>`).
  It's invalid HTML, React logs a `validateDOMNesting` warning for it, and
  it already caused a real bug twice in `Timeline.tsx`'s `EventCard` (PDF
  link wrapping the whole card, including edit/save buttons). If a card
  needs both a link and buttons, only wrap the specific link text/element
  in `<a>`, not the whole card.

## Who does what

- **Person A — Data & AI**: detailed context in [`docs/pessoa-a-contexto.md`](./docs/pessoa-a-contexto.md)
- **Person B — Timeline & UX**: detailed context in [`docs/pessoa-b-contexto.md`](./docs/pessoa-b-contexto.md)

## Claude Code skills

`.claude/skills/timeline-views/` and `.claude/skills/case-exports/` document
the timeline/filters/calendar architecture and the PDF/PPTX export pipeline
in more depth than fits here — Claude Code picks these up automatically;
read them yourself before making a non-trivial change in either area.

## Working conventions

- Small, frequent commits, push straight to `master` (no long-lived
  branches — no time for that today).
- Before calling a feature done, test it with an Excel different from
  the sample.
- Deploy early on Vercel, iterate in production.
