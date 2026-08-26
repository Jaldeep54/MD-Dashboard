"use client";

import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { GradeSummary } from "@/components/dashboard/GradeSummary";
import { ProductionVsTargetChart } from "@/components/dashboard/ProductionVsTargetChart";
import { TrendLineChart } from "@/components/dashboard/TrendLineChart";
import { formatMW } from "@/lib/calculations";
import type { DashboardData } from "@/types/dashboard";

export function ProductionPerformanceSection({
  data,
  onSelectLine,
}: {
  data: DashboardData;
  onSelectLine: (lineId: string) => void;
}) {
  return (
    <PageSection
      title="Production Performance"
      description="Output volume, grade mix, and line-level attainment against target."
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
          />
        </Card>

        <Card className="xl:col-span-3">
          <SectionHeading
            eyebrow="Trend"
            title="Production Trend"
            description="Actual vs target production across the period."
          />
          <TrendLineChart data={data.productionTrend} formatter={(v) => formatMW(v, 2)} />
        </Card>
      </div>
    </PageSection>
  );
}
