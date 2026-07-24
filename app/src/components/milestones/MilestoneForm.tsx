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
    <div className="flex flex-col gap-3 rounded-lg border border-paper-line bg-paper/60 p-4">
      <div>
        <h3 className="font-display text-sm italic text-foreground">Manual milestones</h3>
        <p className="text-xs text-ink-muted">
          The Excel only has medical encounters. Add the accident date or
          other milestones that aren&apos;t in the data here.
        </p>
      </div>

      {milestones.length > 0 && (
        <ul className="flex flex-col gap-1">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between text-sm text-foreground"
            >
              <span>
                <strong>{m.label}</strong> — {m.date.toLocaleDateString()}
                {m.type === "accident" && " (accident)"}
              </span>
              <button
                type="button"
                onClick={() => onRemove(m.id)}
                className="text-xs text-ink-muted underline hover:text-foreground"
              >
                remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-xs text-ink-muted">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded border border-paper-line bg-paper px-2 py-1 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-muted">
          Label
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={hasAccident ? "e.g. End of treatment" : "Accident date"}
            className="w-44 rounded border border-paper-line bg-paper px-2 py-1 text-sm text-foreground"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-muted">
          Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Milestone["type"])}
            className="rounded border border-paper-line bg-paper px-2 py-1 text-sm text-foreground"
          >
            <option value="accident">Accident</option>
            <option value="custom">Other</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background transition hover:opacity-90"
        >
          Add
        </button>
      </form>
    </div>
  );
}
