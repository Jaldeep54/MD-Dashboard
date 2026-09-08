"use client";

import { FlaskConical } from "lucide-react";
import { PageSection } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { ChemicalLedgerTable } from "@/components/utility/ChemicalLedgerTable";
import { formatRupeePerW, formatSigned, statusLowerIsBetter } from "@/lib/calculations";
import { periodOverPeriodDelta } from "@/lib/trendDelta";
import type { ChemicalsMetrics, UtilityFilters } from "@/types/utility";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";

export function ChemicalsSection({
  chemicals,
  filters,
  onOpenDrawer,
}: {
  chemicals: ChemicalsMetrics;
  filters: UtilityFilters;
  onOpenDrawer: (target: UtilityDrawerTarget) => void;
}) {
  const seed = `${filters.period}-${filters.date}-chem`;
  const costStatus = statusLowerIsBetter(chemicals.costPerW, chemicals.costPerWTarget, 8);

  return (
    <PageSection
      id="chemicals"
      title="Chemicals"
      description="Process, ETP, cooling-treatment and other chemical spend — broken down by chemical type, mirroring the Gas System's configurable structure."
    >
      <div className="mb-4">
        <KPICard
          title="Chemicals Cost/W"
          definition="Total chemical spend divided by the same saleable production MW used across the dashboard. Lower is better."
          value={formatRupeePerW(chemicals.costPerW)}
          target={formatRupeePerW(chemicals.costPerWTarget)}
          varianceLabel={`${formatSigned(chemicals.costPerW - chemicals.costPerWTarget, (v) => formatRupeePerW(v))} vs target`}
          status={costStatus}
          periodDeltaPct={periodOverPeriodDelta(`${seed}-cost`)}
          deltaPositiveIsGood={false}
          onClick={() => onOpenDrawer({ type: "chemicals" })}
          emphasis="compact"
          icon={<FlaskConical className="h-3.5 w-3.5 text-[var(--color-navy-600)]" />}
        />
      </div>

      <ChemicalLedgerTable ledger={chemicals.ledger} totalCostCr={chemicals.totalCostCr} />
    </PageSection>
  );
}
