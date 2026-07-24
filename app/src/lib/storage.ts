import type { Case } from "@/types/event";
import { reviveCase } from "@/lib/revive-case";

/**
 * Client-side persistence (localStorage). A valid answer for the
 * hackathon submission — medical data stays in the user's browser only,
 * never reaches a server of ours.
 *
 * Stores at most MAX_CASES cases, including each event's summary — for
 * large cases (800+ events) that can get close to the localStorage
 * limit (typically 5-10 MB), so the limit is kept low and quota write
 * failures are caught instead of crashing the app.
 *
 * Exposes a cache + subscription (`subscribeCases`) to feed
 * `useSyncExternalStore` in `hooks/use-cases.ts` — the React pattern for
 * reading/reacting to an external system (here, localStorage) without
 * tripping the `set-state-in-effect` lint rule.
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

/** Returns false if it couldn't save (e.g. quota exceeded). */
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

const EMPTY_CASES: Case[] = [];

export function getCasesServerSnapshot(): Case[] {
  return EMPTY_CASES;
}
