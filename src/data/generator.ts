import {
  AVG_CELL_WATTAGE,
  CELL_LINES,
  COST_COMPONENTS,
  DEFAULT_LAST_UPDATED,
  LINE_PROFILES,
  LOSS_CATEGORIES,
  MONTHS_PER_YEAR,
  OPERATING_DAYS_PER_MONTH,
  OPERATING_DAYS_PER_YEAR,
  SHIFTS_PER_DAY,
  THEORETICAL_CAPACITY_MW_YEAR,
  VALUE_PER_W_BASE,
  VALUE_PER_W_TARGET,
} from "@/lib/constants";
import { noise } from "@/lib/prng";
import { clamp, statusHigherIsBetter, statusLowerIsBetter } from "@/lib/calculations";
import { formatDateLong, formatMonthYear, formatYear, monthKey } from "@/lib/dateUtils";
import type {
  CapacityMetrics,
  CapacityTrendPoint,
  CellLineId,
  CellLinePerformance,
  ContributionMetrics,
  CostMetrics,
  DashboardData,
  DashboardFilters,
  LossBreakdownItem,
  ManagementAlert,
  ProductionMetrics,
  Status,
  TrendPoint,
  ValueMetrics,
  YieldMetrics,
} from "@/types/dashboard";

function periodSeedKey(filters: DashboardFilters): string {
  switch (filters.period) {
    case "year":
      return formatYear(filters.date);
    case "month":
      return monthKey(filters.date);
    case "shift":
      return `${filters.date}-s${filters.shift}`;
    case "day":
    default:
      return filters.date;
  }
}

function theoreticalMWForPeriod(period: DashboardFilters["period"]): number {
  const dailyTheoretical = THEORETICAL_CAPACITY_MW_YEAR / OPERATING_DAYS_PER_YEAR;
  switch (period) {
    case "year":
      return THEORETICAL_CAPACITY_MW_YEAR;
    case "month":
      return dailyTheoretical * OPERATING_DAYS_PER_MONTH;
    case "shift":
      return dailyTheoretical / SHIFTS_PER_DAY;
    case "day":
    default:
      return dailyTheoretical;
  }
}

interface LineComputed {
  id: CellLineId;
  name: string;
  production: ProductionMetrics;
  capacity: CapacityMetrics;
  yieldMetrics: YieldMetrics;
  cost: CostMetrics;
  value: ValueMetrics;
  contribution: ContributionMetrics;
  status: Status;
}

