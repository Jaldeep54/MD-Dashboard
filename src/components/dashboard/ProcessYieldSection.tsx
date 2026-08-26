import { Card, PageSection, SectionHeading } from "@/components/ui/Card";
import { LossBreakdownChart } from "@/components/dashboard/LossBreakdownChart";
import { YieldFlow } from "@/components/dashboard/YieldFlow";
import type { LossBreakdownItem, YieldMetrics } from "@/types/dashboard";

export function ProcessYieldSection({
  yieldMetrics,
  lossBreakdown,
}: {
  yieldMetrics: YieldMetrics;
  lossBreakdown: LossBreakdownItem[];
}) {
  return (
    <PageSection
      title="Process Yield & Loss Analysis"
      description="Wafer-to-cell conversion and where the losses originate."
    >
      <div className="flex flex-col gap-4">
        <Card>
          <SectionHeading title="Process Yield" description="Wafer input → processing → cell output." />
          <YieldFlow yieldMetrics={yieldMetrics} />
        </Card>

        <Card>
          <SectionHeading title="Process Loss Breakdown" description="Where production losses are concentrated." />
          <LossBreakdownChart data={lossBreakdown} />
        </Card>
      </div>
    </PageSection>
  );
}
