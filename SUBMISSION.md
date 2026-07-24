# Submission — Medical Timeline

Rascunho pronto a copiar/colar para o formulário de submissão do hackathon.
Revê e ajusta antes de submeter — em particular o parágrafo final, que deve
refletir o que **vocês** sentem que construíram, não só o que eu escrevi.

## Link

**https://swans-medical-timeline.vercel.app**

## Assumptions

- Assumes a Gemini API key (`GOOGLE_GENERATIVE_AI_API_KEY`) is configured
  server-side for the AI features (Q&A, treatment summary, rephrase) to
  work. Without it, everything else — upload, parsing, the timeline,
  filters, milestones — still works normally; only the AI panel shows an
  error.
- Assumes the uploaded Excel matches the documented column format
  (`Encounter Date`, `Primary Provider`, `Facility`, `Body Parts`,
  `Medicine Type`, `Record Type`, `Summary`, `Link To Pdf`). A file that
  doesn't match gets a clear error naming the missing columns, not a
  guess.
- Assumes `Link To Pdf` is a real cell hyperlink (as in the provided
  samples), not literal URL text — we read the hyperlink target and fall
  back to the visible cell text if there's no hyperlink.
- Assumes multiple providers in `Primary Provider` are separated by `;`,
  with `,` reserved for the name/credential separator within one provider
  (e.g. "Astrit H. Hajdari, MD"). Confirmed against all 5 sample files:
  100% use `;` between people, 0% use a bare comma.

## Where data goes

- The Excel is parsed **entirely in the browser** — no file is ever
  uploaded to a server.
- The AI features (Q&A, summary, rephrase) send the relevant event text
  to Google's Gemini API, proxied through our own server-side API routes
  so the API key never reaches the browser. That request data isn't
  logged or stored on our side.
- Timelines you choose to keep are saved in the browser's `localStorage`
  only (up to 5 most recent cases) — never sent to a database. Clearing
  browser storage or switching devices loses them. This is a deliberate,
  documented trade-off for the scope of a one-day hackathon.

## Approximate cost to run one case

Measured against real Gemini usage (not estimated), full breakdown in
[`docs/custo-por-caso.md`](./docs/custo-por-caso.md):

**Roughly $0.05 to $1.00 per case**, depending on size — our 5 sample
cases ranged from 49 to 820 medical events, and cost scales almost
entirely with case size (input tokens), not with what's asked. One
caveat we're disclosing rather than hiding: each AI question currently
resends the full case context (no caching), so cost grows linearly with
the number of questions asked per session — the first optimization we'd
make with more time.

## What we built, and what we're proud of

*(rascunho — ajustem ao vosso gosto antes de submeter)*

We built an end-to-end medical timeline tool that turns a case's Excel
chronology into something an attorney can actually use in front of a
jury or client — not just a rendered table. It handles the real
messiness of these exports: PDF links disguised as plain hyperlink text,
records with no encounter date, provider names with embedded commas,
cases ranging from 49 to 820 events. On top of the core timeline we
added filtering and grouping (by provider, medicine type, body part,
date, keyword), a way to mark the accident date the Excel doesn't
contain, an AI assistant that answers factual questions and drafts a
jury-ready summary from the real event data, a plain-English rephrase
button for any individual record, and local persistence so an attorney
can come back to a case later.

What we're proudest of: we didn't just build against the sample files —
we deliberately tested against a brand-new synthetic Excel with edge
cases we invented, and it caught a real bug (provider names getting
shredded by a naive comma split) that would otherwise have silently
corrupted data in front of the judges.
