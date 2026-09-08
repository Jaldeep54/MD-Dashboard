"use client";

import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LossBreakdownChart } from "@/components/dashboard/LossBreakdownChart";
import { PlantPowerBreakdownChart } from "@/components/utility/PlantPowerBreakdownChart";
import { WaterBalanceFlow } from "@/components/utility/WaterBalanceFlow";
import { UnitAvailabilityTable } from "@/components/utility/UnitAvailabilityTable";
import { formatCr, formatPct, formatRupeePerW, statusHigherIsBetter } from "@/lib/calculations";
import { formatKL, formatMWh, formatUnitValue } from "@/lib/utilityCalculations";
import type { UtilityDrawerTarget } from "@/components/utility/drawerTypes";
import type { UtilityData } from "@/types/utility";

function StatMini({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5">
      <div className="text-[11px] font-medium text-[var(--color-ink-500)]">{label}</div>
      <div className="text-[17px] font-bold tabular-nums tracking-tight text-[var(--color-ink-900)]">{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-ink-400)]">{sub}</div>}
    </div>
  );
}

export function UtilityDetailDrawer({
  target,
  data,
  onClose,
}: {
  target: UtilityDrawerTarget | null;
  data: UtilityData;
  onClose: () => void;
}) {
  const open = target !== null;
  const { title, subtitle } = titleFor(target, data);

  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle}>
      {target?.type === "power" && <PowerDetail data={data} />}
      {target?.type === "gas" && <GasDetail data={data} />}
      {target?.type === "water" && <WaterDetail data={data} />}
      {target?.type === "ro" && <RODetail data={data} />}
      {target?.type === "upw" && <UPWDetail data={data} />}
      {target?.type === "cooling" && <CoolingDetail data={data} />}
      {target?.type === "etp" && <ETPDetail data={data} />}
      {target?.type === "hvac" && <HVACDetail data={data} />}
      {target?.type === "compressedAir" && <CompressedAirDetail data={data} />}
      {target?.type === "vacuum" && <VacuumDetail data={data} />}
      {target?.type === "chemicals" && <ChemicalsDetail data={data} />}
      {target?.type === "equipment-row" && <EquipmentRowDetail data={data} area={target.area} id={target.id} />}
      {target?.type === "downtime-impact" && <DowntimeDetail data={data} rowKey={target.key} />}
    </Drawer>
  );
}

function titleFor(target: UtilityDrawerTarget | null, data: UtilityData): { title: string; subtitle: string } {
  const subtitle = `${data.scopeLabel} · ${data.periodLabel}`;
  if (!target) return { title: "", subtitle };
  switch (target.type) {
    case "power":
      return { title: "Power & Electrical Detail", subtitle };
    case "gas":
      return { title: "Gas System Detail", subtitle };
    case "water":
      return { title: "Water System Detail", subtitle };
    case "ro":
      return { title: "RO / DM Detail", subtitle };
    case "upw":
      return { title: "UPW / DI Detail", subtitle };
    case "cooling":
      return { title: "Cooling Water Detail", subtitle };
    case "etp":
      return { title: "ETP Detail", subtitle };
    case "hvac":
      return { title: "HVAC Detail", subtitle };
    case "compressedAir":
      return { title: "Compressed Air Detail", subtitle };
    case "vacuum":
      return { title: "Vacuum Detail", subtitle };
    case "chemicals":
      return { title: "Chemicals Detail", subtitle };
    case "equipment-row": {
      const units = target.area === "compressedAir" ? data.compressedAir.compressors : data.vacuum.pumps;
      const unit = units.find((u) => u.id === target.id);
      return { title: unit?.name ?? "Unit Detail", subtitle };
    }
    case "downtime-impact": {
      const row = data.downtimeImpact.find((r) => r.key === target.key);
      return { title: `${row?.label ?? "Utility"} Downtime Impact`, subtitle };
    }
  }
}

function PowerDetail({ data }: { data: UtilityData }) {
  const { power } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Total Consumption" value={formatMWh(power.totalConsumptionMWh)} />
        <StatMini label="Cost/W" value={formatRupeePerW(power.costPerW)} sub={`Target ${formatRupeePerW(power.costPerWTarget)}`} />
        <StatMini label="Power Factor" value={formatPct(power.powerFactorPct, 1)} sub={`Target ${formatPct(power.powerFactorTargetPct, 0)}`} />
        <StatMini label="Demand Penalty" value={formatCr(power.demandPenaltyRs / 1e7, 4)} />
        <StatMini label="Grid Availability" value={formatPct(power.gridAvailabilityPct, 1)} />
        <StatMini label="Backup Availability" value={formatPct(power.backupAvailabilityPct, 1)} />
        <StatMini label="DG Fuel" value={`${power.dgFuelConsumptionLPerDay.toFixed(0)} L/day`} />
        <StatMini label="DG Fuel Cost" value={formatCr(power.dgFuelCostRs / 1e7, 4)} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Plant Power Breakdown</h3>
        <PlantPowerBreakdownChart data={power.breakdown} />
      </div>
    </div>
  );
}

