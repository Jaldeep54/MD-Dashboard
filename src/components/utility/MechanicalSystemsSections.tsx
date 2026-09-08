"use client";

import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UnitAvailabilityTable } from "@/components/utility/UnitAvailabilityTable";
import { formatPct, statusHigherIsBetter } from "@/lib/calculations";
import { formatMWh } from "@/lib/utilityCalculations";
import type { CompressedAirMetrics, HVACMetrics, VacuumMetrics } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

function StatBlock({ label, definition, value, sub }: { label: string; definition?: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[var(--color-ink-500)]">{label}</span>
        {definition && <InfoTooltip text={definition} />}
      </div>
      <div className="text-[19px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-400)]">{sub}</div>}
    </div>
  );
}

export function HVACSection({
  hvac,
  onOpenDrawer,
}: {
  hvac: HVACMetrics;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const availStatus = statusHigherIsBetter(hvac.availabilityPct, hvac.availabilityTargetPct, 2, 0.5);
  return (
    <PageSection id="hvac" title="HVAC" description="Cleanroom conditioning — power consumption is read from the Plant Power Breakdown's HVAC row, never regenerated.">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionHeading title="HVAC Performance" description="Chilled water, cleanroom conditions and availability." />
          <StatusBadge status={availStatus} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBlock label="Consumption" definition="Sourced from the Plant Power Breakdown's HVAC row." value={formatMWh(hvac.consumptionMWh)} />
          <StatBlock label="Cooling Load" value={`${hvac.coolingLoadTR.toFixed(0)} TR`} />
          <StatBlock
            label="Chilled Water Supply/Return"
            value={`${hvac.chilledWaterSupplyTempC.toFixed(1)}°C / ${hvac.chilledWaterReturnTempC.toFixed(1)}°C`}
          />
          <StatBlock
            label="Availability"
            value={formatPct(hvac.availabilityPct, 1)}
            sub={`Target ${formatPct(hvac.availabilityTargetPct, 1)}`}
          />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <StatBlock label="Cleanroom Temp Deviation" value={`± ${hvac.cleanroomTempDeviationC.toFixed(2)}°C`} />
          <StatBlock label="Cleanroom RH Deviation" value={`± ${hvac.cleanroomRHDeviationPct.toFixed(1)}%`} />
        </div>
        <button
          type="button"
          onClick={() => onOpenDrawer({ type: "hvac" })}
          className="mt-3 text-[12.5px] font-medium text-[var(--color-navy-700)] hover:underline"
        >
          View HVAC detail →
        </button>
      </Card>
    </PageSection>
  );
}

export function CompressedAirSection({
  compressedAir,
  onOpenDrawer,
}: {
  compressedAir: CompressedAirMetrics;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  return (
    <PageSection
      id="compressedAir"
      title="Compressed Air"
      description="Plant instrument/process air — power read from the Plant Power Breakdown's Compressed Air row; overall availability is the product of each compressor's availability (series-line model), never an average."
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Consumption" value={formatMWh(compressedAir.consumptionMWh)} />
        <StatBlock label="Generation" value={`${(compressedAir.generationNm3 / 1000).toFixed(1)}k Nm³`} />
        <StatBlock label="Specific Power" value={`${compressedAir.specificPowerKwPerNm3Min.toFixed(2)} kW/Nm³/min`} />
        <StatBlock label="Dew Point / Leakage" value={`${compressedAir.dewPointC.toFixed(0)}°C / ${compressedAir.leakagePct.toFixed(1)}%`} />
      </div>
      <UnitAvailabilityTable
        title="Compressor Availability"
        description="Each unit's availability, and the plant-level figure computed as their product."
        units={compressedAir.compressors}
        overallPct={compressedAir.availabilityPct}
        targetPct={compressedAir.availabilityTargetPct}
        onSelectUnit={(id) => onOpenDrawer({ type: "equipment-row", area: "compressedAir", id })}
      />
    </PageSection>
  );
}

export function VacuumSection({
  vacuum,
  onOpenDrawer,
}: {
  vacuum: VacuumMetrics;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  return (
    <PageSection
      id="vacuum"
      title="Vacuum"
      description="PECVD / LPCVD / ALD vacuum pumps — power is a documented sub-share of the Process Equipment row (see PROCESS_EQUIPMENT_VACUUM_SHARE_PCT), not a competing breakdown row."
    >
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Consumption" definition="A carved-out sub-share of Process Equipment power, not independently generated." value={formatMWh(vacuum.consumptionMWh)} />
        <StatBlock label="Vacuum Level" value={`${vacuum.vacuumLevelMbar.toFixed(2)} mbar`} sub={`Target ${vacuum.vacuumLevelTargetMbar.toFixed(2)} mbar`} />
        <StatBlock label="Pump-down Time" value={`${vacuum.pumpDownTimeSec.toFixed(0)} sec`} />
        <StatBlock label="Overall Availability" value={formatPct(vacuum.availabilityPct, 1)} sub={`Target ${formatPct(vacuum.availabilityTargetPct, 1)}`} />
      </div>
      <UnitAvailabilityTable
        title="Vacuum Pump Availability"
        description="Each pump's availability, and the plant-level figure computed as their product."
        units={vacuum.pumps}
        overallPct={vacuum.availabilityPct}
        targetPct={vacuum.availabilityTargetPct}
        onSelectUnit={(id) => onOpenDrawer({ type: "equipment-row", area: "vacuum", id })}
      />
    </PageSection>
  );
}
