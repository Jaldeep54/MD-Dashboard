import {
  AVG_CELL_WATTAGE,
  CELL_TYPE_MODIFIERS,
  DEFECT_CATEGORIES,
  EQUIPMENT_LIST,
  MFG_DEFAULT_LAST_UPDATED,
  MFG_LINE_PROFILES,
  MFG_PLANT_INSTALLED_CAPACITY_MW_YEAR,
  MFG_TARGETS,
  OPERATING_DAYS_PER_MONTH,
  OPERATING_DAYS_PER_YEAR,
  OPERATING_WEEKS_PER_YEAR,
  PROCESS_LOSS_CATEGORIES,
  PROCESS_PARAMETERS,
  PROCESS_STEP_WEIGHTS,
  PROCESS_YIELD_STEPS,
  PRODUCTION_LINES,
  SHIFTS_PER_DAY,
  WAFER_BREAKAGE_STEPS,
} from "@/lib/manufacturingConstants";
import {
  capacityUtilizationPct,
  distributeRatioByWeight,
  oeePct,
  statusFromTolerance,
  waferToCellYieldPct,
} from "@/lib/manufacturingCalculations";
import { clamp, statusHigherIsBetter } from "@/lib/calculations";
import { noise } from "@/lib/prng";
import { formatDateLong, formatMonthYear, formatWeekLabel, formatYear, monthKey, weekKey } from "@/lib/dateUtils";
import type {
  CellEfficiencyBreakdownItem,
  DefectCategory,
  EquipmentAvailabilityData,
  EquipmentRow,
  GradeBreakdown,
  LineProductionRow,
  ManufacturingAlert,
  ManufacturingData,
  MfgFilters,
  MfgPeriod,
  ProcessFlowStepStatus,
  ProcessLossCategory,
  ProcessParameterRow,
  ProcessStepYield,
  ProductionData,
  TrendGranularity,
  TrendPoint,
} from "@/types/manufacturing";

function periodSeedKey(filters: MfgFilters): string {
  switch (filters.period) {
    case "year":
      return formatYear(filters.date);
    case "month":
      return monthKey(filters.date);
    case "week":
      return weekKey(filters.date);
    case "shift":
      return `${filters.date}-s${filters.shift}`;
    case "day":
    default:
      return filters.date;
  }
}

function installedMWForPeriod(period: MfgPeriod): number {
  const dailyMW = MFG_PLANT_INSTALLED_CAPACITY_MW_YEAR / OPERATING_DAYS_PER_YEAR;
  switch (period) {
    case "year":
      return MFG_PLANT_INSTALLED_CAPACITY_MW_YEAR;
    case "month":
      return dailyMW * OPERATING_DAYS_PER_MONTH;
    case "week":
      return MFG_PLANT_INSTALLED_CAPACITY_MW_YEAR / OPERATING_WEEKS_PER_YEAR;
    case "shift":
      return dailyMW / SHIFTS_PER_DAY;
    case "day":
    default:
      return dailyMW;
  }
}

function periodLabelFor(filters: MfgFilters): string {
  switch (filters.period) {
    case "year":
      return formatYear(filters.date);
    case "month":
      return formatMonthYear(filters.date);
    case "week":
      return formatWeekLabel(filters.date);
    case "shift":
      return `${formatDateLong(filters.date)} · Shift ${filters.shift}`;
    case "day":
    default:
      return formatDateLong(filters.date);
  }
}

function scopeLabelFor(filters: MfgFilters): string {
  const lineLabel =
    filters.line === "all" ? "All Lines" : PRODUCTION_LINES.find((l) => l.id === filters.line)?.name ?? "All Lines";
  if (filters.cellType === "all") return lineLabel;
  const cellTypeLabel = filters.cellType === "m10" ? "M10" : filters.cellType === "g12r" ? "G12R" : filters.cellType;
  return `${lineLabel} · ${cellTypeLabel}`;
}

interface LineComputed {
  id: string;
  name: string;
  installedMW: number;
  availabilityPct: number;
  performancePct: number;
  availableMW: number;
  actualMW: number;
  targetMW: number;
  goodMW: number;
  mediumMW: number;
  lowMW: number;
  goodSharePct: number;
}

