import type { Case } from "@/types/event";

/**
 * `Case` cruza a rede como JSON (fetch do cliente para a rota de API) e as
 * `Date` viram strings ISO nesse percurso. Repõe os tipos antes de usar
 * as funções de `lib/ai.ts`, que assumem `Date` de verdade.
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
