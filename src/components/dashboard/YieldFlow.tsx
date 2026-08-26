import { ArrowRight } from "lucide-react";
import { formatPct } from "@/lib/calculations";
import type { YieldMetrics } from "@/types/dashboard";

export function YieldFlow({ yieldMetrics }: { yieldMetrics: YieldMetrics }) {
  const status = yieldMetrics.yieldPct >= yieldMetrics.yieldTargetPct ? "good" : "watch";

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <FlowNode label="Wafer Input" value={`${yieldMetrics.waferInputMn.toFixed(2)} Mn`} sub="wafers" />
      <FlowArrow />
      <FlowNode label="Processing" value="TOPCon Cell Line" sub="diffusion · texturing · metallization" muted />
      <FlowArrow />
      <FlowNode label="Cell Output" value={`${yieldMetrics.cellOutputMn.toFixed(2)} Mn`} sub="cells" />
      <FlowArrow />
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-center">
        <div className="text-[11.5px] font-medium text-[var(--color-ink-500)]">Process Yield</div>
        <div
          className={
            "text-[24px] font-bold tabular-nums tracking-tight " +
            (status === "good" ? "text-[var(--color-positive-text)]" : "text-[var(--color-warning-text)]")
          }
        >
          {formatPct(yieldMetrics.yieldPct)}
        </div>
        <div className="text-[11px] text-[var(--color-ink-400)]">Target {formatPct(yieldMetrics.yieldTargetPct)}</div>
      </div>
    </div>
  );
}

function FlowNode({
  label,
  value,
  sub,
  muted,
}: {
  label: string;
  value: string;
  sub: string;
  muted?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-1 flex-col items-center justify-center rounded-lg border px-4 py-3 text-center " +
        (muted
          ? "border-dashed border-[var(--color-border-strong)] bg-white"
          : "border-[var(--color-border)] bg-white")
      }
    >
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
