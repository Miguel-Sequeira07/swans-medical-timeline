# Approximate cost per case

Measured on Jul 24 2026 with a real Gemini key. Switched model mid-hackathon:
`gemini-3.6-flash` → `gemini-3.5-flash-lite` (see `lib/ai.ts` for why — the
3.6-flash free tier is capped at 20 requests/**day**/project, and we hit it
from testing). Pricing below is for the current model, `gemini-3.5-flash-lite`:
$0.30 / 1M input tokens, $2.50 / 1M output tokens (`thinkingLevel: minimal`).
Not a character-count estimate — token counts are the real `usageMetadata`
values returned by the API for the 5 sample Excel files in `sample-data/`;
only the per-token price changed from the original measurement.

## Measured numbers (token counts, real API)

| Case | Rows | Input tokens (case context) | Cost of 1 call (summary or question) |
|---|---|---|---|
| Middleswarth (smallest) | 49 | ~7,063 | ~$0.003 |
| Garrison (largest) | 820 | ~162,969 | ~$0.050 |

Output is always small (350-450 tokens for a summary, 40-50 for a
factual answer) — **the cost is almost entirely input**, i.e. cost
scales almost linearly with case size (number of rows × Summary length),
not with what's being asked.

## Typical usage scenario (1 summary + 3 questions)

| Case | Total cost |
|---|---|
| Small case (~49 events) | ~$0.01 |
| Large case (~820 events) | ~$0.20 |

**For the submission**: "Approximate cost to run one case: roughly
$0.01–$0.20 depending on case size (49–820 medical events in our
samples), for one AI summary plus a few follow-up questions."

## Known limitation (document as an assumption, not fixing today)

Every Q&A question resends the **full case context** (all events),
because that's how `lib/ai.ts` is implemented right now — there's no
context caching or RAG/filtering. This means cost grows linearly with
the number of questions asked: 10 questions on a large case cost ~10x
the cost of a single call (~$0.50), not a fraction of it. For the real
use case (an attorney exploring a case), this is acceptable — but it's
the first thing to optimize (Gemini API context caching, or only
sending the events relevant to the question) if there's time left over.

## If gemini-3.5-flash-lite also runs out today

Free-tier quotas are scoped **per Google Cloud project per model**, not
per API key — a new key from the same account/project does not reset
them. Check https://aistudio.google.com/rate-limit for which models
still have headroom before creating another key, or set `GEMINI_MODEL`
(`app/.env.local` locally, Vercel env var in production) to try a
different one. `gemini-3.1-flash-lite` was also confirmed working with
spare quota as of this measurement.
