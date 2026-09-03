"use client";

import { AlertOctagon, Droplets, Recycle, Waves } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { LossBreakdownChart } from "@/components/dashboard/LossBreakdownChart";
import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { statusHigherIsBetter, statusLowerIsBetter } from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import { CellEfficiencyCard } from "@/components/manufacturing/CellEfficiencyCard";
import { ProcessStepYieldTable } from "@/components/manufacturing/ProcessStepYieldTable";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";
import type { ManufacturingData } from "@/types/manufacturing";

export function MfgProcessYieldSection({
  data,
  onOpenDrawer,
  onSelectStep,
}: {
  data: ManufacturingData;
  onOpenDrawer: (target: MfgDrawerTarget) => void;
  onSelectStep: (stepId: string) => void;
}) {
  const { waferToCellYield, waferBreakage, stepYields, cellEfficiency, processLoss } = data.processYield;
  const seed = `${data.filters.period}-${data.filters.date}-${data.filters.line}`;

  const yieldStatus = statusHigherIsBetter(waferToCellYield.pct, waferToCellYield.targetPct, 1.5, 0.5);
  const breakageStatus = statusLowerIsBetter(waferBreakage.pct, waferBreakage.targetPct, 0.5, 0.15);
  const lossStatus = statusLowerIsBetter(processLoss.totalPct, processLoss.targetPct, 0.6, 0.2);

  const breakageChartData = waferBreakage.byProcessStep.map((item) => ({
    category: item.label,
    quantity: Math.round(item.brokenWafersMn * 1_000_000),
    pctOfTotal: item.pctOfBreakage,
  }));

  const lossChartData = processLoss.categories.map((item) => ({
    category: item.label,
    quantity: Math.round(item.quantityMn * 1_000_000),
    pctOfTotal: item.pctOfLoss,
  }));

  return (
    <PageSection
      title="Process & Yield"
      description="Wafer-to-cell conversion, where breakage and process loss originate, and step-level performance."
    >
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Wafer-to-Cell Yield"
          definition="Usable Cell Output ÷ Wafer Input × 100 — the overall manufacturing conversion KPI."
          value={`${waferToCellYield.pct.toFixed(1)}%`}
          target={`${waferToCellYield.targetPct.toFixed(1)}%`}
          varianceLabel={`${waferToCellYield.waferInputMn.toFixed(2)} Mn in`}
          status={yieldStatus}
          progressPct={waferToCellYield.pct}
          targetMarkerPct={waferToCellYield.targetPct}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-yield`)}
          onClick={() => onOpenDrawer({ type: "yield" })}
          icon={<Waves className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Wafer Breakage"
          definition="Broken Wafers ÷ Wafer Input × 100 — physical breakage during handling and processing."
          value={`${waferBreakage.pct.toFixed(2)}%`}
          target={`${waferBreakage.targetPct.toFixed(1)}%`}
          varianceLabel={`${waferBreakage.brokenWafersMn.toFixed(3)} Mn wafers`}
          status={breakageStatus}
          progressPct={Math.min(100, (waferBreakage.targetPct / waferBreakage.pct) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-breakage`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "yield" })}
          icon={<AlertOctagon className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Process Loss / Scrap"
          definition="Non-breakage material lost or rejected during manufacturing (process rejection, contamination, electrical failure, visual and metallization defects)."
          value={`${processLoss.totalPct.toFixed(2)}%`}
          target={`${processLoss.targetPct.toFixed(1)}%`}
          varianceLabel="of wafer input"
          status={lossStatus}
          progressPct={Math.min(100, (processLoss.targetPct / processLoss.totalPct) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-loss`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "yield" })}
          icon={<Recycle className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Cell Efficiency"
          definition="Average electrical conversion efficiency of finished cells."
          value={`${cellEfficiency.avgPct.toFixed(2)}%`}
          target={`${cellEfficiency.targetPct.toFixed(2)}%`}
          varianceLabel={`${cellEfficiency.variancePct >= 0 ? "+" : ""}${cellEfficiency.variancePct.toFixed(2)}%`}
          status={statusHigherIsBetter(cellEfficiency.avgPct, cellEfficiency.targetPct, 1, 0.3)}
          progressPct={Math.min(100, (cellEfficiency.avgPct / cellEfficiency.targetPct) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-eff`)}
          onClick={() => onOpenDrawer({ type: "yield" })}
          icon={<Droplets className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <SectionHeading title="Wafer Breakage by Process Step" description="Where physical wafer breakage is concentrated." />
          <LossBreakdownChart data={breakageChartData} unitLabel="wafers" />
        </Card>
        <Card>
          <SectionHeading title="Process Loss / Scrap Breakdown" description="Non-breakage loss categories." />
          <LossBreakdownChart data={lossChartData} unitLabel="wafers" />
        </Card>
      </div>

      <div className="mb-4">
        <CellEfficiencyCard efficiency={cellEfficiency} />
      </div>

      <ProcessStepYieldTable steps={stepYields} onSelectStep={onSelectStep} />
    </PageSection>
  );
}
