export type Period = "shift" | "day" | "month" | "year";

export type CellLineId = "line1" | "line2" | "line3" | "line4";

export type LineFilter = "all" | CellLineId;

export type ShiftNumber = 1 | 2 | 3;

export interface DashboardFilters {
  period: Period;
  date: string; // ISO date (YYYY-MM-DD) - anchor date for day/shift; also used to derive month/year
  shift: ShiftNumber;
  line: LineFilter;
}

export type Status = "good" | "watch" | "critical";

export interface ProductionSplit {
  goodMW: number;
  mediumMW: number;
  lowMW: number;
  goodCellsMn: number;
  mediumCellsMn: number;
  lowCellsMn: number;
}

export interface ProductionMetrics extends ProductionSplit {
  actualMW: number;
  targetMW: number;
  achievementPct: number;
  totalCellsMn: number;
}

export interface CapacityMetrics {
  theoreticalMW: number;
  availableMW: number;
  availabilityPct: number;
  availabilityTargetPct: number;
  utilizedMW: number;
  utilizationOfAvailablePct: number;
  utilizationOfAvailableTargetPct: number;
  overallUtilizationPct: number;
  overallUtilizationTargetPct: number;
}

export interface YieldMetrics {
  waferInputMn: number;
  cellOutputMn: number;
  yieldPct: number;
  yieldTargetPct: number;
  lossPct: number;
}

export interface LossBreakdownItem {
  category: string;
  quantity: number;
  pctOfTotal: number;
}

export interface CostComponent {
  component: string;
  valuePerW: number;
  pctOfTotal: number;
}

export interface CostMetrics {
  actualPerW: number;
  targetPerW: number;
  variancePerW: number;
  totalCostCr: number;
  breakdown: CostComponent[];
}

export interface ValueMetrics {
  actualPerW: number;
  targetPerW: number;
  variancePerW: number;
  totalValueCr: number;
}

export interface ContributionMetrics {
  perW: number;
  targetPerW: number;
  variancePerW: number;
  totalCr: number;
}

export interface CellLinePerformance {
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

export interface TrendPoint {
  label: string;
  actual: number;
  target: number;
}

export interface CapacityTrendPoint {
  label: string;
  availability: number;
  utilizationOfAvailable: number;
  overallUtilization: number;
}

export type AlertSeverity = "critical" | "warning" | "positive";

export interface ManagementAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  metric: string;
}

export interface DashboardData {
  filters: DashboardFilters;
  scopeLabel: string;
  periodLabel: string;
  lastUpdated: string;
  production: ProductionMetrics;
  capacity: CapacityMetrics;
  yieldMetrics: YieldMetrics;
  cost: CostMetrics;
  value: ValueMetrics;
  contribution: ContributionMetrics;
  lossBreakdown: LossBreakdownItem[];
  cellLines: CellLinePerformance[];
  productionTrend: TrendPoint[];
  capacityTrend: CapacityTrendPoint[];
  costTrend: TrendPoint[];
  valueTrend: TrendPoint[];
  contributionTrend: TrendPoint[];
  totalContributionTrend: TrendPoint[];
  alerts: ManagementAlert[];
}