function computeLine(id: string, name: string, lineInstalledMW: number, seedKey: string, cellTypeMult: number): LineComputed {
  const profile = MFG_LINE_PROFILES[id];
  const seed = `${id}-${seedKey}`;

  const availabilityPct = clamp(profile.availabilityPct + noise(`${seed}-avail`, 1.6), 65, 99);
  const performancePct = clamp(profile.performancePct + noise(`${seed}-perf`, 1.6), 65, 99);
  const availableMW = (lineInstalledMW * availabilityPct) / 100;
  const actualMW = (availableMW * performancePct) / 100;

  const targetMW = (lineInstalledMW * (MFG_TARGETS.availabilityTargetPct / 100) * (MFG_TARGETS.performanceTargetPct / 100));

  const goodSharePct = clamp(92 + profile.goodGradeBiasPct + noise(`${seed}-good`, 1.0), 82, 97);
  const lowSharePct = clamp(2.3 - profile.goodGradeBiasPct * 0.3 + noise(`${seed}-low`, 0.4), 0.8, 5);
  const mediumSharePct = clamp(100 - goodSharePct - lowSharePct, 1, 10);

  return {
    id,
    name,
    installedMW: lineInstalledMW,
    availabilityPct,
    performancePct,
    availableMW,
    actualMW: actualMW * cellTypeMult,
    targetMW: targetMW * cellTypeMult,
    goodMW: ((actualMW * goodSharePct) / 100) * cellTypeMult,
    mediumMW: ((actualMW * mediumSharePct) / 100) * cellTypeMult,
    lowMW: ((actualMW * lowSharePct) / 100) * cellTypeMult,
    goodSharePct,
  };
}

function trendBuckets(granularity: TrendGranularity): string[] {
  switch (granularity) {
    case "shift":
      return Array.from({ length: 8 }, (_, i) => `Hour ${i + 1}`);
    case "day":
      return ["Shift 1", "Shift 2", "Shift 3"];
    case "week":
      return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    case "month":
    default:
      return Array.from({ length: OPERATING_DAYS_PER_MONTH }, (_, i) => `Day ${i + 1}`);
  }
}

export function buildProductionTrend(
  totalActualMW: number,
  totalTargetMW: number,
  granularity: TrendGranularity,
  seedBase: string,
): TrendPoint[] {
  const buckets = trendBuckets(granularity);
  const perBucketActual = totalActualMW / buckets.length;
  const perBucketTarget = totalTargetMW / buckets.length;
  return buckets.map((label, i) => ({
    label,
    actual: Math.max(0, perBucketActual * (1 + noise(`${seedBase}-${granularity}-${label}-${i}`, 0.1))),
    target: perBucketTarget,
  }));
}

function buildEquipment(overallAvailabilityPct: number, seedKey: string): { rows: EquipmentRow[]; overall: EquipmentAvailabilityData } {
  const weights = EQUIPMENT_LIST.map((e) => PROCESS_STEP_WEIGHTS[e.processStepId] ?? 1 / EQUIPMENT_LIST.length);
  const baseAvailabilities = distributeRatioByWeight(overallAvailabilityPct, weights);
  const targetAvailabilities = distributeRatioByWeight(MFG_TARGETS.equipmentAvailabilityTargetPct, weights);

  const rows: EquipmentRow[] = EQUIPMENT_LIST.map((eq, i) => {
    const seed = `${eq.id}-${seedKey}`;
    const availabilityPct = clamp(baseAvailabilities[i] + noise(`${seed}-eqavail`, 1.2), 55, 99.5);
    const targetPct = targetAvailabilities[i];
    const downPct = 100 - availabilityPct;
    const breakdownPct = downPct * 0.45;
    const plannedMaintenancePct = downPct * 0.4;
    const otherPct = downPct - breakdownPct - plannedMaintenancePct;
    return {
      id: eq.id,
      name: eq.name,
      processStepId: eq.processStepId,
      lineId: "plant",
      availabilityPct,
      targetPct,
      downtime: { breakdownPct, plannedMaintenancePct, otherPct },
      status: statusHigherIsBetter(availabilityPct, targetPct, 4, 1.5),
    };
  });

  // Series-line model (matches distributeRatioByWeight above): plant-level
  // availability is the PRODUCT of the per-equipment availabilities, not
  // their average - otherwise this would silently drift away from the
  // availability figure fed into OEE and Capacity Utilization.
  const overallActual = rows.reduce((acc, r) => acc * (r.availabilityPct / 100), 1) * 100;
  const overallDown = 100 - overallActual;

  return {
    rows,
    overall: {
      overallPct: overallActual,
      targetPct: MFG_TARGETS.equipmentAvailabilityTargetPct,
      downtime: {
        breakdownPct: overallDown * 0.45,
        plannedMaintenancePct: overallDown * 0.4,
        otherPct: overallDown * 0.15,
      },
      byEquipment: rows,
    },
  };
}

