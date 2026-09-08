"use client";

import { Card, CardButton, PageSection, SectionHeading } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { WaterBalanceFlow } from "@/components/utility/WaterBalanceFlow";
import { formatCr, formatPct, formatRupeePerW, statusHigherIsBetter, statusLowerIsBetter } from "@/lib/calculations";
import { formatKL } from "@/lib/utilityCalculations";
import type { WaterMetrics } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

function SubsystemCard({
  title,
  status,
  rows,
  onClick,
}: {
  title: string;
  status: "good" | "watch" | "critical";
  rows: { label: string; value: string }[];
  onClick: () => void;
}) {
  return (
    <CardButton onClick={onClick} className="block cursor-pointer">
      <Card className="h-full transition-all hover:border-[var(--color-border-strong)] hover:shadow-md">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-[var(--color-ink-900)]">{title}</h3>
          <StatusBadge status={status} />
        </div>
        <div className="flex flex-col gap-1.5">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between text-[12.5px]">
              <span className="text-[var(--color-ink-500)]">{r.label}</span>
              <span className="font-medium tabular-nums text-[var(--color-ink-900)]">{r.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </CardButton>
  );
}

export function WaterSystemSection({
  water,
  onOpenDrawer,
}: {
  water: WaterMetrics;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const roStatus = statusHigherIsBetter(water.ro.recoveryPct, water.ro.recoveryTargetPct, 5, 1);
  const upwStatus = statusHigherIsBetter(water.upw.resistivityMOhmCm, water.upw.resistivityTargetMOhmCm, 8, 2);
  const coolingStatus = statusHigherIsBetter(water.cooling.availabilityPct, water.cooling.availabilityTargetPct, 2, 0.5);
  const etpStatus = statusHigherIsBetter(water.etp.availabilityPct, water.etp.availabilityTargetPct, 2, 0.5);
  const waterCostStatus = statusLowerIsBetter(water.costPerW, water.costPerWTarget, 8);

  return (
    <PageSection
      id="water"
      title="Water System"
      description="Feed / RO / DM → UPW / DI → Cooling Water → ETP — one balance from fresh water intake to recycled/discharged water."
    >
      <Card className="mb-4">
        <div className="mb-3 flex items-baseline justify-between">
          <SectionHeading title="Water Balance" description="Fresh water intake through to ETP recovery." />
          <div className="text-right">
            <div className="text-[20px] font-bold tabular-nums text-[var(--color-ink-900)]">
              {formatRupeePerW(water.costPerW)}
            </div>
            <div className="flex items-center justify-end gap-1.5 text-[11px] text-[var(--color-ink-400)]">
              Cost/W · <StatusBadge status={waterCostStatus} />
            </div>
          </div>
        </div>
        <WaterBalanceFlow water={water} />
      </Card>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <SubsystemCard
          title="RO / DM"
          status={roStatus}
          onClick={() => onOpenDrawer({ type: "ro" })}
          rows={[
            { label: "Feed", value: formatKL(water.ro.feedKL) },
            { label: "Recovery %", value: formatPct(water.ro.recoveryPct) },
            { label: "Reject %", value: formatPct(water.ro.rejectPct) },
          ]}
        />
        <SubsystemCard
          title="UPW / DI"
          status={upwStatus}
          onClick={() => onOpenDrawer({ type: "upw" })}
          rows={[
            { label: "Consumption", value: formatKL(water.upw.consumptionKL) },
            { label: "Resistivity", value: `${water.upw.resistivityMOhmCm.toFixed(1)} MΩ·cm` },
            { label: "TOC", value: `${water.upw.tocPpb.toFixed(1)} ppb` },
          ]}
        />
        <SubsystemCard
          title="Cooling Water"
          status={coolingStatus}
          onClick={() => onOpenDrawer({ type: "cooling" })}
          rows={[
            { label: "Circulation", value: formatKL(water.cooling.circulationKL) },
            { label: "Cycles of Conc.", value: water.cooling.cyclesOfConcentration.toFixed(1) },
            { label: "Availability", value: formatPct(water.cooling.availabilityPct, 1) },
          ]}
        />
        <SubsystemCard
          title="ETP"
          status={etpStatus}
          onClick={() => onOpenDrawer({ type: "etp" })}
          rows={[
            { label: "Inlet", value: formatKL(water.etp.inletKL) },
            { label: "Recovery %", value: formatPct(water.etp.recoveryPct) },
            { label: "Chemical Use", value: `${water.etp.chemicalConsumptionKg.toFixed(0)} kg` },
          ]}
        />
      </div>

      <div className="mt-3 text-[11.5px] text-[var(--color-ink-400)]">
        Total Water cost this period: {formatCr(water.totalCostCr, 3)}
      </div>
    </PageSection>
  );
}
