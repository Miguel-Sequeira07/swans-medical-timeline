import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { Case } from "@/types/event";

/**
 * Requires GOOGLE_GENERATIVE_AI_API_KEY in app/.env.local (see .env.local.example).
 *
 * Model: gemini-3.6-flash, confirmed working with a real key on
 * Jul 24 2026 (gemini-2.0-flash has been deprecated since Jun 1 2026;
 * gemini-2.5-flash no longer accepts new accounts). Configurable via
 * GEMINI_MODEL.
 *
 * thinkingLevel "minimal": the tasks here are reading/summarizing
 * context that's already provided, not multi-step reasoning — tested
 * (Jul 24 2026) that this eliminates "thinking tokens" (which by
 * default cost as much as the response text) with no noticeable quality
 * loss. Gemini 3 Flash doesn't allow disabling thinking entirely,
 * "minimal" is the lowest setting available.
 *
 * Prompts are in English on purpose: the end users are US attorneys and
 * juries (see the challenge slides), not our team — tested that a
 * Portuguese prompt produces Portuguese answers, which would be unusable
 * for the real use case.
 */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
const GENERATION_CONFIG = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
};

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function eventsAsContext(medicalCase: Case): string {
  return medicalCase.events
    .map((e) => {
      const date = Number.isNaN(e.date.getTime())
        ? "date unknown"
        : e.date.toISOString().slice(0, 10);
      return `${date} — ${e.recordType}: ${e.summary}`;
    })
    .join("\n");
}

/** Q&A about the case: "when was the first MRI?", "how many PT sessions?" */
export async function askCaseQuestion(
  medicalCase: Case,
  question: string
): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Medical events for this case:\n${eventsAsContext(medicalCase)}\n\nQuestion: ${question}\nAnswer briefly and factually, in English, citing dates when relevant.`,
    config: GENERATION_CONFIG,
  });
  return response.text ?? "";
}

/** Generates a summary of the full treatment. */
export async function summarizeTreatment(medicalCase: Case): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Summarize the medical treatment below in a clear paragraph, in English, for an attorney to present to a jury:\n\n${eventsAsContext(medicalCase)}`,
    config: GENERATION_CONFIG,
  });
  return response.text ?? "";
}

/** Rewrites a single event's summary, in plain English for a layperson. */
export async function rephraseSummary(
  summary: string,
  instruction?: string
): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents:
      `Rewrite this medical summary in plain English for a layperson (jury/client), ` +
      `keeping every clinical fact, without inventing new information.` +
      (instruction ? ` Additional instruction: ${instruction}` : "") +
      `\n\nOriginal summary:\n${summary}`,
    config: GENERATION_CONFIG,
  });
  return response.text ?? "";
}
