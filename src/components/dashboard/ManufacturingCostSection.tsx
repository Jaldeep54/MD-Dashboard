import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { CostBreakdownChart } from "@/components/dashboard/CostBreakdownChart";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { formatRupeePerW, formatSigned } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import type { CostMetrics, TrendPoint } from "@/types/dashboard";

export function ManufacturingCostSection({
  cost,
  costTrend,
}: {
  cost: CostMetrics;
  costTrend: TrendPoint[];
}) {
  const aboveTarget = cost.actualPerW > cost.targetPerW;

  return (
    <PageSection title="Manufacturing Cost" description="Cost per Watt, its components, and trend against target.">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="flex flex-col justify-between xl:col-span-2">
          <SectionHeading title="Manufacturing Cost/W" />
          <div className="flex items-end gap-2">
            <span className="text-[34px] font-bold tracking-tight text-[var(--color-ink-900)] tabular-nums">
              {formatRupeePerW(cost.actualPerW)}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-[var(--color-ink-500)]">
            Target {formatRupeePerW(cost.targetPerW)}
          </div>
          <div
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-[13px] font-medium",
              aboveTarget
                ? "border-[var(--color-critical-border)] bg-[var(--color-critical-bg)] text-[var(--color-critical-text)]"
                : "border-[var(--color-positive-border)] bg-[var(--color-positive-bg)] text-[var(--color-positive-text)]",
            )}
          >
            {aboveTarget ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {formatSigned(cost.variancePerW, (v) => formatRupeePerW(v))} · {aboveTarget ? "Above target" : "Below target"}
            </span>
          </div>
        </Card>

        <Card className="xl:col-span-3">
          <SectionHeading
            title="Cost Breakdown"
            description="₹/W contribution by cost component."
          />
          <CostBreakdownChart data={cost.breakdown} />
        </Card>
      </div>

      <Card className="mt-4">
        <SectionHeading title="Manufacturing Cost/W vs Target" description="Trend across the selected period." />
        <TrendLineChart data={costTrend} formatter={(v) => formatRupeePerW(v)} color="var(--color-navy-700)" />
      </Card>
    </PageSection>
  );
}
