"use client";

import { Factory, Gauge, PackageCheck, Target } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { statusHigherIsBetter } from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import { MfgCapacityWaterfall } from "@/components/manufacturing/MfgCapacityWaterfall";
import { MfgGradeSummary } from "@/components/manufacturing/MfgGradeSummary";
import { ProductionByLineTable } from "@/components/manufacturing/ProductionByLineTable";
import { ProductionTrendCard } from "@/components/manufacturing/ProductionTrendCard";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";
import type { ManufacturingData } from "@/types/manufacturing";

export function ProductionSection({
  data,
  onSelectLine,
  onOpenDrawer,
}: {
  data: ManufacturingData;
  onSelectLine: (lineId: string) => void;
  onOpenDrawer: (target: MfgDrawerTarget) => void;
}) {
  const { production, scopeLabel, periodLabel, filters } = data;
  const { grade, vsTarget, capacity } = production;
  const seed = `${filters.period}-${filters.date}-${filters.line}-${filters.cellType}`;

  const goodStatus = statusHigherIsBetter(grade.goodMW, grade.goodTargetMW, 4, 1.5);
  const vsTargetStatus = statusHigherIsBetter(vsTarget.actualMW, vsTarget.targetMW, 3);
  const capacityStatus = statusHigherIsBetter(capacity.utilizationPct, 93, 5, 2);

  return (
    <PageSection
      title="Production"
      description={`${scopeLabel} · ${periodLabel} — output volume, grade mix and attainment against target.`}
    >
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title="Good Cell Production"
          definition="Cells classified as the saleable/target grade, in MW and million cells."
          value={`${grade.goodMW.toFixed(1)} MW`}
          unitNote={`${grade.goodMn.toFixed(2)} Mn cells`}
          target={`${grade.goodTargetMW.toFixed(1)} MW`}
          varianceLabel={`${(grade.goodMW - grade.goodTargetMW >= 0 ? "+" : "")}${(grade.goodMW - grade.goodTargetMW).toFixed(1)} MW`}
          status={goodStatus}
          progressPct={Math.min(100, (grade.goodMW / grade.goodTargetMW) * 100)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-good`)}
          onClick={() => onOpenDrawer({ type: "production" })}
          icon={<PackageCheck className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Total Cell Output"
          definition="Good + Medium + Low cell production combined, in MW."
          value={`${grade.totalMW.toFixed(1)} MW`}
          unitNote={`${grade.totalMn.toFixed(2)} Mn cells`}
          target={`${vsTarget.targetMW.toFixed(1)} MW`}
          varianceLabel={`${grade.goodPct.toFixed(0)}% good grade`}
          status={vsTargetStatus}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-total`)}
          onClick={() => onOpenDrawer({ type: "production" })}
          icon={<Factory className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Production vs Target"
          definition="Actual total production against the management target for the selected period and scope."
          value={`${vsTarget.actualMW.toFixed(1)} MW`}
          target={`${vsTarget.targetMW.toFixed(1)} MW`}
          varianceLabel={`${vsTarget.achievementPct.toFixed(1)}% achieved`}
          status={vsTargetStatus}
          progressPct={Math.min(100, vsTarget.achievementPct)}
          targetMarkerPct={100}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-vstarget`)}
          onClick={() => onOpenDrawer({ type: "production" })}
          icon={<Target className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />

        <KPICard
          title="Capacity Utilization"
          definition="Actual Production ÷ Available Production Capacity × 100. Available capacity accounts for planned/unplanned downtime, so it can be lower than installed capacity."
          value={`${capacity.utilizationPct.toFixed(1)}%`}
          target="93.0%"
          varianceLabel={`${capacity.availableMW.toFixed(0)} MW available`}
          status={capacityStatus}
          progressPct={capacity.utilizationPct}
          targetMarkerPct={93}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-cap`)}
          onClick={() => onOpenDrawer({ type: "capacity" })}
          icon={<Gauge className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <div className="mb-4">
        <MfgGradeSummary grade={grade} seed={seed} />
      </div>

      <Card className="mb-4">
        <SectionHeading
          title="Capacity Breakdown"
          description="Installed → available → utilized, so availability and utilization problems can be told apart."
        />
        <MfgCapacityWaterfall capacity={capacity} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <ProductionByLineTable rows={production.byLine} selectedLine={filters.line} onSelectLine={onSelectLine} />
        </div>
        <div className="xl:col-span-3">
          <ProductionTrendCard vsTarget={vsTarget} seed={seed} />
        </div>
      </div>
    </PageSection>
  );
}
