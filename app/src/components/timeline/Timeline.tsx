"use client";

import { useMemo, useState } from "react";
import type { Case, MedicalEvent, Milestone } from "@/types/event";
import {
  buildCategoryGroups,
  buildMonthGroups,
  buildMonthlyCounts,
  caseFilterOptions,
  createEmptyFilters,
  dateRangeOf,
  detectKeyEvent,
  filterEvents,
  hasActiveFilters,
  isValidDate,
  splitByDateValidity,
  type GroupBy,
  type MonthlyCount,
  type TimelineEntry,
  type TimelineFilters,
  type ViewDensity,
} from "@/lib/timeline";
import { FilterBar } from "./FilterBar";
import { exportCaseToPdf } from "@/lib/export-pdf";
import { exportCaseToPptx } from "@/lib/export-pptx";

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
const monthLabelFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });

/**
 * Compact "shape of the case" overview: one bar per calendar month,
 * height = encounter count, so the 30-second first impression includes
 * density, not just a list. Single series (no legend needed) — the
 * accident month, if any, gets the one reserved status color; every
 * other bar shares one neutral tone. Bars link to the matching month
 * section when the chronological view is active.
 */
function DensitySparkline({
  months,
  accidentMonthKey,
  linkToSections,
}: {
  months: MonthlyCount[];
  accidentMonthKey?: string;
  linkToSections: boolean;
}) {
  if (months.length < 2) return null;

  const max = Math.max(...months.map((m) => m.count), 1);

  return (
    <div className="mb-6">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
        Treatment density
      </p>
      <div className="flex h-12 items-end gap-[2px]">
        {months.map((month) => {
          const isAccidentMonth = month.key === accidentMonthKey;
          const heightPct = month.count === 0 ? 6 : Math.max(12, (month.count / max) * 100);
          const title = `${monthLabelFormatter.format(month.date)} — ${month.count} ${
            month.count === 1 ? "encounter" : "encounters"
          }`;
          const bar = (
            <span
              aria-hidden
              style={{ height: `${heightPct}%` }}
              className={`block min-h-[2px] w-full rounded-t-[4px] ${
                isAccidentMonth ? "bg-accent-rust" : "bg-foreground/25"
              }`}
            />
          );
          return linkToSections ? (
            <a
              key={month.key}
              href={`#month-${month.key}`}
              title={title}
              className="flex h-full min-w-[2px] max-w-6 flex-1 items-end justify-center hover:opacity-70"
            >
              {bar}
            </a>
          ) : (
            <div
              key={month.key}
              title={title}
              className="flex h-full min-w-[2px] max-w-6 flex-1 items-end justify-center"
            >
              {bar}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ink-muted">
        <span>{monthLabelFormatter.format(months[0].date)}</span>
        <span>{monthLabelFormatter.format(months[months.length - 1].date)}</span>
      </div>
    </div>
  );
}

interface TimelineProps {
  case: Case;
  onUpdateEventSummary?: (eventId: string, summary: string) => void;
}

export function Timeline({ case: medicalCase, onUpdateEventSummary }: TimelineProps) {
  const [filters, setFilters] = useState<TimelineFilters>(createEmptyFilters);
  const [groupBy, setGroupBy] = useState<GroupBy>("month");
  const [density, setDensity] = useState<ViewDensity>("detailed");
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

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

  const monthlyCounts = useMemo(() => buildMonthlyCounts(allDated), [allDated]);
  const accidentMilestone = useMemo(
    () => sortedMilestones.find((m) => m.type === "accident"),
    [sortedMilestones]
  );
  const accidentMonthKey = accidentMilestone
    ? `${accidentMilestone.date.getFullYear()}-${accidentMilestone.date.getMonth()}`
    : undefined;

  const beforeAfterSplit = useMemo(() => {
    if (!accidentMilestone) return null;
    const cutoff = accidentMilestone.date.getTime();
    const before: MedicalEvent[] = [];
    const after: MedicalEvent[] = [];
    for (const event of dated) {
      (event.date.getTime() < cutoff ? before : after).push(event);
    }
    const otherMilestones = medicalCase.milestones.filter(
      (m) => m.type !== "accident" && isValidDate(m.date)
    );
    return {
      before: {
        events: before,
        milestones: otherMilestones.filter((m) => m.date.getTime() < cutoff),
      },
      after: {
        events: after,
        milestones: otherMilestones.filter((m) => m.date.getTime() >= cutoff),
      },
    };
  }, [accidentMilestone, dated, medicalCase.milestones]);

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
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-paper-line pb-6">
        <div>
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
        </div>
        {medicalCase.events.length > 0 && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => exportCaseToPdf(medicalCase)}
              className="rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40"
            >
              Export PDF
            </button>
            <button
              type="button"
              onClick={() => void exportCaseToPptx(medicalCase)}
              className="rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-foreground/40"
            >
              Export PowerPoint
            </button>
          </div>
        )}
      </header>

      <DensitySparkline
        months={monthlyCounts}
        accidentMonthKey={accidentMonthKey}
        linkToSections={groupBy === "month" && !showBeforeAfter}
      />

      {sortedMilestones.length > 0 && (
        <div className="mb-6">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Key dates
          </p>
          <div className="flex flex-wrap items-center gap-2">
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
            {accidentMilestone && (
              <button
                type="button"
                onClick={() => setShowBeforeAfter((v) => !v)}
                aria-pressed={showBeforeAfter}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  showBeforeAfter
                    ? "border-accent-rust bg-accent-rust text-background"
                    : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {showBeforeAfter ? "✕ Exit before/after view" : "⇄ Compare before/after"}
              </button>
            )}
          </div>
          {showBeforeAfter && (
            <p className="mt-1.5 text-xs text-ink-muted">
              Comparing before/after the accident — grouping is by month within each side.
            </p>
          )}
        </div>
      )}

      {medicalCase.events.length > 0 && (
        <FilterBar
          options={options}
          filters={filters}
          groupBy={groupBy}
          density={density}
          isFiltered={isFiltered}
          onFiltersChange={setFilters}
          onGroupByChange={setGroupBy}
          onDensityChange={setDensity}
          onClear={() => setFilters(createEmptyFilters())}
        />
      )}

      {medicalCase.events.length === 0 ? (
        <EmptyState />
      ) : noResults ? (
        <NoResultsState onClear={() => setFilters(createEmptyFilters())} />
      ) : showBeforeAfter && beforeAfterSplit ? (
        <div className="grid gap-8 md:grid-cols-2 md:gap-6">
          <BeforeAfterColumn
            title="Before the accident"
            events={beforeAfterSplit.before.events}
            milestones={beforeAfterSplit.before.milestones}
            density={density}
            onUpdateEventSummary={onUpdateEventSummary}
          />
          <BeforeAfterColumn
            title="After the accident"
            events={beforeAfterSplit.after.events}
            milestones={beforeAfterSplit.after.milestones}
            density={density}
            onUpdateEventSummary={onUpdateEventSummary}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {groupBy === "month"
            ? monthGroups.map((group) => (
                <GroupSection
                  key={group.key}
                  anchorId={`month-${group.key}`}
                  label={group.label}
                  eventCount={group.eventCount}
                  entries={group.entries}
                  onUpdateEventSummary={onUpdateEventSummary}
                  density={density}
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
                  onUpdateEventSummary={onUpdateEventSummary}
                  density={density}
                />
              ))}
        </div>
      )}

      {undated.length > 0 && <UndatedSection events={undated} />}
    </div>
  );
}

function BeforeAfterColumn({
  title,
  events,
  milestones,
  density,
  onUpdateEventSummary,
}: {
  title: string;
  events: MedicalEvent[];
  milestones: Milestone[];
  density: ViewDensity;
  onUpdateEventSummary?: (eventId: string, summary: string) => void;
}) {
  const groups = buildMonthGroups(events, milestones);
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between border-b border-paper-line pb-2">
        <h2 className="font-display text-xl italic text-foreground">{title}</h2>
        <span className="text-xs uppercase tracking-wider text-ink-muted">
          {events.length} {events.length === 1 ? "encounter" : "encounters"}
        </span>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-paper-line py-10 text-center text-sm text-ink-muted">
          No encounters in this period
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <GroupSection
              key={group.key}
              label={group.label}
              eventCount={group.eventCount}
              entries={group.entries}
              onUpdateEventSummary={onUpdateEventSummary}
              density={density}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupSection({
  label,
  eventCount,
  entries,
  onUpdateEventSummary,
  anchorId,
  density,
}: {
  label: string;
  eventCount: number;
  entries: TimelineEntry[];
  onUpdateEventSummary?: (eventId: string, summary: string) => void;
  anchorId?: string;
  density: ViewDensity;
}) {
  return (
    <section id={anchorId} className="scroll-mt-4">
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
        {entries.map((entry) => {
          if (entry.kind === "milestone") {
            return <MilestoneRow key={`m-${entry.milestone.id}`} milestone={entry.milestone} />;
          }
          if (entry.kind === "gap") {
            return <GapRow key={`g-${entry.toDate.getTime()}`} days={entry.days} />;
          }
          return (
            <EventRow
              key={`e-${entry.event.id}`}
              event={entry.event}
              onUpdateEventSummary={onUpdateEventSummary}
              density={density}
            />
          );
        })}
      </ol>
    </section>
  );
}

function EventRow({
  event,
  onUpdateEventSummary,
  density,
}: {
  event: MedicalEvent;
  onUpdateEventSummary?: (eventId: string, summary: string) => void;
  density: ViewDensity;
}) {
  const accent = accentFor(event.medicineType || event.recordType || event.id);
  const compact = density === "compact";
  return (
    <li className={`relative flex gap-4 first:pt-0 last:pb-0 ${compact ? "py-1.5" : "py-3"}`}>
      <div className="w-16 shrink-0 pt-1 text-right">
        <div
          className={`font-display leading-none text-foreground ${compact ? "text-base" : "text-2xl"}`}
        >
          {dayNumberFormatter.format(event.date)}
        </div>
        {!compact && (
          <div className="mt-1 text-[10px] uppercase tracking-wider text-ink-muted">
            {weekdayFormatter.format(event.date)}
          </div>
        )}
      </div>
      <div className="relative flex-1">
        <span
          aria-hidden
          className={`absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-background ${accent.dot}`}
        />
        {compact ? (
          <CompactEventCard event={event} accent={accent} />
        ) : (
          <EventCard event={event} accent={accent} onUpdateEventSummary={onUpdateEventSummary} />
        )}
      </div>
    </li>
  );
}

function CompactEventCard({ event, accent }: { event: MedicalEvent; accent: Accent }) {
  const hasPdf = Boolean(event.pdfUrl);
  const keyEventLabel = detectKeyEvent(event);

  const content = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`} />
      <span className={`text-sm font-medium ${accent.text}`}>
        {event.medicineType || "Unspecified"}
      </span>
      <span className="text-sm font-medium text-foreground">
        {event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"}
      </span>
      <span className="text-xs text-ink-muted">
        {event.facility || "Facility not specified"}
      </span>
      {keyEventLabel && <span className="text-xs text-foreground">★ {keyEventLabel}</span>}
      {hasPdf && <span className="text-xs text-accent-slate">View PDF ↗</span>}
    </div>
  );

  const className =
    "block rounded-md border border-paper-line bg-paper px-3 py-1.5 transition hover:border-foreground/30";

  if (hasPdf) {
    return (
      <a href={event.pdfUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

function EventCard({
  event,
  accent,
  onUpdateEventSummary,
}: {
  event: MedicalEvent;
  accent: Accent;
  onUpdateEventSummary?: (eventId: string, summary: string) => void;
}) {
  const hasPdf = Boolean(event.pdfUrl);
  const keyEventLabel = detectKeyEvent(event);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(event.summary);
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [rephraseError, setRephraseError] = useState<string | null>(null);

  function stopCardNavigation(e: { preventDefault: () => void; stopPropagation: () => void }) {
    e.preventDefault();
    e.stopPropagation();
  }

  function startEditing(e: { preventDefault: () => void; stopPropagation: () => void }) {
    stopCardNavigation(e);
    setDraft(event.summary);
    setRephraseError(null);
    setIsEditing(true);
  }

  function cancelEditing(e: { preventDefault: () => void; stopPropagation: () => void }) {
    stopCardNavigation(e);
    setIsEditing(false);
    setRephraseError(null);
  }

  function save(e: { preventDefault: () => void; stopPropagation: () => void }) {
    stopCardNavigation(e);
    onUpdateEventSummary?.(event.id, draft.trim());
    setIsEditing(false);
  }

  async function rephraseWithAI(e: { preventDefault: () => void; stopPropagation: () => void }) {
    stopCardNavigation(e);
    setIsRephrasing(true);
    setRephraseError(null);
    try {
      const res = await fetch("/api/rephrase-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setDraft(data.rephrased ?? draft);
    } catch (err) {
      setRephraseError(err instanceof Error ? err.message : "Couldn't rephrase this summary.");
    } finally {
      setIsRephrasing(false);
    }
  }

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
        {keyEventLabel && (
          <span
            className="inline-flex items-center gap-1 rounded-full border border-foreground/25 bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-foreground"
            title="Automatically flagged as a likely key event"
          >
            ★ {keyEventLabel}
          </span>
        )}
      </div>

      <p className="mt-2 font-display text-base text-foreground sm:text-lg">
        {event.providers.length > 0 ? event.providers.join(", ") : "Provider not specified"}
        <span className="font-sans text-sm text-ink-muted">
          {" "}
          &middot; {event.facility || "Facility not specified"}
        </span>
      </p>

      {event.summary && !isEditing && (
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{event.summary}</p>
      )}

      {onUpdateEventSummary &&
        (isEditing ? (
          <div
            className="mt-2.5 rounded-md border border-paper-line bg-background/60 p-2.5"
            onClick={stopCardNavigation}
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full resize-y rounded border border-paper-line bg-paper p-2 text-sm text-foreground"
            />
            {rephraseError && <p className="mt-1 text-xs text-red-600">{rephraseError}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={rephraseWithAI}
                disabled={isRephrasing}
                className="rounded-full border border-paper-line px-3 py-1 text-xs font-medium text-foreground disabled:opacity-50"
              >
                {isRephrasing ? "Rewriting…" : "Rewrite in plain English (AI)"}
              </button>
              <button
                type="button"
                onClick={save}
                className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background"
              >
                Save
              </button>
              <button type="button" onClick={cancelEditing} className="text-xs text-ink-muted underline">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="mt-2 text-xs font-medium text-ink-muted underline hover:text-foreground"
          >
            Edit / rewrite summary
          </button>
        ))}

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

function GapRow({ days }: { days: number }) {
  return (
    <li className="relative flex gap-4 py-2">
      <div className="w-16 shrink-0" />
      <div className="relative flex-1">
        <div className="flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 border-t border-dashed border-paper-line" />
          <span className="whitespace-nowrap" title="No medical encounters recorded in this window">
            {days}-day gap in treatment
          </span>
          <span className="h-px flex-1 border-t border-dashed border-paper-line" />
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
