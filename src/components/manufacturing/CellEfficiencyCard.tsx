import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { statusHigherIsBetter } from "@/lib/calculations";
import { formatSigned } from "@/lib/calculations";
import type { CellEfficiencyData } from "@/types/manufacturing";

export function CellEfficiencyCard({ efficiency }: { efficiency: CellEfficiencyData }) {
  const status = statusHigherIsBetter(efficiency.avgPct, efficiency.targetPct, 1, 0.3);

  return (
    <Card>
      <div className="mb-1 flex items-center justify-between">
        <SectionHeading title="Cell Efficiency" description="Average cell electrical conversion efficiency." />
        <StatusBadge status={status} />
      </div>
      <div className="mb-4 flex items-end gap-3">
        <span className="text-[28px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">
          {efficiency.avgPct.toFixed(2)}%
        </span>
        <span className="pb-1 text-[13px] text-[var(--color-ink-500)]">
          Target {efficiency.targetPct.toFixed(2)}% · {formatSigned(efficiency.variancePct, (v) => `${v.toFixed(2)}%`)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {efficiency.byLine.map((l) => (
          <div key={l.id} className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5">
            <div className="text-[11px] font-medium text-[var(--color-ink-500)]">{l.name}</div>
            <div className="text-[15px] font-semibold tabular-nums text-[var(--color-ink-900)]">
              {l.valuePct.toFixed(2)}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
