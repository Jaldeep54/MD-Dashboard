import type { AlertSeverity, ShiftNumber, Status } from "@/types/dashboard";

export type MfgPeriod = "shift" | "day" | "week" | "month" | "year";

export interface ProductionLineRef {
  id: string;
  name: string;
}

export interface CellTypeRef {
  id: string;
  name: string;
}

export interface MfgFilters {
  period: MfgPeriod;
  date: string; // ISO date (YYYY-MM-DD)
  shift: ShiftNumber;
  line: "all" | string;
  cellType: "all" | string;
}

export type TrendGranularity = "shift" | "day" | "week" | "month";

export interface TrendPoint {
  label: string;
  actual: number;
  target: number;
}

// ---------------------------------------------------------------------------
// Section A - Production
// ---------------------------------------------------------------------------

export interface GradeBreakdown {
  goodMW: number;
  goodMn: number;
  goodTargetMW: number;
  mediumMW: number;
  mediumMn: number;
  lowMW: number;
  lowMn: number;
  totalMW: number;
  totalMn: number;
  goodPct: number;
  mediumPct: number;
  lowPct: number;
}

export interface ProductionVsTarget {
  actualMW: number;
  targetMW: number;
  varianceMW: number;
  achievementPct: number;
}

export interface CapacityInfo {
  installedMW: number;
  availableMW: number;
  actualMW: number;
  availabilityPct: number; // available / installed
  utilizationPct: number; // actual / available
}

export interface LineProductionRow {
  id: string;
  name: string;
  productionMW: number;
  targetMW: number;
  achievementPct: number;
  capacityUtilizationPct: number;
  goodGradePct: number;
  status: Status;
}

export interface ProductionData {
  grade: GradeBreakdown;
  vsTarget: ProductionVsTarget;
  capacity: CapacityInfo;
  byLine: LineProductionRow[];
  trend: TrendPoint[];
}

// ---------------------------------------------------------------------------
// Section B - Process & Yield
// ---------------------------------------------------------------------------

export interface WaferToCellYieldData {
  pct: number;
  targetPct: number;
  waferInputMn: number;
  cellOutputMn: number;
}

export interface WaferBreakageBreakdownItem {
  key: string;
  label: string;
  brokenWafersMn: number;
  pctOfBreakage: number;
}

export interface WaferBreakageData {
  pct: number;
  targetPct: number;
  brokenWafersMn: number;
  byProcessStep: WaferBreakageBreakdownItem[];
}

export interface ProcessStepYield {
  id: string;
  name: string;
  inputMn: number;
  outputMn: number;
  yieldPct: number;
  targetPct: number;
  status: Status;
}

export interface CellEfficiencyBreakdownItem {
  id: string;
  name: string;
  valuePct: number;
}

export interface CellEfficiencyData {
  avgPct: number;
  targetPct: number;
  variancePct: number;
  byLine: CellEfficiencyBreakdownItem[];
}

export interface ProcessLossCategory {
  key: string;
  label: string;
  quantityMn: number; // wafers lost to this category, in millions
  pctOfInput: number; // % of wafer input lost to this category
  pctOfLoss: number; // % of the non-breakage loss bucket
}

export interface ProcessLossData {
  totalPct: number; // total non-breakage process loss/scrap, % of wafer input
  targetPct: number;
  categories: ProcessLossCategory[];
}

export interface ProcessYieldSectionData {
  waferToCellYield: WaferToCellYieldData;
  waferBreakage: WaferBreakageData;
  stepYields: ProcessStepYield[];
  cellEfficiency: CellEfficiencyData;
  processLoss: ProcessLossData;
}

// ---------------------------------------------------------------------------
// Section C - Equipment Performance
// ---------------------------------------------------------------------------

export interface OEEData {
  oeePct: number;
  targetPct: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
}

export interface EquipmentDowntimeBreakdown {
  breakdownPct: number;
  plannedMaintenancePct: number;
  otherPct: number;
}

export interface EquipmentRow {
  id: string;
  name: string;
  processStepId: string;
  lineId: string;
  availabilityPct: number;
  targetPct: number;
  downtime: EquipmentDowntimeBreakdown;
  status: Status;
}

export interface EquipmentAvailabilityData {
  overallPct: number;
  targetPct: number;
  downtime: EquipmentDowntimeBreakdown;
  byEquipment: EquipmentRow[];
}

export interface ProcessParameterRow {
  id: string;
  processStepId: string;
  name: string;
  actual: number;
  target: number;
  tolerance: number;
  unit: string;
  status: Status;
}

export interface EquipmentPerformanceSectionData {
  oee: OEEData;
  equipmentAvailability: EquipmentAvailabilityData;
  processParameters: ProcessParameterRow[];
}

// ---------------------------------------------------------------------------
// Section D - Quality
// ---------------------------------------------------------------------------

export interface DefectCategory {
  key: string;
  label: string;
  count: number;
  pctOfDefects: number;
  trendPct: number;
}

export interface QualitySectionData {
  fpyPct: number;
  fpyTargetPct: number;
  defectRatePct: number;
  defectRateTargetPct: number;
  defects: DefectCategory[];
  reworkPct: number;
  reworkTargetPct: number;
  finalQualityPassPct: number;
  finalQualityPassTargetPct: number;
  finalFailPct: number;
  mainFailureReasons: { label: string; pct: number }[];
}

// ---------------------------------------------------------------------------
// Process flow + alerts + root
// ---------------------------------------------------------------------------

export interface ProcessFlowStepStatus {
  id: string;
  name: string;
  status: Status;
  yieldPct: number;
  targetPct: number;
}

export interface ManufacturingAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  metric: string;
}

export interface ManufacturingData {
  filters: MfgFilters;
  scopeLabel: string;
  periodLabel: string;
  lastUpdated: string;
  production: ProductionData;
  processYield: ProcessYieldSectionData;
  equipment: EquipmentPerformanceSectionData;
  quality: QualitySectionData;
  processFlow: ProcessFlowStepStatus[];
  alerts: ManufacturingAlert[];
}

export type { Status };
