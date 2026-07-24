import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Case } from "@/types/event";

/**
 * Ponto de partida da Pessoa A (Dados & AI).
 * Requer GOOGLE_GENERATIVE_AI_API_KEY em app/.env.local (ver .env.local.example).
 */
function getModel() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY não está definida");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

/** Q&A sobre o caso: "quando foi o primeiro MRI?", "quantas sessões de fisio?" */
export async function askCaseQuestion(
  medicalCase: Case,
  question: string
): Promise<string> {
  const model = getModel();
  const context = medicalCase.events
    .map((e) => `${e.date.toISOString().slice(0, 10)} — ${e.recordType}: ${e.summary}`)
    .join("\n");

  const result = await model.generateContent(
    `Eventos médicos do caso:\n${context}\n\nPergunta: ${question}\nResponde de forma curta e factual, citando datas quando relevante.`
  );
  return result.response.text();
}

/** Gera um resumo médico do tratamento completo. */
export async function summarizeTreatment(medicalCase: Case): Promise<string> {
  const model = getModel();
  const context = medicalCase.events
    .map((e) => `${e.date.toISOString().slice(0, 10)} — ${e.recordType}: ${e.summary}`)
    .join("\n");

  const result = await model.generateContent(
    `Resume o tratamento médico abaixo num parágrafo claro para um advogado apresentar a um júri:\n\n${context}`
  );
  return result.response.text();
}

/** Reescreve o summary de um único evento, mais claro para leigos. */
export async function rephraseSummary(
  summary: string,
  instruction?: string
): Promise<string> {
  const model = getModel();
  const result = await model.generateContent(
    `Reescreve este resumo médico de forma clara para um leigo (júri/cliente), ` +
      `mantendo todos os factos clínicos, sem inventar informação nova.` +
      (instruction ? ` Instrução adicional: ${instruction}` : "") +
      `\n\nResumo original:\n${summary}`
  );
  return result.response.text();
}
