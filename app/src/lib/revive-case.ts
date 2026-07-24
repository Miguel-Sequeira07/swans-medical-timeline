import type { Case } from "@/types/event";

/**
 * `Case` passa por JSON.stringify/parse em dois sítios — fetch do cliente
 * para as rotas de API, e leitura do `localStorage` (`lib/storage.ts`) —
 * e as `Date` viram strings ISO nesse percurso. Repõe os tipos a partir
 * daí, para quem consome o `Case` (ex. `lib/ai.ts`) não ter de saber disto.
 */
export function reviveCase(input: unknown): Case {
  const raw = input as {
    id: string;
    name: string;
    events: Array<Record<string, unknown>>;
    milestones: Array<Record<string, unknown>>;
    createdAt: string;
    updatedAt: string;
  };

  return {
    id: raw.id,
    name: raw.name,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    events: raw.events.map((e) => ({
      ...e,
      date: new Date(e.date as string),
    })) as Case["events"],
    milestones: raw.milestones.map((m) => ({
      ...m,
      date: new Date(m.date as string),
    })) as Case["milestones"],
  };
}
