"use client";

import { CardButton, Card, PageSection } from "@/components/ui/Card";
import { OEEBreakdown } from "@/components/manufacturing/OEEBreakdown";
import { EquipmentAvailabilityTable } from "@/components/manufacturing/EquipmentAvailabilityTable";
import { ProcessPerformanceTable } from "@/components/manufacturing/ProcessPerformanceTable";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";
import type { EquipmentPerformanceSectionData } from "@/types/manufacturing";

export function EquipmentPerformanceSection({
  equipment,
  onOpenDrawer,
}: {
  equipment: EquipmentPerformanceSectionData;
  onOpenDrawer: (target: MfgDrawerTarget) => void;
}) {
  return (
    <PageSection
      title="Equipment Performance"
      description="OEE, equipment availability, and process parameters versus target."
    >
      <CardButton onClick={() => onOpenDrawer({ type: "oee" })} className="mb-4 block cursor-pointer">
        <Card className="transition-shadow hover:shadow-md">
          <OEEBreakdown oee={equipment.oee} />
        </Card>
      </CardButton>

      <div className="mb-4">
        <EquipmentAvailabilityTable data={equipment.equipmentAvailability} />
      </div>

      <ProcessPerformanceTable rows={equipment.processParameters} />
    </PageSection>
  );
}
