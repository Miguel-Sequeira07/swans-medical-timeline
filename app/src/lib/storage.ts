import type { Case } from "@/types/event";
import { reviveCase } from "@/lib/revive-case";

/**
 * Persistência client-side (localStorage). Resposta válida para a
 * submissão do hackathon — dados médicos ficam só no browser do
 * utilizador, nunca chegam a um servidor nosso.
 *
 * Guarda no máximo MAX_CASES casos, com o resumo (Summary) de cada evento
 * incluído — em casos grandes (800+ eventos) isso pode aproximar-se do
 * limite de localStorage (tipicamente 5-10 MB), por isso o limite é baixo
 * e escritas falhadas por quota são apanhadas em vez de rebentar a app.
 *
 * Expõe um cache + subscrição (`subscribeCases`) para alimentar
 * `useSyncExternalStore` em `hooks/use-cases.ts` — é o padrão do React
 * para ler/reagir a um sistema externo (aqui, localStorage) sem cair na
 * regra de lint `set-state-in-effect`.
 */
const STORAGE_KEY = "medical-timeline:cases";
const MAX_CASES = 5;

function readFromStorage(): Case[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map(reviveCase);
  } catch {
    return [];
  }
}

let cachedCases: Case[] = readFromStorage();
const listeners = new Set<() => void>();

function setCachedCases(next: Case[]) {
  cachedCases = next;
  for (const listener of listeners) listener();
}

export function listCases(): Case[] {
  return cachedCases;
}

/** Devolve false se não conseguiu guardar (ex: quota excedida). */
export function saveCase(medicalCase: Case): boolean {
  if (typeof window === "undefined") return false;
  const next = [medicalCase, ...cachedCases.filter((c) => c.id !== medicalCase.id)].slice(
    0,
    MAX_CASES
  );
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCachedCases(next);
    return true;
  } catch {
    return false;
  }
}

export function deleteCase(id: string): void {
  if (typeof window === "undefined") return;
  const next = cachedCases.filter((c) => c.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  setCachedCases(next);
}

export function subscribeCases(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCasesServerSnapshot(): Case[] {
  return [];
}
