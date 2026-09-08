import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPct } from "@/lib/calculations";
import type { UtilityAvailabilityRow } from "@/types/utility";

export function UtilityAvailabilitySection({
  availability,
  compositeAvailabilityPct,
}: {
  availability: UtilityAvailabilityRow[];
  compositeAvailabilityPct: number;
}) {
  const sorted = [...availability].sort((a, b) => a.actualPct - b.actualPct);

  return (
    <PageSection
      id="availability"
      title="Utility Availability"
      description="Power, Gas, UPW, Cooling, HVAC, Compressed Air, Vacuum and ETP — the composite score below is their product (series-line model), not an average."
    >
      <Card padded={false} className="overflow-hidden">
        <div className="p-5 pb-0">
          <div className="mb-1 flex items-baseline justify-between">
            <SectionHeading title="Availability by Utility" description="Sorted lowest first — the utilities most at risk of driving downtime." />
            <div className="text-right">
              <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
                {formatPct(compositeAvailabilityPct)}
              </div>
              <div className="text-[11px] text-[var(--color-ink-400)]">Composite (product of all rows)</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-[13px]">
            <thead>
              <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
                <th className="px-5 py-2.5 font-semibold">Utility</th>
                <th className="px-3 py-2.5 text-right font-semibold">Actual</th>
                <th className="px-3 py-2.5 text-right font-semibold">Target</th>
                <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr key={row.key} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.label}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                    {formatPct(row.actualPct, 1)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                    {formatPct(row.targetPct, 1)}
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageSection>
  );
}
