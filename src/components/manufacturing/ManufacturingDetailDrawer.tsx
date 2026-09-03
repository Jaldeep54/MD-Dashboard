"use client";

import { useMemo } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LossBreakdownChart } from "@/components/dashboard/LossBreakdownChart";
import { generateManufacturingData } from "@/data/manufacturingGenerator";
import { statusHigherIsBetter } from "@/lib/calculations";
import { statusFromTolerance } from "@/lib/manufacturingCalculations";
import { EQUIPMENT_LIST, PRODUCTION_LINES } from "@/lib/manufacturingConstants";
import { MfgCapacityWaterfall } from "@/components/manufacturing/MfgCapacityWaterfall";
import { MfgGradeSummary } from "@/components/manufacturing/MfgGradeSummary";
import { OEEBreakdown } from "@/components/manufacturing/OEEBreakdown";
import { EquipmentAvailabilityTable } from "@/components/manufacturing/EquipmentAvailabilityTable";
import { ProcessStepYieldTable } from "@/components/manufacturing/ProcessStepYieldTable";
import { ProductionByLineTable } from "@/components/manufacturing/ProductionByLineTable";
import { ProductionTrendCard } from "@/components/manufacturing/ProductionTrendCard";
import { GradeDistributionChart } from "@/components/manufacturing/GradeDistributionChart";
import { DefectParetoChart } from "@/components/manufacturing/DefectParetoChart";
import type { MfgDrawerTarget } from "@/components/manufacturing/drawerTypes";
import type { ManufacturingData, MfgFilters } from "@/types/manufacturing";

function StatMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5">
      <div className="text-[11px] font-medium text-[var(--color-ink-500)]">{label}</div>
      <div className="text-[17px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-ink-400)]">{sub}</div>}
    </div>
  );
}

export function ManufacturingDetailDrawer({
  target,
  data,
  filters,
  onClose,
  onSelectLine,
  onSelectStep,
}: {
  target: MfgDrawerTarget | null;
  data: ManufacturingData;
  filters: MfgFilters;
  onClose: () => void;
  onSelectLine: (lineId: string) => void;
  onSelectStep: (stepId: string) => void;
}) {
  const lineDetail = useMemo(() => {
    if (target?.type === "line") {
      return generateManufacturingData({ ...filters, line: target.lineId });
    }
    return null;
  }, [target, filters]);

  const open = target !== null;
  const { title, subtitle } = titleFor(target, data);

  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {target?.type === "production" && <ProductionDetail data={data} onSelectLine={onSelectLine} />}
      {target?.type === "capacity" && <CapacityDetail data={data} />}
      {target?.type === "oee" && <OEEDetail data={data} />}
      {target?.type === "yield" && <YieldDetail data={data} onSelectStep={onSelectStep} />}
      {target?.type === "quality" && <QualityDetail data={data} />}
      {target?.type === "line" && lineDetail && <LineDetail data={lineDetail} lineId={target.lineId} />}
      {target?.type === "processStep" && <ProcessStepDetail data={data} stepId={target.stepId} />}
    </Drawer>
  );
}

function titleFor(target: MfgDrawerTarget | null, data: ManufacturingData): { title: string; subtitle: string } {
  const subtitle = `${data.scopeLabel} · ${data.periodLabel}`;
  if (!target) return { title: "", subtitle };
  switch (target.type) {
    case "production":
      return { title: "Production Detail", subtitle };
    case "capacity":
      return { title: "Capacity Detail", subtitle };
    case "oee":
      return { title: "OEE Detail", subtitle };
    case "yield":
      return { title: "Wafer-to-Cell Yield Detail", subtitle };
    case "quality":
      return { title: "Final Quality Detail", subtitle };
    case "line": {
      const line = PRODUCTION_LINES.find((l) => l.id === target.lineId);
      return { title: `${line?.name ?? "Line"} Detail`, subtitle: data.periodLabel };
    }
    case "processStep": {
      const step = data.processYield.stepYields.find((s) => s.id === target.stepId);
      return { title: `${step?.name ?? "Process Step"} Detail`, subtitle: data.periodLabel };
    }
  }
}

function ProductionDetail({
  data,
  onSelectLine,
}: {
  data: ManufacturingData;
  onSelectLine: (lineId: string) => void;
}) {
  const { production, filters } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatMini label="Actual" value={`${production.vsTarget.actualMW.toFixed(1)} MW`} />
        <StatMini label="Target" value={`${production.vsTarget.targetMW.toFixed(1)} MW`} />
        <StatMini label="Achievement" value={`${production.vsTarget.achievementPct.toFixed(1)}%`} />
      </div>
      <MfgGradeSummary grade={production.grade} seed={`${filters.period}-${filters.date}-drawer`} />
      <ProductionByLineTable rows={production.byLine} selectedLine={filters.line} onSelectLine={onSelectLine} />
      <ProductionTrendCard vsTarget={production.vsTarget} seed={`${filters.period}-${filters.date}-drawer`} />
    </div>
  );
}

function CapacityDetail({ data }: { data: ManufacturingData }) {
  const { capacity } = data.production;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Installed" value={`${capacity.installedMW.toFixed(1)} MW`} />
        <StatMini label="Available" value={`${capacity.availableMW.toFixed(1)} MW`} sub={`${capacity.availabilityPct.toFixed(1)}%`} />
        <StatMini label="Actual Output" value={`${capacity.actualMW.toFixed(1)} MW`} />
        <StatMini label="Utilization" value={`${capacity.utilizationPct.toFixed(1)}%`} />
      </div>
      <MfgCapacityWaterfall capacity={capacity} />
    </div>
  );
}

