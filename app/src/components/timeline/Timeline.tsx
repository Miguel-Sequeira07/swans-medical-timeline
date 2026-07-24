"use client";

import { useMemo, useState } from "react";
import type { Case, MedicalEvent, Milestone } from "@/types/event";
import {
  buildCategoryGroups,
  buildMonthGroups,
  caseFilterOptions,
  createEmptyFilters,
  dateRangeOf,
  filterEvents,
  hasActiveFilters,
  isValidDate,
  splitByDateValidity,
  type GroupBy,
  type TimelineEntry,
  type TimelineFilters,
} from "@/lib/timeline";
import { FilterBar } from "./FilterBar";

/**
 * Central timeline component (Person B). Receives an already-parsed
 * `Case` (see src/types/event.ts) and assumes nothing about the content
 * of the data — only the shape of the schema is guaranteed (golden rule
 * of the challenge). Filtering and grouping live in `lib/timeline.ts`;
 * this file only renders.
 */

const ACCENTS = [
  { dot: "bg-accent-rust", text: "text-accent-rust", bg: "bg-accent-rust/10" },
  { dot: "bg-accent-teal", text: "text-accent-teal", bg: "bg-accent-teal/10" },
  { dot: "bg-accent-ochre", text: "text-accent-ochre", bg: "bg-accent-ochre/10" },
  { dot: "bg-accent-slate", text: "text-accent-slate", bg: "bg-accent-slate/10" },
  { dot: "bg-accent-moss", text: "text-accent-moss", bg: "bg-accent-moss/10" },
  { dot: "bg-accent-clay", text: "text-accent-clay", bg: "bg-accent-clay/10" },
] as const;

type Accent = (typeof ACCENTS)[number];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function accentFor(key: string): Accent {
  const safeKey = key || "default";
  return ACCENTS[hashString(safeKey) % ACCENTS.length];
}

const dayNumberFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const rangeFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export function Timeline({ case: medicalCase }: { case: Case }) {
  const [filters, setFilters] = useState<TimelineFilters>(createEmptyFilters);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");

  const options = useMemo(() => caseFilterOptions(medicalCase), [medicalCase]);
  const filtered = useMemo(
    () => filterEvents(medicalCase.events, filters),
    [medicalCase, filters]
  );
  const { dated, undated } = useMemo(() => splitByDateValidity(filtered), [filtered]);

  const allDated = useMemo(
    () => medicalCase.events.filter((event) => isValidDate(event.date)),
    [medicalCase]
  );
  const fullRange = useMemo(() => dateRangeOf(allDated), [allDated]);
  const totalUndated = medicalCase.events.length - allDated.length;

  const sortedMilestones = useMemo(
    () =>
      [...medicalCase.milestones]
        .filter((milestone) => isValidDate(milestone.date))
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [medicalCase]
  );

  const monthGroups = useMemo(
    () => (groupBy === "month" ? buildMonthGroups(dated, medicalCase.milestones) : []),
    [groupBy, dated, medicalCase]
  );
  const categoryGroups = useMemo(
    () =>
      groupBy !== "month"
        ? buildCategoryGroups(dated, groupBy as Exclude<GroupBy, "month">)
        : [],
    [groupBy, dated]
  );

  const rangeLabel = fullRange
    ? `${rangeFormatter.format(fullRange.start)} – ${rangeFormatter.format(fullRange.end)}`
    : null;

  const isFiltered = hasActiveFilters(filters);
  const noResults = filtered.length === 0 && medicalCase.events.length > 0;

  return (
    <div className="w-full">
      <header className="mb-6 border-b border-paper-line pb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">Medical Timeline</p>
        <h1 className="mt-1 font-display text-3xl italic text-foreground sm:text-4xl">
          {medicalCase.name}
        </h1>
        {rangeLabel && (
          <p className="mt-3 text-sm text-ink-muted">
            {rangeLabel} &middot; {allDated.length} medical{" "}
            {allDated.length === 1 ? "encounter" : "encounters"}
            {totalUndated > 0 && ` · ${totalUndated} undated`}
            {isFiltered && ` · ${filtered.length} match current filters`}
          </p>
        )}
      </header>

      {sortedMilestones.length > 0 && (
        <div className="mb-6">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Key dates
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedMilestones.map((milestone) => (
              <span
                key={milestone.id}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  milestone.type === "accident"
                    ? "border-accent-rust/40 bg-accent-rust/10 text-accent-rust"
                    : "border-accent-ochre/40 bg-accent-ochre/10 text-accent-ochre"
                }`}
              >
                {milestone.type === "accident" ? "⚑" : "◆"} {milestone.label} &middot;{" "}
                {rangeFormatter.format(milestone.date)}
              </span>
            ))}
          </div>
        </div>
      )}

      {medicalCase.events.length > 0 && (
        <FilterBar
          options={options}
          filters={filters}
          groupBy={groupBy}
          isFiltered={isFiltered}
          onFiltersChange={setFilters}
          onGroupByChange={setGroupBy}
          onClear={() => setFilters(createEmptyFilters())}
        />
      )}

      {medicalCase.events.length === 0 ? (
        <EmptyState />
      ) : noResults ? (
        <NoResultsState onClear={() => setFilters(createEmptyFilters())} />
      ) : (
        <div className="space-y-8">
          {groupBy === "month"
            ? monthGroups.map((group) => (
                <GroupSection
                  key={group.key}
                  label={group.label}
                  eventCount={group.eventCount}
                  entries={group.entries}
                />
              ))
            : categoryGroups.map((group) => (
                <GroupSection
                  key={group.key}
                  label={group.label}
                  eventCount={group.events.length}
                  entries={group.events.map((event) => ({
                    kind: "event" as const,
                    date: event.date,
                    event,
                  }))}
                />
              ))}
        </div>
      )}

      {undated.length > 0 && <UndatedSection events={undated} />}
    </div>
  );
}

function GroupSection({
  label,
  eventCount,
  entries,
}: {
  label: string;
  eventCount: number;
  entries: TimelineEntry[];
}) {
  return (
    <section>
      <div className="sticky top-0 z-10 -mx-4 mb-1 flex items-baseline justify-between border-b border-paper-line bg-background/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6">
        <h2 className="font-display text-lg italic text-foreground sm:text-xl">{label}</h2>
        <span className="text-xs uppercase tracking-wider text-ink-muted">
          {eventCount} {eventCount === 1 ? "encounter" : "encounters"}
        </span>
      </div>
      <ol className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-20 top-0 w-px bg-paper-line"
        />
        {entries.map((entry) =>
          entry.kind === "milestone" ? (
            <MilestoneRow key={`m-${entry.milestone.id}`} milestone={entry.milestone} />
          ) : (
            <EventRow key={`e-${entry.event.id}`} event={entry.event} />
          )
        )}
      </ol>
    </section>
  );
}

function EventRow({ event }: { event: MedicalEvent }) {
  const accent = accentFor(event.medicineType || event.recordType || event.id);
  return (
    <li className="relative flex gap-4 py-3 first:pt-0 last:pb-0">
      <div className="w-16 shrink-0 pt-1 text-right">
        <div className="font-display text-2xl leading-none text-foreground">
          {dayNumberFormatter.format(event.date)}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-muted">
          {weekdayFormatter.format(event.date)}
        </div>
      </div>
      <div className="relative flex-1">
        <span
          aria-hidden
          className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-background ${accent.dot}`}
        />
        <EventCard event={event} accent={accent} />
      </div>
    </li>
  );
}

function EventCard({ event, accent }: { event: MedicalEvent; accent: Accent }) {
  const hasPdf = Boolean(event.pdfUrl);

  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${accent.bg} ${accent.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
          {event.medicineType || "Unspecified"}
        </span>
        <span className="text-xs uppercase tracking-wide text-ink-muted">
          {event.recordType || "Record"}
        </span>
      </div>

      <p className="mt-2 font-display text-base text-foreground sm:text-lg">
        {event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"}
        <span className="font-sans text-sm text-ink-muted">
          {" "}
          &middot; {event.facility || "Facility not specified"}
        </span>
      </p>

      {event.summary && (
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{event.summary}</p>
      )}

      {event.bodyParts.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {event.bodyParts.map((part) => (
            <span
              key={part}
              className="rounded-full border border-paper-line px-2 py-0.5 text-[11px] text-ink-muted"
            >
              {part}
            </span>
          ))}
        </div>
      )}

      {hasPdf && (
        <p className="mt-2.5 text-xs font-medium text-accent-slate group-hover:underline">
          View source document &#8599;
        </p>
      )}
    </>
  );

  const className =
    "group block rounded-lg border border-paper-line bg-paper px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  if (hasPdf) {
    return (
      <a href={event.pdfUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const isAccident = milestone.type === "accident";
  return (
    <li className="relative flex gap-4 py-4">
      <div className="w-16 shrink-0 pt-1 text-right">
        <div className="font-display text-xl italic leading-none text-foreground">
          {dayNumberFormatter.format(milestone.date)}
        </div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-muted">
          {weekdayFormatter.format(milestone.date)}
        </div>
      </div>
      <div className="relative flex-1">
        <span
          aria-hidden
          className={`absolute -left-[6px] top-2 h-3 w-3 rotate-45 ring-4 ring-background ${
            isAccident ? "bg-accent-rust" : "bg-accent-ochre"
          }`}
        />
        <div
          className={`rounded-lg border-2 px-4 py-3 ${
            isAccident
              ? "border-accent-rust/40 bg-accent-rust/10"
              : "border-accent-ochre/40 bg-accent-ochre/10"
          }`}
        >
          <p
            className={`font-display text-lg font-medium ${
              isAccident ? "text-accent-rust" : "text-accent-ochre"
            }`}
          >
            {isAccident ? "⚑ " : "◆ "}
            {milestone.label}
          </p>
          {milestone.notes && <p className="mt-1 text-sm text-ink-muted">{milestone.notes}</p>}
        </div>
      </div>
    </li>
  );
}

function UndatedSection({ events }: { events: MedicalEvent[] }) {
  return (
    <section className="mt-10 rounded-lg border border-dashed border-paper-line bg-paper/60 p-4 sm:p-6">
      <h2 className="font-display text-lg italic text-foreground">Undated encounters</h2>
      <p className="mt-1 text-xs text-ink-muted">
        These records had a missing or unreadable encounter date and could not be placed on the
        timeline.
      </p>
      <ul className="mt-4 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="border-l-2 border-paper-line pl-3">
            <p className="text-sm font-medium text-foreground">
              {event.recordType || "Record"} &middot;{" "}
              {event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"}
            </p>
            {event.summary && <p className="text-sm text-ink-muted">{event.summary}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-paper-line py-16 text-center">
      <p className="font-display text-xl italic text-foreground">No medical events yet</p>
      <p className="mt-2 text-sm text-ink-muted">Upload a case Excel file to build the timeline.</p>
    </div>
  );
}

function NoResultsState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-paper-line py-16 text-center">
      <p className="font-display text-xl italic text-foreground">No encounters match your filters</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-sm font-medium text-accent-rust hover:underline"
      >
        Clear filters
      </button>
    </div>
  );
}
