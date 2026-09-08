import { ArrowRight } from "lucide-react";
import { formatPct } from "@/lib/calculations";
import { formatKL } from "@/lib/utilityCalculations";
import type { WaterMetrics } from "@/types/utility";

/** Water balance flow diagram, structured like YieldFlow.tsx: Fresh Water
 * Intake -> RO (Feed/DM) -> UPW/DI Consumption -> ETP Inlet -> Recovery. */
export function WaterBalanceFlow({ water }: { water: WaterMetrics }) {
  const status = water.etp.recoveryPct >= water.etp.availabilityTargetPct - 30 ? "good" : "watch";

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <FlowNode label="Fresh Water Intake" value={formatKL(water.freshWaterIntakeKL)} sub="RO feed" />
      <FlowArrow />
      <FlowNode
        label="RO Product"
        value={formatKL(water.ro.productKL)}
        sub={`Reject ${formatKL(water.ro.rejectKL)}`}
      />
      <FlowArrow />
      <FlowNode label="UPW / DI Consumption" value={formatKL(water.upw.consumptionKL)} sub="wet process use" />
      <FlowArrow />
      <FlowNode label="ETP Inlet" value={formatKL(water.etp.inletKL)} sub="reject + makeup streams" />
      <FlowArrow />
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-center">
        <div className="text-[11.5px] font-medium text-[var(--color-ink-500)]">ETP Recovery</div>
        <div
          className={
            "text-[24px] font-bold tabular-nums tracking-tight " +
            (status === "good" ? "text-[var(--color-positive-text)]" : "text-[var(--color-warning-text)]")
          }
        >
          {formatPct(water.etp.recoveryPct)}
        </div>
        <div className="text-[11px] text-[var(--color-ink-400)]">Recycled {formatKL(water.etp.recycledKL)}</div>
      </div>
    </div>
  );
}

function FlowNode({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-center">
      <div className="text-[11.5px] font-medium text-[var(--color-ink-500)]">{label}</div>
      <div className="text-[18px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      <div className="text-[11px] text-[var(--color-ink-400)]">{sub}</div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex shrink-0 items-center justify-center py-1 sm:py-0">
      <ArrowRight className="h-4 w-4 rotate-90 text-[var(--color-ink-300)] sm:rotate-0" />
    </div>
  );
}
