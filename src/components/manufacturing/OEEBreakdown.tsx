import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { STATUS_STYLES } from "@/components/ui/StatusBadge";
import { statusHigherIsBetter } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { OEEData } from "@/types/manufacturing";

function Factor({ label, value, definition }: { label: string; value: number; definition: string }) {
  return (
    <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[var(--color-ink-500)]">{label}</span>
        <InfoTooltip text={definition} />
      </div>
      <span className="text-[20px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
        {value.toFixed(1)}%
      </span>
    </div>
  );
}

export function OEEBreakdown({ oee }: { oee: OEEData }) {
  const status = statusHigherIsBetter(oee.oeePct, oee.targetPct, 6, 2);
  const s = STATUS_STYLES[status];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] font-medium text-[var(--color-ink-500)]">Overall Equipment Effectiveness</span>
            <InfoTooltip text="OEE = Availability × Performance × Quality. A composite index of equipment effectiveness — distinct from Capacity Utilization." />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[34px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
              {oee.oeePct.toFixed(1)}%
            </span>
            <span className="text-[13px] text-[var(--color-ink-500)]">Target {oee.targetPct.toFixed(0)}%</span>
          </div>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[12px] font-medium", s.bg, s.text, s.border)}>
          {status === "good" ? "At Target" : status === "watch" ? "Below Target" : "Well Below Target"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Factor
          label="Availability"
          value={oee.availabilityPct}
          definition="Share of available production time the equipment was actually running, net of breakdowns and maintenance."
        />
        <Factor
          label="Performance"
          value={oee.performancePct}
          definition="Actual run rate versus the ideal/ nameplate rate while running."
        />
        <Factor
          label="Quality"
          value={oee.qualityPct}
          definition="Share of output that meets specification first time (First Pass Yield)."
        />
      </div>
    </div>
  );
}
