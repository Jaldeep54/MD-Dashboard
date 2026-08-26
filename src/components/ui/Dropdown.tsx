"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  icon,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-medium text-[var(--color-ink-900)] transition-colors hover:border-[var(--color-border-strong)]",
          open && "border-[var(--color-navy-600)] ring-2 ring-[var(--color-navy-600)]/10",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon}
        <span>{current?.label}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-[var(--color-ink-400)] transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className="animate-fade-in absolute left-0 z-40 mt-1.5 min-w-[180px] overflow-hidden rounded-lg border border-[var(--color-border)] bg-white py-1 shadow-lg"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--color-bg)]",
                opt.value === value
                  ? "font-medium text-[var(--color-navy-900)]"
                  : "text-[var(--color-ink-700)]",
              )}
            >
              {opt.label}
              {opt.value === value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
