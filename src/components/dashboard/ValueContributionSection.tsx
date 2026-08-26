import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import {
  formatCr,
  formatRupeePerW,
  formatSigned,
  statusHigherIsBetter,
} from "@/lib/calculations";
import type { ContributionMetrics, TrendPoint, ValueMetrics } from "@/types/dashboard";

export function ValueContributionSection({
  value,
  contribution,
  valueTrend,
  contributionTrend,
  totalContributionTrend,
}: {
  value: ValueMetrics;
  contribution: ContributionMetrics;
  valueTrend: TrendPoint[];
  contributionTrend: TrendPoint[];
  totalContributionTrend: TrendPoint[];
}) {
  const valueStatus = statusHigherIsBetter(value.actualPerW, value.targetPerW, 2);
  const contributionStatus = statusHigherIsBetter(contribution.perW, contribution.targetPerW, 3);

  return (
    <PageSection title="Value & Contribution" description="The plant's financial conclusion — realisation, margin, and total contribution.">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-1 flex items-center justify-between">
            <SectionHeading title="Realised Value/W" description="Total Realised Sales Value ÷ Good Saleable Watts Sold." />
            <StatusBadge status={valueStatus} />
          </div>
          <div className="mb-3 flex items-end gap-3">
            <span className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
              {formatRupeePerW(value.actualPerW)}
            </span>
            <span className="pb-1 text-[13px] text-[var(--color-ink-500)]">
              Target {formatRupeePerW(value.targetPerW)} · {formatSigned(value.variancePerW, (v) => formatRupeePerW(v))}
            </span>
          </div>
          <TrendLineChart data={valueTrend} formatter={(v) => formatRupeePerW(v)} color="var(--color-info-solid)" height={190} />
        </Card>

        <Card>
          <div className="mb-1 flex items-center justify-between">
            <SectionHeading title="Contribution/W" description="Realised Value/W − Manufacturing Cost/W." />
            <StatusBadge status={contributionStatus} />
          </div>
          <div className="mb-3 flex items-end gap-3">
            <span className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
              {formatRupeePerW(contribution.perW)}
            </span>
            <span className="pb-1 text-[13px] text-[var(--color-ink-500)]">
              Target {formatRupeePerW(contribution.targetPerW)} ·{" "}
              {formatSigned(contribution.variancePerW, (v) => formatRupeePerW(v))}
            </span>
          </div>
          <TrendLineChart
            data={contributionTrend}
            formatter={(v) => formatRupeePerW(v)}
            color="var(--color-positive-solid)"
            height={190}
          />
        </Card>
      </div>

      <Card className="mt-4">
        <SectionHeading
          title="Total Contribution Trend"
          description={`Aggregate contribution across the period — currently ${formatCr(contribution.totalCr)}.`}
        />
        <TrendLineChart
          data={totalContributionTrend}
          formatter={(v) => formatCr(v)}
          color="var(--color-navy-900)"
        />
      </Card>
    </PageSection>
  );
}
