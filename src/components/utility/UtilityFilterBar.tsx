"use client";

import { CalendarDays, Layers } from "lucide-react";
import { UTILITY_AREAS } from "@/lib/utilityConstants";
import { formatDateLong, formatMonthYear, formatWeekLabel, parseISODate } from "@/lib/dateUtils";
import { Dropdown } from "@/components/ui/Dropdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { UtilityArea, UtilityFilters, UtilityPeriod } from "@/types/utility";
import type { ShiftNumber } from "@/types/dashboard";

const PERIOD_OPTIONS: { value: UtilityPeriod; label: string }[] = [
  { value: "shift", label: "Shift" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const SHIFT_OPTIONS: { value: ShiftNumber; label: string }[] = [
  { value: 1, label: "Shift 1 · 06:00–14:00" },
  { value: 2, label: "Shift 2 · 14:00–22:00" },
  { value: 3, label: "Shift 3 · 22:00–06:00" },
];

const AREA_OPTIONS = UTILITY_AREAS.map((a) => ({ value: a.id as UtilityArea, label: a.label }));

/**
 * "Area" is a non-data-filtering in-page anchor selector - utility data is
 * always computed plant-wide for the period/date/shift (see UtilityArea in
 * types/utility.ts), so selecting an area only scrolls the page and updates
 * which segment is highlighted, it never re-generates data.
 */
export function UtilityFilterBar({
  filters,
  onChange,
}: {
  filters: UtilityFilters;
  onChange: (filters: UtilityFilters) => void;
}) {
  const { period, date, shift, area } = filters;

  function handleAreaChange(next: UtilityArea) {
    onChange({ ...filters, area: next });
    document.getElementById(next)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-[57px] z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-6 py-2.5 lg:px-8">
        <SegmentedControl
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => onChange({ ...filters, period: value })}
        />

        <div className="h-5 w-px bg-[var(--color-border)]" />

        <DateControl period={period} date={date} onChange={(newDate) => onChange({ ...filters, date: newDate })} />

        {period === "shift" && (
          <Dropdown
            options={SHIFT_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
            value={String(shift)}
            onChange={(v) => onChange({ ...filters, shift: Number(v) as ShiftNumber })}
          />
        )}

        <div className="h-5 w-px bg-[var(--color-border)]" />

        <Dropdown
          options={AREA_OPTIONS}
          value={area}
          onChange={handleAreaChange}
          icon={<Layers className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />}
        />

        <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-[var(--color-info-bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-info-text)]">
          <Layers className="h-3.5 w-3.5" />
          Viewing: Plant-wide
        </div>
      </div>
    </div>
  );
}

function DateControl({
  period,
  date,
  onChange,
}: {
  period: UtilityPeriod;
  date: string;
  onChange: (date: string) => void;
}) {
  const { year, month } = parseISODate(date);

  if (period === "week") {
    return (
      <label className="relative flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-900)] transition-colors hover:border-[var(--color-border-strong)]">
        <CalendarDays className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />
        <span className="pointer-events-none">{formatWeekLabel(date)}</span>
        <input
          type="date"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={date}
          max="2026-08-26"
          onChange={(e) => e.target.value && onChange(e.target.value)}
        />
      </label>
    );
  }

  if (period === "month") {
    return (
      <label className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-900)] transition-colors hover:border-[var(--color-border-strong)]">
        <CalendarDays className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />
        <span className="pointer-events-none">{formatMonthYear(date)}</span>
        <input
          type="month"
          className="absolute h-0 w-0 opacity-0"
          value={`${year}-${String(month).padStart(2, "0")}`}
          onChange={(e) => {
            if (!e.target.value) return;
            onChange(`${e.target.value}-01`);
          }}
        />
      </label>
    );
  }

  if (period === "year") {
    const years = [2024, 2025, 2026, 2027];
    return (
      <Dropdown
        options={years.map((y) => ({ value: String(y), label: String(y) }))}
        value={String(year)}
        onChange={(v) => onChange(`${v}-${String(month).padStart(2, "0")}-01`)}
        icon={<CalendarDays className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />}
      />
    );
  }

  return (
    <label className="relative flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-900)] transition-colors hover:border-[var(--color-border-strong)]">
      <CalendarDays className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />
      <span className="pointer-events-none">{formatDateLong(date)}</span>
      <input
        type="date"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        value={date}
        max="2026-08-26"
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
    </label>
  );
}