function buildProcessFlowAndStepYields(
  overallYieldPct: number,
): { steps: ProcessStepYield[]; flow: ProcessFlowStepStatus[] } {
  const ids = PROCESS_YIELD_STEPS.map((s) => s.id);
  const weights = ids.map((id) => PROCESS_STEP_WEIGHTS[id] ?? 1 / ids.length);
  const actualYields = distributeRatioByWeight(overallYieldPct, weights);
  const targetYields = distributeRatioByWeight(MFG_TARGETS.waferToCellYieldTargetPct, weights);

  const steps: ProcessStepYield[] = PROCESS_YIELD_STEPS.map((s, i) => {
    const yieldPct = actualYields[i];
    const targetPct = targetYields[i];
    return {
      id: s.id,
      name: s.name,
      inputMn: 0,
      outputMn: 0,
      yieldPct,
      targetPct,
      status: statusFromTolerance(yieldPct, targetPct, 0.35),
    };
  });

  const flow: ProcessFlowStepStatus[] = [
    { id: "wafer-in", name: "n-type Wafer", status: "good", yieldPct: 100, targetPct: 100 },
    ...steps.map((s) => ({ id: s.id, name: s.name, status: s.status, yieldPct: s.yieldPct, targetPct: s.targetPct })),
    { id: "final-cell", name: "Final Half-Cut Cell", status: "good" as const, yieldPct: overallYieldPct, targetPct: MFG_TARGETS.waferToCellYieldTargetPct },
  ];

  return { steps, flow };
}

function seedKeyWithScope(filters: MfgFilters): string {
  return `${periodSeedKey(filters)}-${filters.line}-${filters.cellType}`;
}

