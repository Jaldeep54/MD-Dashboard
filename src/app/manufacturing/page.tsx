"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { MfgFilterBar } from "@/components/manufacturing/MfgFilterBar";
import { ProcessFlowVisual } from "@/components/manufacturing/ProcessFlowVisual";
import { ProductionSection } from "@/components/manufacturing/ProductionSection";
import { MfgProcessYieldSection } from "@/components/manufacturing/MfgProcessYieldSection";
import { EquipmentPerformanceSection } from "@/components/manufacturing/EquipmentPerformanceSection";
import { MfgQualitySection } from "@/components/manufacturing/MfgQualitySection";
import { ManufacturingDetailDrawer } from "@/components/manufacturing/ManufacturingDetailDrawer";
import { ManagementAttentionPanel } from "@/components/dashboard/ManagementAttentionPanel";
import { useManufacturingData } from "@/hooks/useManufacturingData";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";

export default function ManufacturingPlantDashboard() {
  const { filters, setFilters, data } = useManufacturingData();
  const [drawerTarget, setDrawerTarget] = useState<MfgDrawerTarget | null>(null);

  function handleSelectLine(lineId: string) {
    setDrawerTarget({ type: "line", lineId });
  }

  function handleSelectStep(stepId: string) {
    setDrawerTarget({ type: "processStep", stepId });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header lastUpdated={data.lastUpdated} alerts={data.alerts} dashboardLabel="Manufacturing Plant Dashboard" />
      <MfgFilterBar filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
        <div className="mb-8">
          <ProcessFlowVisual steps={data.processFlow} onSelectStep={handleSelectStep} />
        </div>

        <ManagementAttentionPanel alerts={data.alerts} />

        <ProductionSection data={data} onSelectLine={handleSelectLine} onOpenDrawer={setDrawerTarget} />

        <MfgProcessYieldSection data={data} onOpenDrawer={setDrawerTarget} onSelectStep={handleSelectStep} />

        <EquipmentPerformanceSection equipment={data.equipment} onOpenDrawer={setDrawerTarget} />

        <MfgQualitySection data={data} onOpenDrawer={setDrawerTarget} />
      </main>

      <ManufacturingDetailDrawer
        target={drawerTarget}
        data={data}
        filters={filters}
        onClose={() => setDrawerTarget(null)}
        onSelectLine={handleSelectLine}
        onSelectStep={handleSelectStep}
      />
    </div>
  );
}