function OEEDetail({ data }: { data: ManufacturingData }) {
  return (
    <div className="flex flex-col gap-5">
      <OEEBreakdown oee={data.equipment.oee} />
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">
          Equipment-wise Availability & Downtime
        </h3>
        <EquipmentAvailabilityTable data={data.equipment.equipmentAvailability} />
      </div>
    </div>
  );
}

function YieldDetail({ data, onSelectStep }: { data: ManufacturingData; onSelectStep: (stepId: string) => void }) {
  const { waferToCellYield, waferBreakage, processLoss, stepYields } = data.processYield;
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
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Overall Yield" value={`${waferToCellYield.pct.toFixed(1)}%`} sub={`Target ${waferToCellYield.targetPct.toFixed(1)}%`} />
        <StatMini label="Wafer Input" value={`${waferToCellYield.waferInputMn.toFixed(2)} Mn`} />
        <StatMini label="Cell Output" value={`${waferToCellYield.cellOutputMn.toFixed(2)} Mn`} />
        <StatMini label="Wafer Breakage" value={`${waferBreakage.pct.toFixed(2)}%`} sub={`Target ${waferBreakage.targetPct.toFixed(1)}%`} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Process Step Yield</h3>
        <ProcessStepYieldTable steps={stepYields} onSelectStep={onSelectStep} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Breakage by Process Step</h3>
          <LossBreakdownChart data={breakageChartData} unitLabel="wafers" />
        </div>
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Process Loss by Category</h3>
          <LossBreakdownChart data={lossChartData} unitLabel="wafers" />
        </div>
      </div>
    </div>
  );
}

function QualityDetail({ data }: { data: ManufacturingData }) {
  const { quality } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Final Pass" value={`${quality.finalQualityPassPct.toFixed(1)}%`} sub={`Target ${quality.finalQualityPassTargetPct.toFixed(0)}%`} />
        <StatMini label="Final Fail" value={`${quality.finalFailPct.toFixed(1)}%`} />
        <StatMini label="First Pass Yield" value={`${quality.fpyPct.toFixed(1)}%`} />
        <StatMini label="Rework" value={`${quality.reworkPct.toFixed(1)}%`} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Grade Distribution</h3>
        <GradeDistributionChart grade={data.production.grade} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Defect Categories</h3>
        <DefectParetoChart defects={quality.defects} />
      </div>
    </div>
  );
}

function LineDetail({ data, lineId }: { data: ManufacturingData; lineId: string }) {
  const line = data.production.byLine.find((l) => l.id === lineId) ?? data.production.byLine[0];
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatMini label="Production" value={`${line.productionMW.toFixed(2)} MW`} sub={`/ ${line.targetMW.toFixed(2)} MW`} />
        <StatMini label="Achievement" value={`${line.achievementPct.toFixed(1)}%`} />
        <StatMini label="Capacity Util." value={`${line.capacityUtilizationPct.toFixed(0)}%`} />
        <StatMini label="Good Grade" value={`${line.goodGradePct.toFixed(1)}%`} />
        <StatMini label="Cell Efficiency" value={`${(data.processYield.cellEfficiency.byLine.find((e) => e.id === lineId)?.valuePct ?? 0).toFixed(2)}%`} />
      </div>
      <StatusBadge status={line.status} />
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Production Trend</h3>
        <ProductionTrendCard vsTarget={data.production.vsTarget} seed={`${data.filters.period}-${data.filters.date}-${lineId}`} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Process Loss Breakdown</h3>
        <LossBreakdownChart
          data={data.processYield.processLoss.categories.map((c) => ({
            category: c.label,
            quantity: Math.round(c.quantityMn * 1_000_000),
            pctOfTotal: c.pctOfLoss,
          }))}
          unitLabel="wafers"
        />
      </div>
    </div>
  );
}

function ProcessStepDetail({ data, stepId }: { data: ManufacturingData; stepId: string }) {
  const step = data.processYield.stepYields.find((s) => s.id === stepId);
  const parameter = data.equipment.processParameters.find((p) => p.processStepId === stepId);
  const equipment = EQUIPMENT_LIST.find((e) => e.processStepId === stepId);
  const equipmentRow = equipment
    ? data.equipment.equipmentAvailability.byEquipment.find((e) => e.id === equipment.id)
    : undefined;

  if (!step) return null;

  const yieldStatus = statusHigherIsBetter(step.yieldPct, step.targetPct, 1, 0.3);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Input" value={`${step.inputMn.toFixed(2)} Mn`} />
        <StatMini label="Output" value={`${step.outputMn.toFixed(2)} Mn`} />
        <StatMini label="Step Yield" value={`${step.yieldPct.toFixed(2)}%`} sub={`Target ${step.targetPct.toFixed(2)}%`} />
        {equipmentRow && <StatMini label="Equipment Availability" value={`${equipmentRow.availabilityPct.toFixed(1)}%`} />}
      </div>
      <StatusBadge status={yieldStatus} />

      {parameter && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Process Parameter</h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[var(--color-ink-900)]">{parameter.name}</span>
              <StatusBadge status={statusFromTolerance(parameter.actual, parameter.target, parameter.tolerance)} />
            </div>
            <div className="mt-1 text-[12.5px] text-[var(--color-ink-500)]">
              Actual {parameter.actual.toFixed(2)} {parameter.unit} · Target {parameter.target.toFixed(2)} {parameter.unit} · Tolerance ± {parameter.tolerance.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {equipment && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Equipment</h3>
          <div className="rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-[13px] text-[var(--color-ink-700)]">
            {equipment.name}
          </div>
        </div>
      )}
    </div>
  );
}
