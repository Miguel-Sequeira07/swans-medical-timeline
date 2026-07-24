import type { Case } from "@/types/event";

/**
 * `Case` goes through JSON.stringify/parse in two places — the client
 * fetch to the API routes, and reading from `localStorage`
 * (`lib/storage.ts`) — and `Date`s become ISO strings along the way.
 * This restores the types from that, so consumers of `Case` (e.g.
 * `lib/ai.ts`) don't need to know about it.
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
