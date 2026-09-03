import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ProcessParameterRow } from "@/types/manufacturing";

const STATUS_LABEL = { good: "Within Target", watch: "Warning", critical: "Out of Target" } as const;

export function ProcessPerformanceTable({ rows }: { rows: ProcessParameterRow[] }) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <SectionHeading
          title="Process Performance vs Target"
          description="Key process parameter per step, monitored against target and tolerance."
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Process</th>
              <th className="px-3 py-2.5 text-right font-semibold">Actual</th>
              <th className="px-3 py-2.5 text-right font-semibold">Target</th>
              <th className="px-3 py-2.5 text-right font-semibold">Tolerance</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{row.name}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                  {row.actual.toFixed(2)} {row.unit}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-500)]">
                  {row.target.toFixed(2)} {row.unit}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-400)]">
                  ± {row.tolerance.toFixed(2)}
                </td>
                <td className="px-3 py-3 pr-5 text-right">
                  <StatusBadge status={row.status} label={STATUS_LABEL[row.status]} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
