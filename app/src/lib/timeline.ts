import type { Case, MedicalEvent, Milestone } from "@/types/event";

/**
 * Pure filtering/grouping logic for the timeline (Person B). Kept
 * separate from the component so it's easy to test and so
 * `Timeline.tsx` stays focused on rendering. Assumes nothing about the
 * content of the values (providers/medicineType/bodyParts) — it just
 * groups and filters by whatever exists in the data.
 */

export type GroupBy = "month" | "provider" | "medicineType" | "bodyPart";

export interface TimelineFilters {
  query: string;
  providers: Set<string>;
  medicineTypes: Set<string>;
  bodyParts: Set<string>;
  dateFrom: string;
  dateTo: string;
}

export function createEmptyFilters(): TimelineFilters {
  return {
    query: "",
    providers: new Set(),
    medicineTypes: new Set(),
    bodyParts: new Set(),
    dateFrom: "",
    dateTo: "",
  };
}

export function hasActiveFilters(filters: TimelineFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.providers.size > 0 ||
    filters.medicineTypes.size > 0 ||
    filters.bodyParts.size > 0 ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

export function isValidDate(date: Date): boolean {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

export interface FilterOptions {
  providers: string[];
  medicineTypes: string[];
  bodyParts: string[];
}

export function collectFilterOptions(events: MedicalEvent[]): FilterOptions {
  const providers = new Set<string>();
  const medicineTypes = new Set<string>();
  const bodyParts = new Set<string>();

  for (const event of events) {
    for (const provider of event.providers) {
      if (provider) providers.add(provider);
    }
    if (event.medicineType) medicineTypes.add(event.medicineType);
    for (const part of event.bodyParts) {
      if (part) bodyParts.add(part);
    }
  }

  const collator = new Intl.Collator("en");
  const sortAlpha = (values: Set<string>) => [...values].sort(collator.compare);

  return {
    providers: sortAlpha(providers),
    medicineTypes: sortAlpha(medicineTypes),
    bodyParts: sortAlpha(bodyParts),
  };
}

function matchesQuery(event: MedicalEvent, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;
  const haystack = [
    event.summary,
    event.facility,
    event.recordType,
    event.medicineType,
    ...event.providers,
    ...event.bodyParts,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(trimmed);
}

export function filterEvents(events: MedicalEvent[], filters: TimelineFilters): MedicalEvent[] {
  return events.filter((event) => {
    if (!matchesQuery(event, filters.query)) return false;

    if (filters.providers.size > 0 && !event.providers.some((p) => filters.providers.has(p))) {
      return false;
    }
    if (filters.medicineTypes.size > 0 && !filters.medicineTypes.has(event.medicineType)) {
      return false;
    }
    if (filters.bodyParts.size > 0 && !event.bodyParts.some((p) => filters.bodyParts.has(p))) {
      return false;
    }

    if (filters.dateFrom || filters.dateTo) {
      if (!isValidDate(event.date)) return false;
      if (filters.dateFrom && event.date < new Date(filters.dateFrom)) return false;
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (event.date > to) return false;
      }
    }

    return true;
  });
}

export type TimelineEntry =
  | { kind: "event"; date: Date; event: MedicalEvent }
  | { kind: "milestone"; date: Date; milestone: Milestone };

export interface MonthGroup {
  key: string;
  label: string;
  date: Date;
  entries: TimelineEntry[];
  eventCount: number;
}

export function buildMonthGroups(events: MedicalEvent[], milestones: Milestone[]): MonthGroup[] {
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

  const entries: TimelineEntry[] = [
    ...events.map((event) => ({ kind: "event" as const, date: event.date, event })),
    ...milestones
      .filter((milestone) => isValidDate(milestone.date))
      .map((milestone) => ({ kind: "milestone" as const, date: milestone.date, milestone })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const groups: MonthGroup[] = [];
  const index = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const key = `${entry.date.getFullYear()}-${entry.date.getMonth()}`;
    let group = index.get(key);
    if (!group) {
      group = { key, label: monthFormatter.format(entry.date), date: entry.date, entries: [], eventCount: 0 };
      index.set(key, group);
      groups.push(group);
    }
    group.entries.push(entry);
    if (entry.kind === "event") group.eventCount += 1;
  }

  return groups;
}

export interface CategoryGroup {
  key: string;
  label: string;
  events: MedicalEvent[];
}

function primaryLabel(event: MedicalEvent, groupBy: Exclude<GroupBy, "month">): string {
  if (groupBy === "provider") return event.providers[0]?.trim() || "Unspecified provider";
  if (groupBy === "medicineType") return event.medicineType?.trim() || "Unspecified medicine type";
  return event.bodyParts[0]?.trim() || "Unspecified body part";
}

export function buildCategoryGroups(
  events: MedicalEvent[],
  groupBy: Exclude<GroupBy, "month">
): CategoryGroup[] {
  const map = new Map<string, MedicalEvent[]>();

  for (const event of events) {
    const label = primaryLabel(event, groupBy);
    const list = map.get(label);
    if (list) {
      list.push(event);
    } else {
      map.set(label, [event]);
    }
  }

  const collator = new Intl.Collator("en");

  return [...map.entries()]
    .map(([label, groupEvents]) => ({
      key: label,
      label,
      events: [...groupEvents].sort((a, b) => {
        const aValid = isValidDate(a.date);
        const bValid = isValidDate(b.date);
        if (aValid && bValid) return a.date.getTime() - b.date.getTime();
        if (aValid) return -1;
        if (bValid) return 1;
        return 0;
      }),
    }))
    .sort((a, b) => {
      const aUnspecified = a.label.startsWith("Unspecified");
      const bUnspecified = b.label.startsWith("Unspecified");
      if (aUnspecified !== bUnspecified) return aUnspecified ? 1 : -1;
      return collator.compare(a.label, b.label);
    });
}

export function splitByDateValidity(events: MedicalEvent[]): {
  dated: MedicalEvent[];
  undated: MedicalEvent[];
} {
  const dated: MedicalEvent[] = [];
  const undated: MedicalEvent[] = [];
  for (const event of events) {
    (isValidDate(event.date) ? dated : undated).push(event);
  }
  return { dated, undated };
}

export function dateRangeOf(events: MedicalEvent[]): { start: Date; end: Date } | null {
  if (events.length === 0) return null;
  return events.reduce(
    (acc, event) => ({
      start: event.date < acc.start ? event.date : acc.start,
      end: event.date > acc.end ? event.date : acc.end,
    }),
    { start: events[0].date, end: events[0].date }
  );
}

export function caseFilterOptions(medicalCase: Case): FilterOptions {
  return collectFilterOptions(medicalCase.events);
}
