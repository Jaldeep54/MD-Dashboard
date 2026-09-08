"use client";

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { ManagementAttentionPanel } from "@/components/dashboard/ManagementAttentionPanel";
import { UtilityFilterBar } from "@/components/utility/UtilityFilterBar";
import { UtilitySummarySection } from "@/components/utility/UtilitySummarySection";
import { PowerElectricalSection } from "@/components/utility/PowerElectricalSection";
import { GasSystemSection } from "@/components/utility/GasSystemSection";
import { WaterSystemSection } from "@/components/utility/WaterSystemSection";
import { HVACSection, CompressedAirSection, VacuumSection } from "@/components/utility/MechanicalSystemsSections";
import { ChemicalsSection } from "@/components/utility/ChemicalsSection";
import { UtilityCostSection } from "@/components/utility/UtilityCostSection";
import { UtilityAvailabilitySection } from "@/components/utility/UtilityAvailabilitySection";
import { DowntimeImpactSection } from "@/components/utility/DowntimeImpactSection";
import { UtilityDetailDrawer } from "@/components/utility/UtilityDetailDrawer";
import { useUtilityData } from "@/hooks/useUtilityData";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

export default function UtilityDashboard() {
  const { filters, setFilters, data } = useUtilityData();
  const [drawerTarget, setDrawerTarget] = useState<UtilityDrawerTarget | null>(null);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header lastUpdated={data.lastUpdated} alerts={data.alerts} dashboardLabel="Utility Dashboard" />
      <UtilityFilterBar filters={filters} onChange={setFilters} />

      <main className="mx-auto max-w-[1600px] px-6 py-6 lg:px-8">
        <UtilitySummarySection data={data} onOpenDrawer={setDrawerTarget} />

        <ManagementAttentionPanel alerts={data.alerts} />

        <PowerElectricalSection power={data.power} filters={filters} onOpenDrawer={setDrawerTarget} />

        <GasSystemSection gas={data.gas} filters={filters} onOpenDrawer={setDrawerTarget} />

        <WaterSystemSection water={data.water} onOpenDrawer={setDrawerTarget} />

        <HVACSection hvac={data.hvac} onOpenDrawer={setDrawerTarget} />

        <CompressedAirSection compressedAir={data.compressedAir} onOpenDrawer={setDrawerTarget} />

        <VacuumSection vacuum={data.vacuum} onOpenDrawer={setDrawerTarget} />

        <ChemicalsSection chemicals={data.chemicals} filters={filters} onOpenDrawer={setDrawerTarget} />

        <UtilityCostSection cost={data.cost} />

        <UtilityAvailabilitySection
          availability={data.availability}
          compositeAvailabilityPct={data.summary.compositeAvailabilityPct}
        />

        <DowntimeImpactSection downtimeImpact={data.downtimeImpact} onOpenDrawer={setDrawerTarget} />
      </main>

      <UtilityDetailDrawer target={drawerTarget} data={data} onClose={() => setDrawerTarget(null)} />
    </div>
  );
}
