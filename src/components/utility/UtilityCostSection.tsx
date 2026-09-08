import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCr, formatPct, formatRupeePerW } from "@/lib/calculations";
import type { UtilityCostSummary } from "@/types/utility";

export function UtilityCostSection({ cost }: { cost: UtilityCostSummary }) {
  const sorted = [...cost.rows].sort((a, b) => b.costCr - a.costCr);

  return (
    <PageSection
      id="cost"
      title="Utility Cost"
      description="Built by summing the per-utility costs computed above — never an independently generated total."
    >
      <Card padded={false} className="mb-4 overflow-hidden">
        <div className="p-5 pb-0">
          <div className="mb-1 flex items-baseline justify-between">
            <SectionHeading title="Cost by Utility" description="Electricity, Gases, Water, HVAC, Compressed Air, Vacuum, Chemicals and Other." />
            <div className="text-right">
              <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
                {formatCr(cost.totalCostCr, 3)}
              </div>
              <div className="text-[11px] text-[var(--color-ink-400)]">{formatRupeePerW(cost.totalCostPerW)}</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
                <th className="px-5 py-2.5 font-semibold">Utility</th>
                <th className="px-3 py-2.5 text-right font-semibold">Cost</th>
                <th className="px-3 py-2.5 pr-5 text-right font-semibold">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.key} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.label}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                    {formatCr(row.costCr, 3)}
                  </td>
                  <td className="px-3 py-3 pr-5 text-right font-medium tabular-nums text-[var(--color-ink-900)]">
                    {formatPct(row.pctOfTotal, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <SectionHeading
            title="Cost Reconciliation (dev check)"
            description="Cross-checks this rollup against the MD Dashboard's own COST_COMPONENTS shares for Power + Water + Gases + Chemicals — a genuine independent estimate, not expected to match exactly."
          />
          <StatusBadge status={cost.reconciliation.withinTolerance ? "good" : "watch"} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div className="text-[12px] font-medium text-[var(--color-ink-500)]">Utility Rollup</div>
            <div className="text-[18px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {formatRupeePerW(cost.reconciliation.utilityRollupPerW)}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div className="text-[12px] font-medium text-[var(--color-ink-500)]">MD Dashboard Allocation</div>
            <div className="text-[18px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {formatRupeePerW(cost.reconciliation.mdCostComponentsPerW)}
            </div>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div className="text-[12px] font-medium text-[var(--color-ink-500)]">Variance</div>
            <div className="text-[18px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {cost.reconciliation.variancePct >= 0 ? "+" : ""}
              {cost.reconciliation.variancePct.toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
    </PageSection>
  );
}
