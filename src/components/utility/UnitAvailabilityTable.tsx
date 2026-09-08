import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { statusHigherIsBetter } from "@/lib/calculations";

interface UnitRow {
  id: string;
  name: string;
  availabilityPct: number;
}

/**
 * Generic per-unit availability table for compressors / vacuum pumps.
 * Overall availability is the PRODUCT of these rows (series-line model, see
 * utilityGenerator.ts) - shown here alongside for comparison, never averaged.
 */
export function UnitAvailabilityTable({
  title,
  description,
  units,
  overallPct,
  targetPct,
  onSelectUnit,
}: {
  title: string;
  description: string;
  units: UnitRow[];
  overallPct: number;
  targetPct: number;
  onSelectUnit: (id: string) => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <div className="mb-1 flex items-baseline justify-between">
          <SectionHeading title={title} description={description} />
          <div className="text-right">
            <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {overallPct.toFixed(1)}%
            </div>
            <div className="text-[11px] text-[var(--color-ink-400)]">Target {targetPct.toFixed(0)}% · product of units</div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Unit</th>
              <th className="px-3 py-2.5 text-right font-semibold">Availability</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {units.map((u) => (
              <tr
                key={u.id}
                onClick={() => onSelectUnit(u.id)}
                className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70"
              >
                <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{u.name}</td>
                <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                  {u.availabilityPct.toFixed(1)}%
                </td>
                <td className="px-3 py-3 pr-5 text-right">
                  <StatusBadge status={statusHigherIsBetter(u.availabilityPct, targetPct, 3, 0.5)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
