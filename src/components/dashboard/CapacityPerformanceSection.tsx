import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { CapacityTrendChart } from "@/components/dashboard/CapacityTrendChart";
import { CapacityWaterfall } from "@/components/dashboard/CapacityWaterfall";
import { formatPct, formatSigned, statusHigherIsBetter } from "@/lib/calculations";
import { STATUS_STYLES } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import type { CapacityMetrics, CapacityTrendPoint } from "@/types/dashboard";

function CapacityStat({
  label,
  definition,
  value,
  target,
}: {
  label: string;
  definition: string;
  value: number;
  target: number;
}) {
  const status = statusHigherIsBetter(value, target, 3);
  const s = STATUS_STYLES[status];
  return (
    <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[var(--color-ink-500)]">{label}</span>
        <InfoTooltip text={definition} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[22px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
          {formatPct(value)}
        </span>
        <span className={cn("text-[12px] font-medium", s.text)}>
          {formatSigned(value - target, (v) => formatPct(v, 1))}
        </span>
      </div>
      <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-400)]">Target {formatPct(target)}</div>
    </div>
  );
}

export function CapacityPerformanceSection({
  capacity,
  capacityTrend,
}: {
  capacity: CapacityMetrics;
  capacityTrend: CapacityTrendPoint[];
}) {
  return (
    <PageSection
      title="Capacity Performance"
      description="Theoretical → Available → Utilized → Actual: separating availability problems from utilization problems."
    >
      <Card className="mb-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <CapacityStat
            label="Capacity Availability %"
            definition="Available Capacity ÷ Theoretical Capacity × 100. Reflects planned/unplanned downtime."
            value={capacity.availabilityPct}
            target={capacity.availabilityTargetPct}
          />
          <CapacityStat
            label="Utilization of Available Capacity %"
            definition="Actual Production ÷ Available Capacity × 100. Reflects how well available capacity is used."
            value={capacity.utilizationOfAvailablePct}
            target={capacity.utilizationOfAvailableTargetPct}
          />
          <CapacityStat
            label="Overall Capacity Utilization %"
            definition="Actual Production ÷ Theoretical Capacity × 100. The combined effect of availability and utilization."
            value={capacity.overallUtilizationPct}
            target={capacity.overallUtilizationTargetPct}
          />
        </div>
        <CapacityWaterfall capacity={capacity} />
      </Card>

      <Card>
        <SectionHeading
          eyebrow="Trend"
          title="Capacity Performance Trend"
          description="Availability, utilization of available capacity, and overall utilization over the period."
        />
        <CapacityTrendChart data={capacityTrend} />
      </Card>
    </PageSection>
  );
}
