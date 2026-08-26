"use client";

import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg bg-[var(--color-bg)] p-0.5 border border-[var(--color-border)]",
        className,
      )}
      role="tablist"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-all duration-150",
              active
                ? "bg-white text-[var(--color-navy-900)] shadow-[0_1px_2px_rgba(16,24,40,0.08)]"
                : "text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
