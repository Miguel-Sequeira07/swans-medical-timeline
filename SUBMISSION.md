# Submission — Medical Timeline

Final answers, ready to copy into the hackathon's submission form.

## Link

**https://swans-medical-timeline.vercel.app**

## Assumptions your app makes

- Assumes a Gemini API key (`GOOGLE_GENERATIVE_AI_API_KEY`) is configured
  server-side for the AI features (Q&A, treatment summary, rephrase) to
  work; everything else (upload, parsing, timeline, filters, milestones,
  export) works without it.
- Assumes the uploaded Excel matches the documented column format
  (`Encounter Date`, `Primary Provider`, `Facility`, `Body Parts`,
  `Medicine Type`, `Record Type`, `Summary`, `Link To Pdf`); a mismatched
  file gets a clear error, not a guess.
- Assumes `Link To Pdf` is a real cell hyperlink, as in the provided
  samples, not literal URL text.
- Assumes multiple providers in `Primary Provider` are separated by `;`,
  with `,` reserved for the name/credential separator within one provider
  (e.g. "Astrit H. Hajdari, MD").

## Approximate cost to run one case through the app

~$0.01 to ~$0.20 per case, measured against real Gemini usage (not
estimated). Full breakdown in
[`docs/custo-por-caso.md`](./docs/custo-por-caso.md). Our 5 sample cases
ranged from 49 to 820 medical events, and cost scales almost entirely
with case size and number of AI questions asked, not with complexity.

## Where the app sends or stores data

The Excel is parsed entirely in the browser — no file is ever uploaded to
a server. AI features (Q&A, summary, rephrase) send the relevant event
text to Google's Gemini API through our own server-side routes, so the
API key never reaches the browser; that data isn't logged or stored on
our side. Timelines you choose to keep are saved in the browser's
`localStorage` only (up to 5 most recent cases) — never sent to a
database. Clearing browser storage or switching devices loses them, a
deliberate trade-off for a one-day hackathon.

## What we're most proud of

We built an end-to-end medical timeline that turns a case's Excel
chronology into something an attorney can actually use with a jury, a
client, or an adjuster — not just a rendered table. It handles the real
messiness of these exports (PDF links disguised as hyperlink text,
records with no date, provider names with embedded commas, cases from 49
to 820 events), and goes beyond the floor with filters and grouping,
automatic gap-in-treatment and key-event detection (both real arguments
in personal-injury cases, not decoration), a before/after-the-accident
view, compact and detailed reading modes, PDF/PowerPoint export, and an
AI assistant that answers questions and drafts summaries from the real
event data. What we're proudest of: we didn't just build against the
sample files — we deliberately tested against a brand-new synthetic
Excel with edge cases we invented, and it caught two real bugs (a PDF
link hidden in a hyperlink, and provider names shredded by a naive comma
split) that would otherwise have silently corrupted data in front of the
judges.
