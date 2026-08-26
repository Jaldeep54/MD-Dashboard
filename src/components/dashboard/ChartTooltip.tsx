import type { ReactNode } from "react";

export function ChartTooltipShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-w-[160px] rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 shadow-lg">
      <div className="mb-1.5 text-[12px] font-semibold text-[var(--color-ink-900)]">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function ChartTooltipRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-[12px]">
      <span className="flex items-center gap-1.5 text-[var(--color-ink-500)]">
        {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
        {label}
      </span>
      <span className="font-medium tabular-nums text-[var(--color-ink-900)]">{value}</span>
    </div>
  );
}
