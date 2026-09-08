import { Card, SectionHeading } from "@/components/ui/Card";
import type { ChemicalLedgerRow } from "@/types/utility";

const CONSUMED_BY_META: { key: keyof ChemicalLedgerRow["consumedBy"]; label: string; color: string }[] = [
  { key: "process", label: "Process", color: "var(--color-navy-600)" },
  { key: "etp", label: "ETP", color: "var(--color-info-solid)" },
  { key: "coolingTreatment", label: "Cooling Treatment", color: "var(--color-warning-solid)" },
  { key: "other", label: "Other", color: "var(--color-ink-300)" },
];

/**
 * The single chemical ledger, rendered with its consumed-by dimension
 * (Process / ETP / Cooling Treatment / Other) - the same ledger ETP's
 * "ETP Chemical Consumption" figure is derived from, never a separate list.
 */
export function ChemicalLedgerTable({ ledger, totalCostCr }: { ledger: ChemicalLedgerRow[]; totalCostCr: number }) {
  const sorted = [...ledger].sort((a, b) => b.costRs - a.costRs);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <div className="mb-1 flex items-baseline justify-between">
          <SectionHeading
            title="Chemical Ledger"
            description="Configured in CHEMICAL_TYPES (utilityConstants.ts) - the same ledger feeds ETP Chemical Consumption below."
          />
          <div className="text-right">
            <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
              ₹{totalCostCr.toFixed(3)} Cr
            </div>
            <div className="text-[11px] text-[var(--color-ink-400)]">Total cost this period</div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Chemical</th>
              <th className="px-3 py-2.5 text-right font-semibold">Consumption</th>
              <th className="px-3 py-2.5 text-right font-semibold">Cost</th>
              <th className="px-3 py-2.5 pr-5 font-semibold">Consumed By</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.key} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.label}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-700)]">
                  {row.totalConsumption.toLocaleString("en-IN", { maximumFractionDigits: 0 })} {row.unit}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                  ₹{(row.costRs / 1000).toFixed(1)}k
                </td>
                <td className="px-3 py-3 pr-5">
                  <div className="flex h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-[var(--color-bg)]">
                    {CONSUMED_BY_META.map((m) => {
                      const pct = (row.consumedBy[m.key] / row.totalConsumption) * 100;
                      if (pct <= 0.05) return null;
                      return (
                        <div
                          key={m.key}
                          className="h-full"
                          style={{ width: `${pct}%`, background: m.color }}
                          title={`${m.label}: ${pct.toFixed(0)}%`}
                        />
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 py-3 text-[11.5px] text-[var(--color-ink-500)]">
        {CONSUMED_BY_META.map((m) => (
          <span key={m.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: m.color }} /> {m.label}
          </span>
        ))}
      </div>
    </Card>
  );
}
