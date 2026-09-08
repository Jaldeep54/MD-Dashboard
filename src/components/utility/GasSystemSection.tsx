"use client";

import { Flame, Gauge } from "lucide-react";
import { PageSection } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { GasTypeTable } from "@/components/utility/GasTypeTable";
import { formatPct, formatRupeePerW, formatSigned, statusHigherIsBetter, statusLowerIsBetter } from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import type { GasMetrics, UtilityFilters } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

export function GasSystemSection({
  gas,
  filters,
  onOpenDrawer,
}: {
  gas: GasMetrics;
  filters: UtilityFilters;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const seed = `${filters.period}-${filters.date}-gas`;
  const costStatus = statusLowerIsBetter(gas.costPerW, gas.costPerWTarget, 8);
  const availStatus = statusHigherIsBetter(gas.availabilityPct, gas.availabilityTargetPct, 2, 0.5);

  return (
    <PageSection
      id="gas"
      title="Gas System"
      description="Process gases (N2, O2, Ar, SiH4, NH3, PH3) — a configurable by-type breakdown, same pattern as CELL_TYPES/PRODUCTION_LINES elsewhere in the app."
    >
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <KPICard
          title="Gas Cost/W"
          definition="Total process-gas cost divided by the same saleable production MW used across the dashboard. Lower is better."
          value={formatRupeePerW(gas.costPerW)}
          target={formatRupeePerW(gas.costPerWTarget)}
          varianceLabel={`${formatSigned(gas.costPerW - gas.costPerWTarget, (v) => formatRupeePerW(v))} vs target`}
          status={costStatus}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-cost`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "gas" })}
          icon={<Flame className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
        <KPICard
          title="Gas System Availability"
          definition="Percentage of the period the gas supply system was available without interruption to any process tool."
          value={formatPct(gas.availabilityPct, 1)}
          target={formatPct(gas.availabilityTargetPct, 1)}
          varianceLabel={formatSigned(gas.availabilityPct - gas.availabilityTargetPct, (v) => formatPct(v, 1))}
          status={availStatus}
          progressPct={gas.availabilityPct}
          targetMarkerPct={gas.availabilityTargetPct}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-avail`)}
          onClick={() => onOpenDrawer({ type: "gas" })}
          icon={<Gauge className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <GasTypeTable
        title="Consumption by Gas Type"
        description="Configured in GAS_TYPES (utilityConstants.ts) — add a gas type there and it appears here automatically."
        rows={gas.byType}
        totalCostCr={gas.totalCostCr}
      />
    </PageSection>
  );
}