function computeLine(
  id: CellLineId,
  name: string,
  lineTheoreticalMW: number,
  seedKey: string,
): LineComputed {
  const profile = LINE_PROFILES[id];
  const seed = `${id}-${seedKey}`;

  const availabilityPct = clamp(
    profile.availabilityPct + noise(`${seed}-avail`, 1.4),
    75,
    99.5,
  );
  const utilizationOfAvailablePct = clamp(
    profile.utilizationOfAvailablePct + noise(`${seed}-uoa`, 1.4),
    75,
    99.5,
  );
  const availableMW = (lineTheoreticalMW * availabilityPct) / 100;
  const actualMW = (availableMW * utilizationOfAvailablePct) / 100;
  const overallUtilizationPct = (actualMW / lineTheoreticalMW) * 100;

  const availabilityTargetPct = profile.availabilityTargetPct;
  const utilizationOfAvailableTargetPct = profile.utilizationOfAvailableTargetPct;
  const overallUtilizationTargetPct =
    (availabilityTargetPct * utilizationOfAvailableTargetPct) / 100;
  const availableTargetMW = (lineTheoreticalMW * availabilityTargetPct) / 100;
  const targetMW = (availableTargetMW * utilizationOfAvailableTargetPct) / 100;

  const capacity: CapacityMetrics = {
    theoreticalMW: lineTheoreticalMW,
    availableMW,
    availabilityPct,
    availabilityTargetPct,
    utilizedMW: actualMW,
    utilizationOfAvailablePct,
    utilizationOfAvailableTargetPct,
    overallUtilizationPct,
    overallUtilizationTargetPct,
  };

  const yieldPct = clamp(profile.yieldPct + noise(`${seed}-yield`, 0.35), 90, 99.5);
  const totalCellsMn = actualMW / AVG_CELL_WATTAGE;
  const waferInputMn = totalCellsMn / (yieldPct / 100);

  const yieldMetrics: YieldMetrics = {
    waferInputMn,
    cellOutputMn: totalCellsMn,
    yieldPct,
    yieldTargetPct: profile.yieldTargetPct,
    lossPct: 100 - yieldPct,
  };

  // Grade split of cell output - Line 3 skews slightly worse.
  const gradeBias = id === "line3" ? -1.2 : id === "line2" ? 0.5 : 0;
  const goodSharePct = clamp(93.18 + gradeBias + noise(`${seed}-good`, 0.6), 88, 96.5);
  const lowSharePct = clamp(2.27 - gradeBias * 0.4 + noise(`${seed}-low`, 0.3), 1, 4.5);
  const mediumSharePct = clamp(100 - goodSharePct - lowSharePct, 1, 8);

  const goodMW = (actualMW * goodSharePct) / 100;
  const mediumMW = (actualMW * mediumSharePct) / 100;
  const lowMW = (actualMW * lowSharePct) / 100;

  const production: ProductionMetrics = {
    actualMW,
    targetMW,
    achievementPct: (actualMW / targetMW) * 100,
    goodMW,
    mediumMW,
    lowMW,
    goodCellsMn: goodMW / AVG_CELL_WATTAGE,
    mediumCellsMn: mediumMW / AVG_CELL_WATTAGE,
    lowCellsMn: lowMW / AVG_CELL_WATTAGE,
    totalCellsMn,
  };

  const costPerW = clamp(profile.costPerW + noise(`${seed}-cost`, 0.12), 11, 17);
  const totalCostCr = (costPerW * actualMW) / 10;
  const cost: CostMetrics = {
    actualPerW: costPerW,
    targetPerW: profile.costTargetPerW,
    variancePerW: costPerW - profile.costTargetPerW,
    totalCostCr,
    breakdown: COST_COMPONENTS.map((c) => ({
      component: c.label,
      valuePerW: costPerW * c.share,
      pctOfTotal: c.share * 100,
    })),
  };

  const valuePerW = clamp(
    VALUE_PER_W_BASE + (goodSharePct - 93.18) * 0.08 + noise(`${seed}-value`, 0.18),
    13,
    19,
  );
  const totalValueCr = (valuePerW * actualMW) / 10;
  const value: ValueMetrics = {
    actualPerW: valuePerW,
    targetPerW: VALUE_PER_W_TARGET,
    variancePerW: valuePerW - VALUE_PER_W_TARGET,
    totalValueCr,
  };

  const contributionPerW = valuePerW - costPerW;
  const contributionTargetPerW = VALUE_PER_W_TARGET - profile.costTargetPerW;
  const contribution: ContributionMetrics = {
    perW: contributionPerW,
    targetPerW: contributionTargetPerW,
    variancePerW: contributionPerW - contributionTargetPerW,
    totalCr: totalValueCr - totalCostCr,
  };

  const status: Status = deriveLineStatus(production, capacity, cost);

  return { id, name, production, capacity, yieldMetrics, cost, value, contribution, status };
}

function deriveLineStatus(
  production: ProductionMetrics,
  capacity: CapacityMetrics,
  cost: CostMetrics,
): Status {
  const scores: Status[] = [
    statusHigherIsBetter(production.actualMW, production.targetMW, 3),
    statusHigherIsBetter(capacity.overallUtilizationPct, capacity.overallUtilizationTargetPct, 3),
    statusLowerIsBetter(cost.actualPerW, cost.targetPerW, 2.5),
  ];
  if (scores.includes("critical")) return "critical";
  if (scores.includes("watch")) return "watch";
  return "good";
}

