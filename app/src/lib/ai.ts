import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { Case } from "@/types/event";

/**
 * Requer GOOGLE_GENERATIVE_AI_API_KEY em app/.env.local (ver .env.local.example).
 *
 * Modelo: gemini-3.6-flash, confirmado a funcionar com uma chave real em
 * 24 jul 2026 (gemini-2.0-flash está descontinuado desde 1 jun 2026;
 * gemini-2.5-flash já não aceita contas novas). Configurável via
 * GEMINI_MODEL.
 *
 * thinkingLevel "minimal": as tarefas aqui são leitura/resumo de contexto
 * já fornecido, não raciocínio multi-passo — testado (24 jul 2026) que
 * isto elimina os "thinking tokens" (que por defeito custam tanto quanto
 * o texto de resposta) sem perda percetível de qualidade. Gemini 3 Flash
 * não permite desligar o thinking por completo, "minimal" é o mais baixo
 * possível.
 *
 * Prompts em inglês de propósito: os utilizadores finais são advogados e
 * júris nos EUA (ver slides do desafio), não a nossa equipa — testado que
 * um prompt em português produz respostas em português, o que seria
 * inutilizável para o caso de uso real.
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
