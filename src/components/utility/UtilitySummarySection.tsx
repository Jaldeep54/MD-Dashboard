"use client";

import { Activity, Gauge, IndianRupee, Zap } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { formatCr, formatPct, formatRupeePerW } from "@/lib/calculations";
import { formatUnitValue } from "@/lib/utilityCalculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import type { UtilityData } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function UtilitySummarySection({
  data,
  onOpenDrawer,
}: {
  data: UtilityData;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const { summary, scopeLabel, periodLabel, filters } = data;
  const seed = `${filters.period}-${filters.date}-util`;

  const availabilityStatus = summary.compositeAvailabilityPct >= 97 ? "good" : summary.compositeAvailabilityPct >= 93 ? "watch" : "critical";
  const costStatus = data.cost.reconciliation.withinTolerance ? "good" : "watch";

  return (
    <section id="overview" className="mb-8">
      <div className="mb-3.5">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--color-ink-500)]">
          Utility Executive Summary
        </h2>
        <p className="mt-0.5 text-[13px] text-[var(--color-ink-400)]">
          {scopeLabel} · {periodLabel} — cost and availability rolled up from Power, Gas, Water, HVAC, Compressed
          Air, Vacuum and Chemicals below.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KPICard
          title="Total Utility Cost/W"
          definition="Sum of the Power, Gas, Water and Chemicals Cost/W rows in the Utility Cost table, divided by the same saleable production MW as the MD Dashboard."
          value={formatRupeePerW(summary.totalUtilityCostPerW)}
          target={formatRupeePerW(data.cost.reconciliation.mdCostComponentsPerW)}
          varianceLabel={`${data.cost.reconciliation.variancePct >= 0 ? "+" : ""}${data.cost.reconciliation.variancePct.toFixed(0)}% vs MD allocation`}
          status={costStatus}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-costperw`)}
          deltaPositiveIsGood={false}
          onClick={() => scrollToSection("cost")}
          icon={<IndianRupee className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Total Utility Cost"
          definition="Total utility spend for the selected period and scope: Electricity, Gases, Water, HVAC, Compressed Air, Vacuum, Chemicals and Other."
          value={formatCr(summary.totalUtilityCostCr)}
          target="—"
          varianceLabel={`${data.cost.rows.length} cost rows`}
          status="good"
          periodDeltaPct={periodOverPeriodDelta(`${seed}-costcr`)}
          deltaPositiveIsGood={false}
          onClick={() => scrollToSection("cost")}
          icon={<IndianRupee className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Plant Power Consumption/W"
          definition="Total grid power consumption (kWh) divided by total saleable production Watts — the physical energy intensity of the plant."
          value={formatUnitValue(summary.plantPowerConsumptionPerW, "kWh/W", 3)}
          target={formatUnitValue(data.power.costPerWTarget / 8.2, "kWh/W", 3)}
          varianceLabel={formatPct((summary.plantPowerConsumptionPerW / (data.power.costPerWTarget / 8.2)) * 100, 0)}
          status={data.power.consumptionPerW <= (data.power.costPerWTarget / 8.2) * 1.05 ? "good" : "watch"}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-power`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "power" })}
          icon={<Zap className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Composite Utility Availability"
          definition="Multiplicative (series-line) combination of Power, Gas, UPW, Cooling, HVAC, Compressed Air, Vacuum and ETP availability — the odds every utility is simultaneously up."
          value={formatPct(summary.compositeAvailabilityPct)}
          target={formatPct(95)}
          varianceLabel={availabilityStatus === "good" ? "Within target" : "Below target"}
          status={availabilityStatus}
          progressPct={summary.compositeAvailabilityPct}
          targetMarkerPct={95}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-avail`)}
          onClick={() => scrollToSection("availability")}
          icon={<Gauge className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[var(--color-ink-400)]">
        <Activity className="h-3.5 w-3.5" />
        Production reference for this scope: {data.productionMW.toFixed(2)} MW saleable output · Contribution/W ₹
        {data.contributionPerW.toFixed(2)}
      </div>
    </section>
  );
}