function aggregateLines(lines: LineComputed[]): {
  production: ProductionMetrics;
  capacity: CapacityMetrics;
  yieldMetrics: YieldMetrics;
  cost: CostMetrics;
  value: ValueMetrics;
  contribution: ContributionMetrics;
} {
  const sum = (fn: (l: LineComputed) => number) => lines.reduce((acc, l) => acc + fn(l), 0);

  const actualMW = sum((l) => l.production.actualMW);
  const targetMW = sum((l) => l.production.targetMW);
  const goodMW = sum((l) => l.production.goodMW);
  const mediumMW = sum((l) => l.production.mediumMW);
  const lowMW = sum((l) => l.production.lowMW);

  const production: ProductionMetrics = {
    actualMW,
    targetMW,
    achievementPct: (actualMW / targetMW) * 100,
    goodMW,
    mediumMW,
    lowMW,
    goodCellsMn: goodMW / AVG_CELL_WATTAGE,
    mediumCellsMn: mediumMW / AVG_CELL_WATTAGE,
    lowCellsMn: lowMW / AVG_CELL_WATTAGE,
    totalCellsMn: actualMW / AVG_CELL_WATTAGE,
  };

  const theoreticalMW = sum((l) => l.capacity.theoreticalMW);
  const availableMW = sum((l) => l.capacity.availableMW);
  const availableTargetMW = lines.reduce(
    (acc, l) => acc + (l.capacity.theoreticalMW * l.capacity.availabilityTargetPct) / 100,
    0,
  );
  const targetOverall =
    lines.reduce((acc, l) => acc + l.capacity.overallUtilizationTargetPct, 0) / lines.length;

  const capacity: CapacityMetrics = {
    theoreticalMW,
    availableMW,
    availabilityPct: (availableMW / theoreticalMW) * 100,
    availabilityTargetPct: (availableTargetMW / theoreticalMW) * 100,
    utilizedMW: actualMW,
    utilizationOfAvailablePct: (actualMW / availableMW) * 100,
    utilizationOfAvailableTargetPct:
      lines.reduce((acc, l) => acc + l.capacity.utilizationOfAvailableTargetPct, 0) /
      lines.length,
    overallUtilizationPct: (actualMW / theoreticalMW) * 100,
    overallUtilizationTargetPct: targetOverall,
  };

  const waferInputMn = sum((l) => l.yieldMetrics.waferInputMn);
  const cellOutputMn = sum((l) => l.yieldMetrics.cellOutputMn);
  const yieldMetrics: YieldMetrics = {
    waferInputMn,
    cellOutputMn,
    yieldPct: (cellOutputMn / waferInputMn) * 100,
    yieldTargetPct: lines[0].yieldMetrics.yieldTargetPct,
    lossPct: 100 - (cellOutputMn / waferInputMn) * 100,
  };

  const totalCostCr = sum((l) => l.cost.totalCostCr);
  const costActualPerW = (totalCostCr * 10) / actualMW;
  const costTargetPerW =
    lines.reduce((acc, l) => acc + l.cost.targetPerW * l.production.targetMW, 0) / targetMW;
  const cost: CostMetrics = {
    actualPerW: costActualPerW,
    targetPerW: costTargetPerW,
    variancePerW: costActualPerW - costTargetPerW,
    totalCostCr,
    breakdown: COST_COMPONENTS.map((c) => ({
      component: c.label,
      valuePerW: costActualPerW * c.share,
      pctOfTotal: c.share * 100,
    })),
  };

  const totalValueCr = sum((l) => l.value.totalValueCr);
  const valueActualPerW = (totalValueCr * 10) / actualMW;
  const value: ValueMetrics = {
    actualPerW: valueActualPerW,
    targetPerW: VALUE_PER_W_TARGET,
    variancePerW: valueActualPerW - VALUE_PER_W_TARGET,
    totalValueCr,
  };

  const totalContributionCr = totalValueCr - totalCostCr;
  const contribution: ContributionMetrics = {
    perW: valueActualPerW - costActualPerW,
    targetPerW: VALUE_PER_W_TARGET - costTargetPerW,
    variancePerW: valueActualPerW - costActualPerW - (VALUE_PER_W_TARGET - costTargetPerW),
    totalCr: totalContributionCr,
  };

  return { production, capacity, yieldMetrics, cost, value, contribution };
}

/** For additive quantities (MW, Cr) - distributes the period total across buckets. */
function buildTrend(
  totalActual: number,
  totalTarget: number,
  buckets: string[],
  seedBase: string,
  amplitude = 0.09,
): TrendPoint[] {
  const perBucketActual = totalActual / buckets.length;
  const perBucketTarget = totalTarget / buckets.length;
  return buckets.map((label, i) => ({
    label,
    actual: Math.max(0, perBucketActual * (1 + noise(`${seedBase}-${label}-${i}-a`, amplitude))),
    target: perBucketTarget,
  }));
}

/** For rate quantities (Rs/W, %) - fluctuates around the period's actual rate. */
function buildRateTrend(
  actualRate: number,
  targetRate: number,
  buckets: string[],
  seedBase: string,
  amplitude = 0.03,
): TrendPoint[] {
  return buckets.map((label, i) => ({
    label,
    actual: actualRate * (1 + noise(`${seedBase}-${label}-${i}-a`, amplitude)),
    target: targetRate,
  }));
}

