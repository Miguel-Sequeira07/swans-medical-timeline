# Approximate cost per case

Measured on Jul 24 2026, with a real Gemini key (`gemini-3.6-flash`,
`thinkingLevel: minimal`), official pricing: $1.50 / 1M input tokens,
$7.50 / 1M output tokens. Not a character-count estimate — these are the
real `usageMetadata` values returned by the API for the 5 sample Excel
files in `sample-data/`.

## Measured numbers

| Case | Rows | Input tokens (case context) | Cost of 1 call (summary or question) |
|---|---|---|---|
| Middleswarth (smallest) | 49 | ~7,063 | ~$0.014 |
| Garrison (largest) | 820 | ~162,969 | ~$0.245–0.247 |

Output is always small (350-450 tokens for a summary, 40-50 for a
factual answer) — **the cost is almost entirely input**, i.e. cost
scales almost linearly with case size (number of rows × Summary length),
not with what's being asked.

## Typical usage scenario (1 summary + 3 questions)

| Case | Total cost |
|---|---|
| Small case (~49 events) | ~$0.05 |
| Large case (~820 events) | ~$1.00 |

**For the submission**: "Approximate cost to run one case: roughly
$0.05–$1.00 depending on case size (49–820 medical events in our
samples), for one AI summary plus a few follow-up questions."

## Known limitation (document as an assumption, not fixing today)

Every Q&A question resends the **full case context** (all events),
because that's how `lib/ai.ts` is implemented right now — there's no
context caching or RAG/filtering. This means cost grows linearly with
the number of questions asked: 10 questions on a large case cost ~10x
the cost of a single call (~$2.45), not a fraction of it. For the real
use case (an attorney exploring a case), this is acceptable — but it's
the first thing to optimize (Gemini API context caching, or only
sending the events relevant to the question) if there's time left over.
