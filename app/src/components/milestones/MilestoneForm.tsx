"use client";

import { useState, type FormEvent } from "react";
import type { Milestone } from "@/types/event";

interface MilestoneFormProps {
  milestones: Milestone[];
  onAdd: (milestone: Milestone) => void;
  onRemove: (id: string) => void;
}

export function MilestoneForm({ milestones, onAdd, onRemove }: MilestoneFormProps) {
  const [label, setLabel] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<Milestone["type"]>("accident");

  const hasAccident = milestones.some((m) => m.type === "accident");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) return;
    onAdd({
      id: crypto.randomUUID(),
      label: label.trim() || (type === "accident" ? "Accident" : "Milestone"),
      date: new Date(date),
      type,
    });
    setLabel("");
    setDate("");
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div>
        <h3 className="text-sm font-medium">Manual milestones</h3>
        <p className="text-xs text-zinc-500">
          The Excel only has medical encounters. Add the accident date or
          other milestones that aren&apos;t in the data here.
        </p>
      </div>

      {milestones.length > 0 && (
        <ul className="flex flex-col gap-1">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                <strong>{m.label}</strong> — {m.date.toLocaleDateString()}
                {m.type === "accident" && " (accident)"}
              </span>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="text-xs text-zinc-500 underline"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs text-zinc-500">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>
        <label className="flex flex-col text-xs text-zinc-500">
          Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={hasAccident ? "e.g. End of treatment" : "Accident date"}
            className="w-44 rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-black"
          />
        </label>
        <label className="flex flex-col text-xs text-zinc-500">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Milestone["type"])}
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-black"
          >
            <option value="accident">Accident</option>
            <option value="custom">Other</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-black"
        >
          Add
        </button>
      </form>
    </div>
  );
}