function buildCapacityTrend(
  capacity: CapacityMetrics,
  buckets: string[],
  seedBase: string,
): CapacityTrendPoint[] {
  return buckets.map((label, i) => ({
    label,
    availability: clamp(
      capacity.availabilityPct + noise(`${seedBase}-${label}-${i}-av`, 2.2),
      70,
      100,
    ),
    utilizationOfAvailable: clamp(
      capacity.utilizationOfAvailablePct + noise(`${seedBase}-${label}-${i}-uoa`, 2.2),
      70,
      100,
    ),
    overallUtilization: clamp(
      capacity.overallUtilizationPct + noise(`${seedBase}-${label}-${i}-ov`, 2.5),
      60,
      100,
    ),
  }));
}

function trendBuckets(filters: DashboardFilters): string[] {
  switch (filters.period) {
    case "shift":
      return Array.from({ length: 8 }, (_, i) => `Hour ${i + 1}`);
    case "day":
      return ["Shift 1", "Shift 2", "Shift 3"];
    case "month":
      return Array.from({ length: OPERATING_DAYS_PER_MONTH }, (_, i) => `Day ${i + 1}`);
    case "year":
    default:
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].slice(
        0,
        MONTHS_PER_YEAR,
      );
  }
}

function buildLossBreakdown(yieldMetrics: YieldMetrics): LossBreakdownItem[] {
  const totalLossCells = (yieldMetrics.waferInputMn - yieldMetrics.cellOutputMn) * 1_000_000;
  return LOSS_CATEGORIES.map((c) => ({
    category: c.label,
    quantity: Math.round(totalLossCells * c.share),
    pctOfTotal: c.share * 100,
  }));
}

function generateAlerts(
  lines: LineComputed[],
  plant: ReturnType<typeof aggregateLines>,
): ManagementAlert[] {
  const alerts: ManagementAlert[] = [];

  const worstLine = [...lines].sort(
    (a, b) => a.production.achievementPct - b.production.achievementPct,
  )[0];
  if (worstLine.production.achievementPct < 97) {
    alerts.push({
      id: "line-achievement",
      severity: worstLine.production.achievementPct < 94 ? "critical" : "warning",
      metric: "Production Achievement",
      message: `${worstLine.name} production achievement is ${worstLine.production.achievementPct.toFixed(
        1,
      )}% against 100% target`,
    });
  }

  const worstCapacityLine = [...lines].sort(
    (a, b) => a.capacity.overallUtilizationPct - b.capacity.overallUtilizationPct,
  )[0];
  if (
    worstCapacityLine.capacity.overallUtilizationPct <
    worstCapacityLine.capacity.overallUtilizationTargetPct - 3
  ) {
    alerts.push({
      id: "line-capacity",
      severity: "warning",
      metric: "Capacity Utilization",
      message: `${worstCapacityLine.name} capacity utilization is ${worstCapacityLine.capacity.overallUtilizationPct.toFixed(
        1,
      )}%, below the ${worstCapacityLine.capacity.overallUtilizationTargetPct.toFixed(0)}% target`,
    });
  }

  const topLoss = [...LOSS_CATEGORIES].sort((a, b) => b.share - a.share)[0];
  if (topLoss.share >= 0.3) {
    alerts.push({
      id: "loss-category",
      severity: "critical",
      metric: "Process Loss",
      message: `${topLoss.label} is the leading process loss at ${(topLoss.share * 100).toFixed(
        0,
      )}% of total rejections`,
    });
  }

  if (plant.cost.variancePerW > 0) {
    alerts.push({
      id: "cost-variance",
      severity: plant.cost.variancePerW > 0.5 ? "critical" : "warning",
      metric: "Manufacturing Cost/W",
      message: `Manufacturing Cost/W is ₹${plant.cost.variancePerW.toFixed(2)} above target`,
    });
  }

  if (plant.capacity.availabilityPct < plant.capacity.availabilityTargetPct - 1) {
    alerts.push({
      id: "availability",
      severity: "warning",
      metric: "Capacity Availability",
      message: `Capacity availability is ${plant.capacity.availabilityPct.toFixed(
        1,
      )}%, below the ${plant.capacity.availabilityTargetPct.toFixed(0)}% target`,
    });
  }

  if (plant.value.variancePerW > 0) {
    alerts.push({
      id: "value-positive",
      severity: "positive",
      metric: "Realised Value/W",
      message: `Realised Value/W is ₹${plant.value.variancePerW.toFixed(2)} above target`,
    });
  }

  if (plant.contribution.variancePerW < 0) {
    alerts.push({
      id: "contribution-gap",
      severity: Math.abs(plant.contribution.variancePerW) > 0.15 ? "critical" : "warning",
      metric: "Contribution/W",
      message: `Contribution/W is ₹${Math.abs(plant.contribution.variancePerW).toFixed(
        2,
      )} below the ₹${plant.contribution.targetPerW.toFixed(2)} target`,
    });
  } else if (plant.contribution.variancePerW > 0.05) {
    alerts.push({
      id: "contribution-positive",
      severity: "positive",
      metric: "Contribution/W",
      message: `Contribution/W is ₹${plant.contribution.variancePerW.toFixed(2)} above target`,
    });
  }

  const severityRank: Record<string, number> = { critical: 0, warning: 1, positive: 2 };
  return alerts
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 5);
}

