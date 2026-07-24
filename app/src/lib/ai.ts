import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
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

/** Each line is prefixed with the event's id so the model can cite it back. */
function eventsAsContext(medicalCase: Case): string {
  return medicalCase.events
    .map((e) => {
      const date = Number.isNaN(e.date.getTime())
        ? "date unknown"
        : e.date.toISOString().slice(0, 10);
      return `${e.id} | ${date} — ${e.recordType}: ${e.summary}`;
    })
    .join("\n");
}

export interface CaseAnswer {
  answer: string;
  /** Event ids the answer is grounded in, so the UI can link back to them. */
  citedEventIds: string[];
}

/**
 * Q&A about the case: "when was the first MRI?", "how many PT sessions?"
 * Structured output (not free text) so the UI can turn "cited" events
 * into clickable jumps back to the timeline — verified with a real API
 * key (Jul 24 2026) that gemini-3.6-flash reliably returns the right
 * event id(s) for a grounded factual question.
 */
export async function askCaseQuestion(
  medicalCase: Case,
  question: string
): Promise<CaseAnswer> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `Medical events for this case (each line starts with its event id):\n${eventsAsContext(medicalCase)}\n\nQuestion: ${question}\nAnswer briefly and factually, in English, citing dates when relevant. List the ids of every event your answer relies on in citedEventIds — omit it (empty array) if the question isn't about specific events.`,
    config: {
      ...GENERATION_CONFIG,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          citedEventIds: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["answer", "citedEventIds"],
      },
    },
  });
  try {
    const parsed = JSON.parse(response.text ?? "{}");
    return {
      answer: typeof parsed.answer === "string" ? parsed.answer : "",
      citedEventIds: Array.isArray(parsed.citedEventIds) ? parsed.citedEventIds : [],
    };
  } catch {
    return { answer: response.text ?? "", citedEventIds: [] };
  }
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
