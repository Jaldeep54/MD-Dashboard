"use client";

import { Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function InfoTooltip({ text, className }: { text: string; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Metric definition"
        className="text-[var(--color-ink-400)] transition-colors hover:text-[var(--color-ink-700)]"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="animate-fade-in absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border border-[var(--color-navy-900)] bg-[var(--color-navy-900)] px-3 py-2 text-[12px] leading-snug font-normal text-white shadow-lg"
        >
          {text}
          <span className="absolute top-full left-1/2 -mt-px h-2 w-2 -translate-x-1/2 rotate-45 bg-[var(--color-navy-900)]" />
        </span>
      )}
    </span>
  );
}