function GasDetail({ data }: { data: UtilityData }) {
  const { gas } = data;
  const chartData = gas.byType.map((g) => ({ category: g.label, quantity: Math.round(g.costRs), pctOfTotal: g.pctOfTotal }));
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Cost/W" value={formatRupeePerW(gas.costPerW)} sub={`Target ${formatRupeePerW(gas.costPerWTarget)}`} />
        <StatMini label="Total Cost" value={formatCr(gas.totalCostCr, 3)} />
        <StatMini label="Availability" value={formatPct(gas.availabilityPct, 1)} sub={`Target ${formatPct(gas.availabilityTargetPct, 1)}`} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Cost by Gas Type</h3>
        <LossBreakdownChart data={chartData} unitLabel="₹" />
      </div>
    </div>
  );
}

function WaterDetail({ data }: { data: UtilityData }) {
  const { water } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Cost/W" value={formatRupeePerW(water.costPerW)} sub={`Target ${formatRupeePerW(water.costPerWTarget)}`} />
        <StatMini label="Total Cost" value={formatCr(water.totalCostCr, 3)} />
        <StatMini label="Fresh Water Intake" value={formatKL(water.freshWaterIntakeKL)} />
      </div>
      <WaterBalanceFlow water={water} />
    </div>
  );
}

function RODetail({ data }: { data: UtilityData }) {
  const { ro } = data.water;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatMini label="Feed" value={formatKL(ro.feedKL)} />
      <StatMini label="Product" value={formatKL(ro.productKL)} />
      <StatMini label="Reject" value={formatKL(ro.rejectKL)} />
      <StatMini label="Recovery %" value={formatPct(ro.recoveryPct)} sub={`Target ${formatPct(ro.recoveryTargetPct, 0)}`} />
      <StatMini label="Reject %" value={formatPct(ro.rejectPct)} />
    </div>
  );
}

function UPWDetail({ data }: { data: UtilityData }) {
  const { upw } = data.water;
  const chartData = upw.usageBreakdown.map((u) => ({ category: u.label, quantity: Math.round(u.consumptionKL), pctOfTotal: u.pctOfTotal }));
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Consumption" value={formatKL(upw.consumptionKL)} />
        <StatMini label="Resistivity" value={`${upw.resistivityMOhmCm.toFixed(1)} MΩ·cm`} sub={`Target ${upw.resistivityTargetMOhmCm.toFixed(0)}`} />
        <StatMini label="TOC" value={`${upw.tocPpb.toFixed(1)} ppb`} sub={`Target ${upw.tocTargetPpb.toFixed(0)}`} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Usage Breakdown</h3>
        <LossBreakdownChart data={chartData} unitLabel="KL" />
      </div>
    </div>
  );
}

function CoolingDetail({ data }: { data: UtilityData }) {
  const { cooling } = data.water;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatMini label="Circulation" value={formatKL(cooling.circulationKL)} />
      <StatMini label="Makeup" value={formatKL(cooling.makeupKL)} />
      <StatMini label="Cycles of Concentration" value={cooling.cyclesOfConcentration.toFixed(1)} />
      <StatMini label="Approach Temp" value={`${cooling.approachTempC.toFixed(1)}°C`} />
      <StatMini label="Range Temp" value={`${cooling.rangeTempC.toFixed(1)}°C`} />
      <StatMini label="Availability" value={formatPct(cooling.availabilityPct, 1)} sub={`Target ${formatPct(cooling.availabilityTargetPct, 1)}`} />
    </div>
  );
}

function ETPDetail({ data }: { data: UtilityData }) {
  const { etp } = data.water;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatMini label="Inlet" value={formatKL(etp.inletKL)} />
      <StatMini label="Treated" value={formatKL(etp.treatedKL)} />
      <StatMini label="Recycled" value={formatKL(etp.recycledKL)} />
      <StatMini label="Recovery %" value={formatPct(etp.recoveryPct)} />
      <StatMini label="Chemical Consumption" value={`${etp.chemicalConsumptionKg.toFixed(0)} kg`} />
      <StatMini label="Availability" value={formatPct(etp.availabilityPct, 1)} sub={`Target ${formatPct(etp.availabilityTargetPct, 1)}`} />
    </div>
  );
}

function HVACDetail({ data }: { data: UtilityData }) {
  const { hvac } = data;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatMini label="Consumption" value={formatMWh(hvac.consumptionMWh)} />
      <StatMini label="Cooling Load" value={`${hvac.coolingLoadTR.toFixed(0)} TR`} />
      <StatMini label="Chilled Water Supply" value={`${hvac.chilledWaterSupplyTempC.toFixed(1)}°C`} />
      <StatMini label="Chilled Water Return" value={`${hvac.chilledWaterReturnTempC.toFixed(1)}°C`} />
      <StatMini label="Cleanroom Temp Dev." value={`± ${hvac.cleanroomTempDeviationC.toFixed(2)}°C`} />
      <StatMini label="Cleanroom RH Dev." value={`± ${hvac.cleanroomRHDeviationPct.toFixed(1)}%`} />
      <StatMini label="Availability" value={formatPct(hvac.availabilityPct, 1)} sub={`Target ${formatPct(hvac.availabilityTargetPct, 1)}`} />
    </div>
  );
}

