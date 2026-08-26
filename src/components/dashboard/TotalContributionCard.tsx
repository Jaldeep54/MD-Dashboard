"use client";

import { ArrowDown, ArrowUp, ChevronRight, TrendingUp } from "lucide-react";
import { CardButton } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { cn } from "@/lib/utils";

export function TotalContributionCard({
  totalCr,
  periodLabel,
  scopeLabel,
  periodDeltaPct,
  onClick,
}: {
  totalCr: number;
  periodLabel: string;
  scopeLabel: string;
  periodDeltaPct: number;
  onClick?: () => void;
}) {
  return (
    <CardButton
      onClick={onClick}
      className="group flex w-full cursor-pointer flex-col justify-between gap-3 rounded-xl border border-[var(--color-navy-900)] bg-gradient-to-br from-[var(--color-navy-900)] to-[var(--color-navy-800)] p-4 text-left shadow-[0_4px_16px_rgba(10,22,40,0.25)] transition-transform hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-white/50" />
          <span className="text-[12.5px] font-medium text-white/70">Total Contribution</span>
          <InfoTooltip text="Total Realised Value minus Total Manufacturing Cost for the selected scope and period." />
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-white/30 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="flex items-end justify-between">
        <span className="text-[30px] font-bold tracking-tight text-white tabular-nums">
          ₹{totalCr.toFixed(2)} Cr
        </span>
        <div
          className={cn(
            "flex items-center gap-0.5 pb-1.5 text-[11px] font-medium",
            periodDeltaPct >= 0 ? "text-emerald-300" : "text-red-300",
          )}
        >
          {periodDeltaPct >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(periodDeltaPct).toFixed(1)}%
        </div>
      </div>

      <div className="text-[12px] text-white/45">
        {scopeLabel} · {periodLabel}
      </div>
    </CardButton>
  );
}
