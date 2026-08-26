"use client";

import { ArrowDown, ArrowUp, ChevronRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { CardButton } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StatusDot } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { Status } from "@/types/dashboard";

interface KPICardProps {
  title: string;
  definition: string;
  value: string;
  unitNote?: string;
  target: string;
  varianceLabel: string;
  status: Status;
  progressPct?: number;
  targetMarkerPct?: number;
  periodDeltaPct?: number;
  /** Whether a positive period-over-period delta is good news. False for cost (lower is better). */
  deltaPositiveIsGood?: boolean;
  onClick?: () => void;
  emphasis?: "primary" | "compact";
  icon?: ReactNode;
}

export function KPICard({
  title,
  definition,
  value,
  unitNote,
  target,
  varianceLabel,
  status,
  progressPct,
  targetMarkerPct,
  periodDeltaPct,
  deltaPositiveIsGood = true,
  onClick,
  emphasis = "primary",
  icon,
}: KPICardProps) {
  const varianceColor =
    status === "good"
      ? "text-[var(--color-positive-text)]"
      : status === "watch"
        ? "text-[var(--color-warning-text)]"
        : "text-[var(--color-critical-text)]";

  return (
    <CardButton
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:border-[var(--color-border-strong)] hover:shadow-md",
        emphasis === "primary" ? "gap-3" : "gap-2",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[12.5px] font-medium text-[var(--color-ink-500)]">{title}</span>
          <InfoTooltip text={definition} />
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-[var(--color-ink-300)] opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-bold tabular-nums text-[var(--color-ink-900)] tracking-tight",
              emphasis === "primary" ? "text-[28px]" : "text-[22px]",
            )}
          >
            {value}
          </span>
          {unitNote && <span className="text-[12px] text-[var(--color-ink-400)]">{unitNote}</span>}
        </div>
        {periodDeltaPct !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 pb-1 text-[11px] font-medium",
              periodDeltaPct === 0
                ? "text-[var(--color-ink-400)]"
                : (periodDeltaPct > 0) === deltaPositiveIsGood
                  ? "text-[var(--color-positive-text)]"
                  : "text-[var(--color-critical-text)]",
            )}
          >
            {periodDeltaPct === 0 ? (
              <Minus className="h-3 w-3" />
            ) : periodDeltaPct > 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(periodDeltaPct).toFixed(1)}%
          </div>
        )}
      </div>

      {progressPct !== undefined && (
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-bg)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              status === "good"
                ? "bg-[var(--color-positive-solid)]"
                : status === "watch"
                  ? "bg-[var(--color-warning-solid)]"
                  : "bg-[var(--color-critical-solid)]",
            )}
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
          {targetMarkerPct !== undefined && (
            <div
              className="absolute top-0 h-full w-[2px] bg-[var(--color-navy-900)]/40"
              style={{ left: `${Math.min(100, targetMarkerPct)}%` }}
            />
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[12px]">
        <span className="text-[var(--color-ink-500)]">Target {target}</span>
        <span className={cn("flex items-center gap-1 font-medium", varianceColor)}>
          <StatusDot status={status} />
          {varianceLabel}
        </span>
      </div>
    </CardButton>
  );
}