export function generateManufacturingData(filters: MfgFilters): ManufacturingData {
  const seedKey = periodSeedKey(filters);
  const scopeSeed = seedKeyWithScope(filters);
  const installedMWTotal = installedMWForPeriod(filters.period);
  const lineInstalledMW = installedMWTotal / PRODUCTION_LINES.length;
  const cellTypeMult = (CELL_TYPE_MODIFIERS[filters.cellType]?.wattageMultiplier ?? 1) / CELL_TYPE_MODIFIERS.all.wattageMultiplier;

  // --- Production (bottom-up from lines, so KPI cards and the line table can never contradict) ---
  const lines = PRODUCTION_LINES.map((l) => computeLine(l.id, l.name, lineInstalledMW, seedKey, cellTypeMult));

  const plantAvailableMW = lines.reduce((acc, l) => acc + l.availableMW, 0) * cellTypeMult;
  const plantInstalledMW = installedMWTotal * cellTypeMult;
  const plantAvailabilityPct = (plantAvailableMW / plantInstalledMW) * 100;

  const scopedLines = filters.line === "all" ? lines : lines.filter((l) => l.id === filters.line);
  const actualMW = scopedLines.reduce((acc, l) => acc + l.actualMW, 0);
  const targetMW = scopedLines.reduce((acc, l) => acc + l.targetMW, 0);
  const goodMW = scopedLines.reduce((acc, l) => acc + l.goodMW, 0);
  const mediumMW = scopedLines.reduce((acc, l) => acc + l.mediumMW, 0);
  const lowMW = scopedLines.reduce((acc, l) => acc + l.lowMW, 0);
  const scopedAvailableMW = scopedLines.reduce((acc, l) => acc + l.availableMW, 0) * cellTypeMult;
  const scopedInstalledMW = scopedLines.reduce((acc, l) => acc + l.installedMW, 0) * cellTypeMult;

  const grade: GradeBreakdown = {
    goodMW,
    goodMn: goodMW / AVG_CELL_WATTAGE,
    goodTargetMW: targetMW * 0.92,
    mediumMW,
    mediumMn: mediumMW / AVG_CELL_WATTAGE,
    lowMW,
    lowMn: lowMW / AVG_CELL_WATTAGE,
    totalMW: goodMW + mediumMW + lowMW,
    totalMn: (goodMW + mediumMW + lowMW) / AVG_CELL_WATTAGE,
    goodPct: (goodMW / (goodMW + mediumMW + lowMW)) * 100,
    mediumPct: (mediumMW / (goodMW + mediumMW + lowMW)) * 100,
    lowPct: (lowMW / (goodMW + mediumMW + lowMW)) * 100,
  };

  const byLine: LineProductionRow[] = lines.map((l) => ({
    id: l.id,
    name: l.name,
    productionMW: l.actualMW,
    targetMW: l.targetMW,
    achievementPct: (l.actualMW / l.targetMW) * 100,
    capacityUtilizationPct: l.performancePct,
    goodGradePct: l.goodSharePct,
    status: (() => {
      const scores = [
        statusHigherIsBetter(l.actualMW, l.targetMW, 3),
        statusHigherIsBetter(l.performancePct, MFG_TARGETS.performanceTargetPct, 4, 1.5),
        statusHigherIsBetter(l.availabilityPct, MFG_TARGETS.availabilityTargetPct, 5, 2),
      ];
      if (scores.includes("critical")) return "critical";
      if (scores.includes("watch")) return "watch";
      return "good";
    })(),
  }));

  const production: ProductionData = {
    grade,
    vsTarget: {
      actualMW,
      targetMW,
      varianceMW: actualMW - targetMW,
      achievementPct: (actualMW / targetMW) * 100,
    },
    capacity: {
      installedMW: scopedInstalledMW,
      availableMW: scopedAvailableMW,
      actualMW,
      availabilityPct: (scopedAvailableMW / scopedInstalledMW) * 100,
      utilizationPct: capacityUtilizationPct(actualMW, scopedAvailableMW),
    },
    byLine,
    trend: [],
  };

  // --- Equipment / OEE ---
  // Equipment-level availability is seeded from the bottom-up line calc, then
  // re-distributed with per-equipment noise. OEE's Availability factor reuses
  // the resulting equipmentAvailability.overallPct (not the pre-noise seed)
  // so the two never contradict each other on screen.
  const { overall: equipmentAvailability } = buildEquipment(plantAvailabilityPct, seedKey);
  const performancePct = clamp(
    lines.reduce((acc, l) => acc + l.performancePct, 0) / lines.length + noise(`${seedKey}-plant-perf`, 0.4),
    60,
    99,
  );
  const fpyPct = clamp(MFG_TARGETS.fpyTargetPct - 0.6 + noise(`${scopeSeed}-fpy`, 2.2), 85, 99.5);

  const oee = {
    oeePct: oeePct(equipmentAvailability.overallPct, performancePct, fpyPct),
    targetPct: MFG_TARGETS.oeeTargetPct,
    availabilityPct: equipmentAvailability.overallPct,
    performancePct,
    qualityPct: fpyPct,
  };

  const processParameters: ProcessParameterRow[] = PROCESS_PARAMETERS.map((p) => {
    const actual = p.target + noise(`${p.id}-${scopeSeed}`, p.tolerance * 1.15);
    return {
      id: p.id,
      processStepId: p.processStepId,
      name: p.name,
      actual,
      target: p.target,
      tolerance: p.tolerance,
      unit: p.unit,
      status: statusFromTolerance(actual, p.target, p.tolerance),
    };
  });

  // --- Process & Yield ---
  const waferYieldPct = clamp(MFG_TARGETS.waferToCellYieldTargetPct - 1.4 + noise(`${scopeSeed}-yield`, 1.4), 88, 99.5);
  const cellOutputMn = grade.totalMn;
  const waferInputMn = cellOutputMn / (waferYieldPct / 100);
  const totalLossMn = waferInputMn - cellOutputMn;
  const breakageShareOfLoss = 0.35;
  const brokenWafersMn = totalLossMn * breakageShareOfLoss;
  const processLossMn = totalLossMn - brokenWafersMn;
  const waferBreakagePctValue = (brokenWafersMn / waferInputMn) * 100;
  const processLossPctValue = (processLossMn / waferInputMn) * 100;

  const { steps: stepYields, flow: processFlow } = buildProcessFlowAndStepYields(waferYieldPct);
  let runningInput = waferInputMn;
  for (const step of stepYields) {
    step.inputMn = runningInput;
    step.outputMn = runningInput * (step.yieldPct / 100);
    runningInput = step.outputMn;
  }

  const waferBreakageByStep = WAFER_BREAKAGE_STEPS.map((s) => ({
    key: s.key,
    label: s.label,
    brokenWafersMn: brokenWafersMn * s.share,
    pctOfBreakage: s.share * 100,
  }));

  const processLossCategories: ProcessLossCategory[] = PROCESS_LOSS_CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    quantityMn: processLossMn * c.share,
    pctOfInput: processLossPctValue * c.share,
    pctOfLoss: c.share * 100,
  }));

  const cellTypeMod = CELL_TYPE_MODIFIERS[filters.cellType] ?? CELL_TYPE_MODIFIERS.all;
  const cellEfficiencyAvg = clamp(
    MFG_TARGETS.cellEfficiencyTargetPct - 0.15 + cellTypeMod.efficiencyOffsetPct + noise(`${scopeSeed}-eff`, 0.3),
    22,
    26.5,
  );
  const cellEfficiencyByLine: CellEfficiencyBreakdownItem[] = lines.map((l) => ({
    id: l.id,
    name: l.name,
    valuePct: clamp(cellEfficiencyAvg + (l.goodSharePct - 92) * 0.05 + noise(`${l.id}-${scopeSeed}-eff`, 0.15), 22, 26.5),
  }));

  const processYield = {
    waferToCellYield: {
      pct: waferToCellYieldPct(waferInputMn, cellOutputMn),
      targetPct: MFG_TARGETS.waferToCellYieldTargetPct,
      waferInputMn,
      cellOutputMn,
    },
    waferBreakage: {
      pct: waferBreakagePctValue,
      targetPct: MFG_TARGETS.waferBreakageTargetPct,
      brokenWafersMn,
      byProcessStep: waferBreakageByStep,
    },
    stepYields,
    cellEfficiency: {
      avgPct: cellEfficiencyAvg,
      targetPct: MFG_TARGETS.cellEfficiencyTargetPct,
      variancePct: cellEfficiencyAvg - MFG_TARGETS.cellEfficiencyTargetPct,
      byLine: cellEfficiencyByLine,
    },
    processLoss: {
      totalPct: processLossPctValue,
      targetPct: MFG_TARGETS.processLossTargetPct,
      categories: processLossCategories,
    },
  };

  // --- Quality ---
  const defectRatePct = 100 - fpyPct;
  const totalCellsCount = cellOutputMn * 1_000_000;
  const defectCount = totalCellsCount * (defectRatePct / 100);
  const defects: DefectCategory[] = DEFECT_CATEGORIES.map((c) => ({
    key: c.key,
    label: c.label,
    count: Math.round(defectCount * c.share),
    pctOfDefects: c.share * 100,
    trendPct: noise(`${c.key}-${scopeSeed}-trend`, 6),
  }));
  const reworkPctValue = clamp(defectRatePct * 0.4 + noise(`${scopeSeed}-rework`, 0.3), 0.5, 8);
  // Rework recovers a portion of first-pass failures before final release, so
  // Final Quality Pass sits at or above FPY, never below it.
  const finalPassPct = clamp(fpyPct + reworkPctValue * 0.6, fpyPct, 99.5);

  const topDefects = [...defects].sort((a, b) => b.count - a.count).slice(0, 3);

  const quality = {
    fpyPct,
    fpyTargetPct: MFG_TARGETS.fpyTargetPct,
    defectRatePct,
    defectRateTargetPct: 100 - MFG_TARGETS.fpyTargetPct,
    defects,
    reworkPct: reworkPctValue,
    reworkTargetPct: MFG_TARGETS.reworkTargetPct,
    finalQualityPassPct: finalPassPct,
    finalQualityPassTargetPct: MFG_TARGETS.finalQualityPassTargetPct,
    finalFailPct: 100 - finalPassPct,
    mainFailureReasons: topDefects.map((d) => ({ label: d.label, pct: d.pctOfDefects })),
  };

  const alerts = generateAlerts({
    production,
    byLine,
    oee,
    equipmentAvailability,
    waferBreakagePctValue,
    processLossPctValue,
    quality,
  });

  return {
    filters,
    scopeLabel: scopeLabelFor(filters),
    periodLabel: periodLabelFor(filters),
    lastUpdated: MFG_DEFAULT_LAST_UPDATED,
    production,
    processYield,
    equipment: { oee, equipmentAvailability, processParameters },
    quality,
    processFlow,
    alerts,
  };
}

