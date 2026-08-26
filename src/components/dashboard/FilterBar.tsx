"use client";

import { CalendarDays, Factory, Layers } from "lucide-react";
import { CELL_LINES } from "@/lib/constants";
import { formatDateLong, formatMonthYear, parseISODate } from "@/lib/dateUtils";
import { Dropdown } from "@/components/ui/Dropdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { DashboardFilters, LineFilter, Period, ShiftNumber } from "@/types/dashboard";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "shift", label: "Shift" },
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const SHIFT_OPTIONS: { value: ShiftNumber; label: string }[] = [
  { value: 1, label: "Shift 1 · 06:00–14:00" },
  { value: 2, label: "Shift 2 · 14:00–22:00" },
  { value: 3, label: "Shift 3 · 22:00–06:00" },
];

const LINE_OPTIONS: { value: LineFilter; label: string }[] = [
  { value: "all", label: "All Cell Lines" },
  ...CELL_LINES.map((l) => ({ value: l.id as LineFilter, label: l.name })),
];

export function FilterBar({
  filters,
  onChange,
}: {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
}) {
  const { period, date, shift, line } = filters;

  return (
    <div className="sticky top-[57px] z-20 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-6 py-2.5 lg:px-8">
        <SegmentedControl
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(value) => onChange({ ...filters, period: value })}
        />

        <div className="h-5 w-px bg-[var(--color-border)]" />

        <DateControl
          period={period}
          date={date}
          onChange={(newDate) => onChange({ ...filters, date: newDate })}
        />

        {period === "shift" && (
          <Dropdown
            options={SHIFT_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
            value={String(shift)}
            onChange={(v) => onChange({ ...filters, shift: Number(v) as ShiftNumber })}
          />
        )}

        <div className="h-5 w-px bg-[var(--color-border)]" />

        <Dropdown
          options={LINE_OPTIONS}
          value={line}
          onChange={(value) => onChange({ ...filters, line: value })}
          icon={<Factory className="h-3.5 w-3.5 text-[var(--color-ink-400)]" />}
        />

        <div className="ml-auto flex items-center gap-1.5 rounded-lg bg-[var(--color-info-bg)] px-2.5 py-1 text-[12px] font-medium text-[var(--color-info-text)]">
          <Layers className="h-3.5 w-3.5" />
          Viewing: {line === "all" ? "Plant-wide" : LINE_OPTIONS.find((l) => l.value === line)?.label}
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
  period: Period;
  date: string;
  onChange: (date: string) => void;
}) {
  const { year, month } = parseISODate(date);

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
