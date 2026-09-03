"use client";

import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { GradeSummary } from "@/components/dashboard/GradeSummary";
import { ProductionVsTargetChart } from "@/components/dashboard/ProductionVsTargetChart";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { productionDisplayValue, productionUnitSuffix, type ProductionUnit } from "@/lib/calculations";
import type { DashboardData } from "@/types/dashboard";

const UNIT_OPTIONS: { value: ProductionUnit; label: string }[] = [
  { value: "mw", label: "MW" },
  { value: "lacs", label: "Units (Lacs)" },
];

export function ProductionPerformanceSection({
  data,
  onSelectLine,
  unit,
  onUnitChange,
}: {
  data: DashboardData;
  onSelectLine: (lineId: string) => void;
  unit: ProductionUnit;
  onUnitChange: (unit: ProductionUnit) => void;
}) {
  // Same underlying production trend data, just re-expressed in the selected
  // unit for display - no separate dataset is generated for Lacs.
  const trendData = data.productionTrend.map((p) => ({
    label: p.label,
    actual: productionDisplayValue(p.actual, unit),
    target: productionDisplayValue(p.target, unit),
  }));

  return (
    <PageSection
      title="Production Performance"
      description="Output volume, grade mix, and line-level attainment against target."
      action={
        <SegmentedControl options={UNIT_OPTIONS} value={unit} onChange={onUnitChange} />
      }
    >
      <div className="mb-4">
        <GradeSummary production={data.production} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <SectionHeading
            eyebrow="Line-wise"
            title="Cell Line Production vs Target"
            description="Click a bar to drill into that line."
          />
          <ProductionVsTargetChart
            cellLines={data.cellLines}
            selectedLine={data.filters.line}
            onSelectLine={onSelectLine}
            unit={unit}
          />
        </Card>

        <Card className="xl:col-span-3">
          <SectionHeading
            eyebrow="Trend"
            title="Production Trend"
            description="Actual vs target production across the period."
          />
          <TrendLineChart data={trendData} formatter={(v) => `${v.toFixed(2)} ${productionUnitSuffix(unit)}`} />
        </Card>
      </div>
    </PageSection>
  );
}
