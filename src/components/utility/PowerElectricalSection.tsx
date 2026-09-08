"use client";

import { AlertOctagon, Fuel, Gauge, Zap } from "lucide-react";
import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { KPICard } from "@/components/dashboard/KPICard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PlantPowerBreakdownChart } from "@/components/utility/PlantPowerBreakdownChart";
import {
  formatCr,
  formatPct,
  formatRupeePerW,
  formatSigned,
  statusHigherIsBetter,
  statusLowerIsBetter,
} from "@/lib/calculations";
import { formatMWh, formatUnitValue } from "@/lib/utilityCalculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import { BACKUP_AVAILABILITY_TARGET_PCT } from "@/lib/utilityConstants";
import type { PowerMetrics, UtilityFilters } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

function MiniStat({
  label,
  definition,
  value,
  status,
  sub,
}: {
  label: string;
  definition: string;
  value: string;
  status?: "good" | "watch" | "critical";
  sub?: string;
}) {
  return (
    <div className="flex-1 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[12px] font-medium text-[var(--color-ink-500)]">{label}</span>
          <InfoTooltip text={definition} />
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="text-[19px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] text-[var(--color-ink-400)]">{sub}</div>}
    </div>
  );
}

export function PowerElectricalSection({
  power,
  filters,
  onOpenDrawer,
}: {
  power: PowerMetrics;
  filters: UtilityFilters;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const seed = `${filters.period}-${filters.date}-power`;
  const costStatus = statusLowerIsBetter(power.costPerW, power.costPerWTarget, 5);
  const pfStatus = statusHigherIsBetter(power.powerFactorPct, power.powerFactorTargetPct, 3);
  const gridStatus = statusHigherIsBetter(power.gridAvailabilityPct, power.gridAvailabilityTargetPct, 2, 0.5);
  const backupStatus = statusHigherIsBetter(power.backupAvailabilityPct, BACKUP_AVAILABILITY_TARGET_PCT, 2, 0.5);

  return (
    <PageSection
      id="power"
      title="Power & Electrical"
      description="Grid power consumption, cost, quality (power factor, demand) and standby backup — the single source of truth for HVAC / Compressed Air / Vacuum power below."
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3.5">
            <KPICard
              title="Power Cost/W"
              definition="Total power cost divided by the same saleable production MW used by the MD Dashboard. Lower is better."
              value={formatRupeePerW(power.costPerW)}
              target={formatRupeePerW(power.costPerWTarget)}
              varianceLabel={`${formatSigned(power.costPerW - power.costPerWTarget, (v) => formatRupeePerW(v))} vs target`}
              status={costStatus}
              periodDeltaPct={periodOverPeriodDelta(`${seed}-cost`)}
              deltaPositiveIsGood={false}
              onClick={() => onOpenDrawer({ type: "power" })}
              icon={<Zap className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
            />
            <KPICard
              title="Power Factor"
              definition="Average power factor for the period. Below target risks a low-power-factor tariff penalty."
              value={formatPct(power.powerFactorPct, 1)}
              target={formatPct(power.powerFactorTargetPct, 0)}
              varianceLabel={formatSigned(power.powerFactorPct - power.powerFactorTargetPct, (v) => formatPct(v, 1))}
              status={pfStatus}
              progressPct={power.powerFactorPct}
              targetMarkerPct={power.powerFactorTargetPct}
              periodDeltaPct={periodOverPeriodDelta(`${seed}-pf`)}
              onClick={() => onOpenDrawer({ type: "power" })}
              icon={<Gauge className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
            />
            <KPICard
              title="Demand Penalty"
              definition="Excess-demand tariff penalty when Peak Demand exceeds Sanctioned Capacity, prorated to the selected period."
              value={power.demandPenaltyRs > 0 ? formatCr(power.demandPenaltyRs / 1e7, 3) : "₹0"}
              target="₹0"
              varianceLabel={`Peak ${power.peakDemandKVA.toFixed(0)} / Sanctioned ${power.sanctionedDemandKVA.toFixed(0)} kVA`}
              status={power.demandPenaltyRs > 0 ? "watch" : "good"}
              periodDeltaPct={periodOverPeriodDelta(`${seed}-penalty`)}
              deltaPositiveIsGood={false}
              onClick={() => onOpenDrawer({ type: "power" })}
              icon={<AlertOctagon className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
            />
            <KPICard
              title="DG Fuel Cost"
              definition="Standby diesel-generator fuel cost for the assumed backup duty cycle (see DG_PROFILE in utilityConstants.ts)."
              value={formatCr(power.dgFuelCostRs / 1e7, 4)}
              target="—"
              varianceLabel={`${power.dgFuelConsumptionLPerDay.toFixed(0)} L/day`}
              status="good"
              periodDeltaPct={periodOverPeriodDelta(`${seed}-dgfuel`)}
              deltaPositiveIsGood={false}
              onClick={() => onOpenDrawer({ type: "power" })}
              icon={<Fuel className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <MiniStat
              label="Total Consumption"
              definition="Total plant grid power consumption for the selected period, summed across the Plant Power Breakdown."
              value={formatMWh(power.totalConsumptionMWh)}
              sub={formatUnitValue(power.consumptionPerW, "kWh/W", 3)}
            />
            <MiniStat
              label="Grid Availability"
              definition="Percentage of the period the grid supply was available without interruption."
              value={formatPct(power.gridAvailabilityPct, 1)}
              status={gridStatus}
              sub={`Target ${formatPct(power.gridAvailabilityTargetPct, 1)}`}
            />
            <MiniStat
              label="Backup Availability"
              definition="Percentage of the period standby DG backup power was ready and available."
              value={formatPct(power.backupAvailabilityPct, 1)}
              status={backupStatus}
              sub={`Target ${formatPct(BACKUP_AVAILABILITY_TARGET_PCT, 1)}`}
            />
          </div>
        </div>

        <Card>
          <SectionHeading
            eyebrow="Single Source of Truth"
            title="Plant Power Breakdown"
            description="Every MWh consumed is allocated to exactly one row — HVAC, Compressed Air and Vacuum read their consumption from here rather than regenerating it."
          />
          <PlantPowerBreakdownChart data={power.breakdown} />
        </Card>
      </div>
    </PageSection>
  );
}
