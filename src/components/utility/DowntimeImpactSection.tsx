import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { formatCr } from "@/lib/calculations";
import type { DowntimeImpactRow } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

export function DowntimeImpactSection({
  downtimeImpact,
  onOpenDrawer,
}: {
  downtimeImpact: DowntimeImpactRow[];
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const sorted = [...downtimeImpact].sort((a, b) => b.economicImpactCr - a.economicImpactCr);
  const totalImpactCr = sorted.reduce((acc, r) => acc + r.economicImpactCr, 0);

  return (
    <PageSection
      id="downtime"
      title="Utility-Driven Production Downtime & Economic Impact"
      description="For each utility below its availability target: implied downtime hours, estimated MW production impact, and the ₹ Cr economic impact at the MD Dashboard's Contribution/W for this period."
    >
      <Card padded={false} className="overflow-hidden">
        <div className="p-5 pb-0">
          <div className="mb-1 flex items-baseline justify-between">
            <SectionHeading title="Impact by Utility" description="Sorted by estimated ₹ Cr impact, highest first." />
            <div className="text-right">
              <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
                {formatCr(totalImpactCr, 3)}
              </div>
              <div className="text-[11px] text-[var(--color-ink-400)]">Total estimated impact</div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
                <th className="px-5 py-2.5 font-semibold">Utility</th>
                <th className="px-3 py-2.5 text-right font-semibold">Shortfall</th>
                <th className="px-3 py-2.5 text-right font-semibold">Downtime</th>
                <th className="px-3 py-2.5 text-right font-semibold">Lost Production</th>
                <th className="px-3 py-2.5 pr-5 text-right font-semibold">Economic Impact</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.key}
                  onClick={() => onOpenDrawer({ type: "downtime-impact", key: row.key })}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70"
                >
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.label}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {row.shortfallPct.toFixed(2)} pts
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {row.downtimeHours.toFixed(1)} hr
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                    {row.lostProductionMW.toFixed(3)} MW
                  </td>
                  <td className="px-3 py-3 pr-5 text-right font-semibold tabular-nums text-[var(--color-critical-text)]">
                    {formatCr(row.economicImpactCr, 3)}
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
