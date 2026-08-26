import { cn } from "@/lib/utils";
import type { Status } from "@/types/dashboard";

const STYLES: Record<Status, { bg: string; text: string; border: string; dot: string; label: string }> = {
  good: {
    bg: "bg-[var(--color-positive-bg)]",
    text: "text-[var(--color-positive-text)]",
    border: "border-[var(--color-positive-border)]",
    dot: "bg-[var(--color-positive-solid)]",
    label: "On Track",
  },
  watch: {
    bg: "bg-[var(--color-warning-bg)]",
    text: "text-[var(--color-warning-text)]",
    border: "border-[var(--color-warning-border)]",
    dot: "bg-[var(--color-warning-solid)]",
    label: "Watch",
  },
  critical: {
    bg: "bg-[var(--color-critical-bg)]",
    text: "text-[var(--color-critical-text)]",
    border: "border-[var(--color-critical-border)]",
    dot: "bg-[var(--color-critical-solid)]",
    label: "Attention",
  },
};

export function StatusBadge({ status, label, className }: { status: Status; label?: string; className?: string }) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        s.bg,
        s.text,
        s.border,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {label ?? s.label}
    </span>
  );
}

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  const s = STYLES[status];
  return <span className={cn("inline-block h-2 w-2 rounded-full", s.dot, className)} />;
}

export const STATUS_STYLES = STYLES;
