import { Card, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { EquipmentAvailabilityData } from "@/types/manufacturing";

export function EquipmentAvailabilityTable({ data }: { data: EquipmentAvailabilityData }) {
  const sorted = [...data.byEquipment].sort((a, b) => a.availabilityPct - b.availabilityPct);

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="p-5 pb-0">
        <div className="mb-1 flex items-baseline justify-between">
          <SectionHeading
            title="Equipment Availability"
            description="Uptime by equipment, with downtime split into breakdown, planned maintenance and other."
          />
          <div className="text-right">
            <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {data.overallPct.toFixed(1)}%
            </div>
            <div className="text-[11px] text-[var(--color-ink-400)]">Target {data.targetPct.toFixed(0)}%</div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[13px]">
          <thead>
            <tr className="border-y border-[var(--color-border)] bg-[var(--color-bg)]/60 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--color-ink-500)]">
              <th className="px-5 py-2.5 font-semibold">Equipment</th>
              <th className="px-3 py-2.5 text-right font-semibold">Availability</th>
              <th className="px-3 py-2.5 font-semibold">Downtime Split</th>
              <th className="px-3 py-2.5 pr-5 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((eq) => {
              const down = 100 - eq.availabilityPct;
              return (
                <tr key={eq.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-bg)]/70">
                  <td className="px-5 py-3 font-medium text-[var(--color-ink-900)]">{eq.name}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-[var(--color-ink-900)]">
                    {eq.availabilityPct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-3">
                    {down > 0.05 ? (
                      <div className="flex h-2 w-full max-w-[160px] overflow-hidden rounded-full bg-[var(--color-bg)]">
                        <div
                          className="h-full bg-[var(--color-critical-solid)]"
                          style={{ width: `${(eq.downtime.breakdownPct / down) * 100}%` }}
                          title={`Breakdown: ${eq.downtime.breakdownPct.toFixed(1)} pts`}
                        />
                        <div
                          className="h-full bg-[var(--color-warning-solid)]"
                          style={{ width: `${(eq.downtime.plannedMaintenancePct / down) * 100}%` }}
                          title={`Planned maintenance: ${eq.downtime.plannedMaintenancePct.toFixed(1)} pts`}
                        />
                        <div
                          className="h-full bg-[var(--color-ink-300)]"
                          style={{ width: `${(eq.downtime.otherPct / down) * 100}%` }}
                          title={`Other: ${eq.downtime.otherPct.toFixed(1)} pts`}
                        />
                      </div>
                    ) : (
                      <span className="text-[11.5px] text-[var(--color-ink-400)]">No downtime</span>
                    )}
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <StatusBadge status={eq.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-5 py-3 text-[11.5px] text-[var(--color-ink-500)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-critical-solid)]" /> Breakdown
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-warning-solid)]" /> Planned Maintenance
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--color-ink-300)]" /> Other
        </span>
      </div>
    </Card>
  );
}