function CompressedAirDetail({ data }: { data: UtilityData }) {
  const { compressedAir } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Consumption" value={formatMWh(compressedAir.consumptionMWh)} />
        <StatMini label="Generation" value={`${(compressedAir.generationNm3 / 1000).toFixed(1)}k Nm³`} />
        <StatMini label="Specific Power" value={formatUnitValue(compressedAir.specificPowerKwPerNm3Min, "kW/Nm³/min", 2)} />
        <StatMini label="Dew Point" value={`${compressedAir.dewPointC.toFixed(0)}°C`} />
        <StatMini label="Leakage" value={formatPct(compressedAir.leakagePct, 1)} />
        <StatMini label="Availability" value={formatPct(compressedAir.availabilityPct, 1)} />
      </div>
      <UnitAvailabilityTable
        title="Compressor Availability"
        description="Product of each unit's availability - series-line model."
        units={compressedAir.compressors}
        overallPct={compressedAir.availabilityPct}
        targetPct={compressedAir.availabilityTargetPct}
        onSelectUnit={() => {}}
      />
    </div>
  );
}

function VacuumDetail({ data }: { data: UtilityData }) {
  const { vacuum } = data;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Consumption" value={formatMWh(vacuum.consumptionMWh)} />
        <StatMini label="Vacuum Level" value={`${vacuum.vacuumLevelMbar.toFixed(2)} mbar`} sub={`Target ${vacuum.vacuumLevelTargetMbar.toFixed(2)}`} />
        <StatMini label="Pump-down Time" value={`${vacuum.pumpDownTimeSec.toFixed(0)} sec`} />
        <StatMini label="Availability" value={formatPct(vacuum.availabilityPct, 1)} />
      </div>
      <UnitAvailabilityTable
        title="Vacuum Pump Availability"
        description="Product of each pump's availability - series-line model."
        units={vacuum.pumps}
        overallPct={vacuum.availabilityPct}
        targetPct={vacuum.availabilityTargetPct}
        onSelectUnit={() => {}}
      />
    </div>
  );
}

function ChemicalsDetail({ data }: { data: UtilityData }) {
  const { chemicals } = data;
  const chartData = chemicals.ledger.map((c) => ({ category: c.label, quantity: Math.round(c.costRs), pctOfTotal: (c.costRs / (chemicals.totalCostCr * 1e7)) * 100 }));
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatMini label="Cost/W" value={formatRupeePerW(chemicals.costPerW)} sub={`Target ${formatRupeePerW(chemicals.costPerWTarget)}`} />
        <StatMini label="Total Cost" value={formatCr(chemicals.totalCostCr, 3)} />
      </div>
      <div>
        <h3 className="mb-2 text-[13px] font-semibold text-[var(--color-ink-900)]">Cost by Chemical Type</h3>
        <LossBreakdownChart data={chartData} unitLabel="₹" />
      </div>
    </div>
  );
}

function EquipmentRowDetail({ data, area, id }: { data: UtilityData; area: "compressedAir" | "vacuum"; id: string }) {
  const units = area === "compressedAir" ? data.compressedAir.compressors : data.vacuum.pumps;
  const targetPct = area === "compressedAir" ? data.compressedAir.availabilityTargetPct : data.vacuum.availabilityTargetPct;
  const unit = units.find((u) => u.id === id);
  if (!unit) return null;
  const status = statusHigherIsBetter(unit.availabilityPct, targetPct, 3, 0.5);
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatMini label="Availability" value={formatPct(unit.availabilityPct, 1)} sub={`Target ${formatPct(targetPct, 0)}`} />
        <div className="rounded-lg border border-[var(--color-border)] bg-white px-3.5 py-2.5">
          <div className="text-[11px] font-medium text-[var(--color-ink-500)]">Status</div>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}

function DowntimeDetail({ data, rowKey }: { data: UtilityData; rowKey: string }) {
  const row = data.downtimeImpact.find((r) => r.key === rowKey);
  if (!row) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <StatMini label="Actual Availability" value={formatPct(row.actualAvailabilityPct, 1)} />
      <StatMini label="Target Availability" value={formatPct(row.targetAvailabilityPct, 1)} />
      <StatMini label="Shortfall" value={`${row.shortfallPct.toFixed(2)} pts`} />
      <StatMini label="Downtime" value={`${row.downtimeHours.toFixed(1)} hr`} />
      <StatMini label="Affected Capacity Share" value={formatPct(row.affectedCapacityShare * 100, 0)} />
      <StatMini label="Lost Production" value={`${row.lostProductionMW.toFixed(3)} MW`} />
      <StatMini label="Economic Impact" value={formatCr(row.economicImpactCr, 3)} />
    </div>
  );
}