function scopeLabelFor(filters: DashboardFilters): string {
  if (filters.line === "all") return "All Cell Lines";
  return CELL_LINES.find((l) => l.id === filters.line)?.name ?? "All Cell Lines";
}

function periodLabelFor(filters: DashboardFilters): string {
  switch (filters.period) {
    case "year":
      return formatYear(filters.date);
    case "month":
      return formatMonthYear(filters.date);
    case "shift":
      return `${formatDateLong(filters.date)} · Shift ${filters.shift}`;
    case "day":
    default:
      return formatDateLong(filters.date);
  }
}

/** Generates full trend/detail data scoped to a single line, regardless of the global line filter. Used by line drill-downs. */
export function generateLineDetail(filters: DashboardFilters, lineId: CellLineId): DashboardData {
  return generateDashboardData({ ...filters, line: lineId });
}

export function generateDashboardData(filters: DashboardFilters): DashboardData {
  const seedKey = periodSeedKey(filters);
  const plantTheoreticalMW = theoreticalMWForPeriod(filters.period);
  const lineTheoreticalMW = plantTheoreticalMW / CELL_LINES.length;

  const lines = CELL_LINES.map((l) => computeLine(l.id, l.name, lineTheoreticalMW, seedKey));
  const plant = aggregateLines(lines);

  const scoped = filters.line === "all" ? plant : lines.find((l) => l.id === filters.line)!;

  const buckets = trendBuckets(filters);
  const trendSeed = `${seedKey}-${filters.line}`;

  const cellLines: CellLinePerformance[] = lines.map((l) => ({
    id: l.id,
    name: l.name,
    production: l.production,
    capacity: l.capacity,
    yieldMetrics: l.yieldMetrics,
    cost: l.cost,
    value: l.value,
    contribution: l.contribution,
    status: l.status,
  }));

  return {
    filters,
    scopeLabel: scopeLabelFor(filters),
    periodLabel: periodLabelFor(filters),
    lastUpdated: DEFAULT_LAST_UPDATED,
    production: scoped.production,
    capacity: scoped.capacity,
    yieldMetrics: scoped.yieldMetrics,
    cost: scoped.cost,
    value: scoped.value,
    contribution: scoped.contribution,
    lossBreakdown: buildLossBreakdown(scoped.yieldMetrics),
    cellLines,
    productionTrend: buildTrend(
      scoped.production.actualMW,
      scoped.production.targetMW,
      buckets,
      `prod-${trendSeed}`,
    ),
    capacityTrend: buildCapacityTrend(scoped.capacity, buckets, `cap-${trendSeed}`),
    costTrend: buildRateTrend(
      scoped.cost.actualPerW,
      scoped.cost.targetPerW,
      buckets,
      `cost-${trendSeed}`,
      0.035,
    ),
    valueTrend: buildRateTrend(
      scoped.value.actualPerW,
      scoped.value.targetPerW,
      buckets,
      `value-${trendSeed}`,
      0.03,
    ),
    contributionTrend: buildRateTrend(
      scoped.contribution.perW,
      scoped.contribution.targetPerW,
      buckets,
      `contrib-${trendSeed}`,
      0.06,
    ),
    totalContributionTrend: buildTrend(
      scoped.contribution.totalCr,
      (scoped.contribution.targetPerW * scoped.production.targetMW) / 10,
      buckets,
      `totalcontrib-${trendSeed}`,
    ),
    alerts: generateAlerts(lines, plant),
  };
}