function generateAlerts(ctx: {
  production: ProductionData;
  byLine: LineProductionRow[];
  oee: { oeePct: number; targetPct: number; availabilityPct: number };
  equipmentAvailability: EquipmentAvailabilityData;
  waferBreakagePctValue: number;
  processLossPctValue: number;
  quality: {
    finalQualityPassPct: number;
    finalQualityPassTargetPct: number;
    mainFailureReasons: { label: string; pct: number }[];
  };
}): ManufacturingAlert[] {
  const alerts: ManufacturingAlert[] = [];

  if (ctx.production.vsTarget.achievementPct < 97) {
    alerts.push({
      id: "production-below-target",
      severity: ctx.production.vsTarget.achievementPct < 93 ? "critical" : "warning",
      metric: "Production",
      message: `Production is ${ctx.production.vsTarget.achievementPct.toFixed(1)}% of target (${ctx.production.vsTarget.varianceMW.toFixed(1)} MW variance)`,
    });
  }

  const worstLine = [...ctx.byLine].sort((a, b) => a.achievementPct - b.achievementPct)[0];
  if (worstLine && worstLine.achievementPct < 95) {
    alerts.push({
      id: "line-below-target",
      severity: worstLine.achievementPct < 90 ? "critical" : "warning",
      metric: "Production by Line",
      message: `${worstLine.name} is the lowest-performing line at ${worstLine.achievementPct.toFixed(1)}% of target`,
    });
  }

  if (ctx.waferBreakagePctValue > MFG_TARGETS.waferBreakageTargetPct) {
    const topStep = [...WAFER_BREAKAGE_STEPS].sort((a, b) => b.share - a.share)[0];
    alerts.push({
      id: "wafer-breakage",
      severity: ctx.waferBreakagePctValue > MFG_TARGETS.waferBreakageTargetPct * 1.6 ? "critical" : "warning",
      metric: "Wafer Breakage",
      message: `Wafer breakage is ${ctx.waferBreakagePctValue.toFixed(1)}% vs target ${MFG_TARGETS.waferBreakageTargetPct.toFixed(1)}% - highest loss at ${topStep.label}`,
    });
  }

  if (ctx.processLossPctValue > MFG_TARGETS.processLossTargetPct) {
    alerts.push({
      id: "process-loss",
      severity: "warning",
      metric: "Process Loss / Scrap",
      message: `Process loss/scrap is ${ctx.processLossPctValue.toFixed(1)}% vs target ${MFG_TARGETS.processLossTargetPct.toFixed(1)}%`,
    });
  }

  if (ctx.oee.oeePct < ctx.oee.targetPct) {
    const gapToAvailability = ctx.oee.targetPct - ctx.oee.availabilityPct;
    alerts.push({
      id: "oee-below-target",
      severity: ctx.oee.oeePct < ctx.oee.targetPct - 8 ? "critical" : "warning",
      metric: "OEE",
      message: `OEE is ${ctx.oee.oeePct.toFixed(0)}% vs target ${ctx.oee.targetPct.toFixed(0)}% - main issue: ${
        gapToAvailability > 0 ? "equipment availability" : "performance / quality losses"
      }`,
    });
  }

  if (ctx.equipmentAvailability.overallPct < ctx.equipmentAvailability.targetPct - 2) {
    const worstEquipment = [...ctx.equipmentAvailability.byEquipment].sort(
      (a, b) => a.availabilityPct - b.availabilityPct,
    )[0];
    alerts.push({
      id: "equipment-availability",
      severity: "warning",
      metric: "Equipment Availability",
      message: `Equipment availability is ${ctx.equipmentAvailability.overallPct.toFixed(1)}%, below target - ${worstEquipment.name} is the biggest contributor`,
    });
  }

  if (ctx.quality.finalQualityPassPct < ctx.quality.finalQualityPassTargetPct) {
    const reason = ctx.quality.mainFailureReasons[0];
    alerts.push({
      id: "final-quality-pass",
      severity: ctx.quality.finalQualityPassPct < ctx.quality.finalQualityPassTargetPct - 2 ? "critical" : "warning",
      metric: "Final Quality Pass",
      message: `Final Quality Pass is ${ctx.quality.finalQualityPassPct.toFixed(1)}% vs target ${ctx.quality.finalQualityPassTargetPct.toFixed(0)}% - main issue: ${reason?.label ?? "mixed causes"}`,
    });
  } else {
    alerts.push({
      id: "final-quality-pass-positive",
      severity: "positive",
      metric: "Final Quality Pass",
      message: `Final Quality Pass is ${ctx.quality.finalQualityPassPct.toFixed(1)}%, at or above the ${ctx.quality.finalQualityPassTargetPct.toFixed(0)}% target`,
    });
  }

  const severityRank: Record<string, number> = { critical: 0, warning: 1, positive: 2 };
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, 5);
}
