import { Card, SectionHeading } from "@/components/ui/Card";
import { formatPct } from "@/lib/calculations";
import type { GasTypeRow } from "@/types/utility";

/** Generic by-type cost table, configurable purely by the rows passed in
 * (GAS_TYPES / CHEMICAL_TYPES style arrays) - no gas- or chemical-specific
 * logic lives here. */
export function GasTypeTable({
  title,
  description,
  rows,
  totalCostCr,
}: {
  title: string;
  description: string;
  rows: GasTypeRow[];
  totalCostCr: number;
}) {
  const sorted = [...rows].sort((a, b) => b.costRs - a.costRs);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <div className="mb-1 flex items-baseline justify-between">
          <SectionHeading title={title} description={description} />
          <div className="text-right">
            <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
              ₹{totalCostCr.toFixed(3)} Cr
            </div>
            <div className="text-[11px] text-[var(--color-ink-400)]">Total cost this period</div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 text-right font-semibold">Consumption</th>
              <th className="px-3 py-2.5 text-right font-semibold">Cost</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">% of Cost</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.key} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.label}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                  {row.consumption.toLocaleString("en-IN", { maximumFractionDigits: 1 })} {row.unit}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                  ₹{(row.costRs / 1000).toFixed(1)}k
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
  );
}
