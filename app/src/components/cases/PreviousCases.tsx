"use client";

import type { Case } from "@/types/event";

interface PreviousCasesProps {
  cases: Case[];
  onOpen: (medicalCase: Case) => void;
  onDelete: (id: string) => void;
}

export function PreviousCases({ cases, onOpen, onDelete }: PreviousCasesProps) {
  if (cases.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-zinc-500">
        Timelines saved in this browser
      </h3>
      <ul className="flex flex-col gap-2">
        {cases.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-2 dark:border-zinc-800"
          >
            <button
              type="button"
              onClick={() => onOpen(c)}
              className="flex-1 text-left"
            >
              <span className="text-sm font-medium">{c.name}</span>
              <span className="ml-2 text-xs text-zinc-500">
                {c.events.length} events · updated{" "}
                {c.updatedAt.toLocaleDateString()}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              className="text-xs text-zinc-500 underline"
            >
              delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
