"use client";

import { useState } from "react";
import { CapacityPerformanceSection } from "@/components/dashboard/CapacityPerformanceSection";
import { CellLinePerformanceTable } from "@/components/dashboard/CellLinePerformanceTable";
import { DetailDrawer } from "@/components/dashboard/DetailDrawer";
import { ExecutiveKPISection, type DrawerTarget } from "@/components/dashboard/ExecutiveKPISection";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { Header } from "@/components/dashboard/Header";
import { ManagementAttentionPanel } from "@/components/dashboard/ManagementAttentionPanel";
import { ManufacturingCostSection } from "@/components/dashboard/ManufacturingCostSection";
import { ProcessYieldSection } from "@/components/dashboard/ProcessYieldSection";
import { ProductionPerformanceSection } from "@/components/dashboard/ProductionPerformanceSection";
import { PageSection } from "@/components/ui/Card";
import { ValueContributionSection } from "@/components/dashboard/ValueContributionSection";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { ProductionUnit } from "@/lib/calculations";
import type { CellLineId } from "@/types/dashboard";

export default function Home() {
  const { filters, setFilters, data } = useDashboardData();
  const [drawerTarget, setDrawerTarget] = useState<DrawerTarget | null>(null);
  // Shared MW / Lacs toggle for Production Performance, Production vs Target,
  // Production Trend, and Cell Line Performance - one selection, not four.
  const [productionUnit, setProductionUnit] = useState<ProductionUnit>("mw");

  function handleSelectLine(lineId: string) {
    setDrawerTarget({ type: "line", lineId: lineId as CellLineId });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header lastUpdated={data.lastUpdated} alerts={data.alerts} />
      <FilterBar filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
        <ExecutiveKPISection data={data} onOpenDrawer={setDrawerTarget} />

        <ProductionPerformanceSection
          data={data}
          onSelectLine={handleSelectLine}
          unit={productionUnit}
          onUnitChange={setProductionUnit}
        />

        <CapacityPerformanceSection capacity={data.capacity} capacityTrend={data.capacityTrend} />

        <PageSection
          title="Cell Line Performance"
          description="Compare all lines side by side to identify which one needs management attention."
        >
          <CellLinePerformanceTable
            cellLines={data.cellLines}
            selectedLine={filters.line}
            onSelectLine={handleSelectLine}
            unit={productionUnit}
          />
        </PageSection>

        <ProcessYieldSection yieldMetrics={data.yieldMetrics} lossBreakdown={data.lossBreakdown} />

        <ManufacturingCostSection cost={data.cost} costTrend={data.costTrend} />

        <ValueContributionSection
          value={data.value}
          contribution={data.contribution}
          valueTrend={data.valueTrend}
          contributionTrend={data.contributionTrend}
          totalContributionTrend={data.totalContributionTrend}
        />

        <ManagementAttentionPanel alerts={data.alerts} />
      </main>

      <DetailDrawer
        target={drawerTarget}
        data={data}
        filters={filters}
        onClose={() => setDrawerTarget(null)}
      />
    </div>
  );
}
