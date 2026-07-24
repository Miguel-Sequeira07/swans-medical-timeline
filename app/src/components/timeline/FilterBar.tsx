"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@/components/icons";
import type {
  FilterOptions,
  GroupBy,
  TimelineFilters,
  ViewDensity,
  ViewMode,
} from "@/lib/timeline";

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "month", label: "Chronological" },
  { value: "provider", label: "Provider" },
  { value: "medicineType", label: "Medicine type" },
  { value: "bodyPart", label: "Body part" },
];

const DENSITY_OPTIONS: { value: ViewDensity; label: string }[] = [
  { value: "detailed", label: "Detailed" },
  { value: "compact", label: "Compact" },
];

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "timeline", label: "Timeline" },
  { value: "calendar", label: "Calendar" },
];

function toggle(set: Set<string>, value: string): Set<string> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

function PillGroup({
  label,
  values,
  selected,
  onChange,
}: {
  label: string;
  values: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  if (values.length === 0) return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">{label}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((value) => {
          const active = selected.has(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(toggle(selected, value))}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FilterBar({
  options,
  filters,
  groupBy,
  density,
  viewMode,
  isFiltered,
  onFiltersChange,
  onGroupByChange,
  onDensityChange,
  onViewModeChange,
  onClear,
}: {
  options: FilterOptions;
  filters: TimelineFilters;
  groupBy: GroupBy;
  density: ViewDensity;
  viewMode: ViewMode;
  isFiltered: boolean;
  onFiltersChange: (next: TimelineFilters) => void;
  onGroupByChange: (next: GroupBy) => void;
  onDensityChange: (next: ViewDensity) => void;
  onViewModeChange: (next: ViewMode) => void;
  onClear: () => void;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const advancedCount =
    filters.providers.size +
    filters.medicineTypes.size +
    filters.bodyParts.size +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="mb-8 rounded-lg border border-paper-line bg-paper/60 p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <label className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
            Search
          </label>
          <input
            type="text"
            value={filters.query}
            onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
            placeholder="Search summary, provider, facility…"
            className="mt-1 w-full border-b-2 border-paper-line bg-transparent pb-1 text-sm text-foreground outline-none placeholder:text-ink-muted/70 focus:border-accent-rust"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            showAdvanced || advancedCount > 0
              ? "border-accent-rust bg-accent-rust/10 text-accent-rust"
              : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          Filters{advancedCount > 0 ? ` (${advancedCount})` : ""}
          {showAdvanced ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
        </button>

        {isFiltered && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent-rust hover:underline"
          >
            Clear
            <CloseIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {showAdvanced && (
        <div className="mt-4 space-y-4 border-t border-paper-line pt-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="mt-1 block rounded border border-paper-line bg-paper px-2 py-1 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-ink-muted">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="mt-1 block rounded border border-paper-line bg-paper px-2 py-1 text-sm text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <PillGroup
              label="Provider"
              values={options.providers}
              selected={filters.providers}
              onChange={(next) => onFiltersChange({ ...filters, providers: next })}
            />
            <PillGroup
              label="Medicine type"
              values={options.medicineTypes}
              selected={filters.medicineTypes}
              onChange={(next) => onFiltersChange({ ...filters, medicineTypes: next })}
            />
            <PillGroup
              label="Body part"
              values={options.bodyParts}
              selected={filters.bodyParts}
              onChange={(next) => onFiltersChange({ ...filters, bodyParts: next })}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-paper-line pt-3">
        <div className="flex flex-wrap gap-1.5">
          {VIEW_MODE_OPTIONS.map((option) => {
            const active = option.value === viewMode;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => onViewModeChange(option.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {viewMode === "timeline" && (
          <>
            <div className="flex flex-wrap gap-1.5 border-l border-paper-line pl-3">
              {GROUP_OPTIONS.map((option) => {
                const active = option.value === groupBy;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onGroupByChange(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-accent-slate bg-accent-slate/15 text-accent-slate"
                        : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    Group by: {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5 border-l border-paper-line pl-3">
              {DENSITY_OPTIONS.map((option) => {
                const active = option.value === density;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onDensityChange(option.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-accent-moss bg-accent-moss/15 text-accent-moss"
                        : "border-paper-line bg-paper text-ink-muted hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    View: {option.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
