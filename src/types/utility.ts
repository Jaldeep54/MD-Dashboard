import type { AlertSeverity, ShiftNumber, Status } from "@/types/dashboard";

export type UtilityPeriod = "shift" | "day" | "week" | "month" | "year";

/**
 * "Area" drives in-page anchor navigation only (see MfgFilterBar's period/line
 * pattern) - it never changes what data is generated. Utilities are computed
 * plant-wide for every period/date/shift, matching how the MD Dashboard
 * computes plant-wide figures rather than being sliced by production line.
 */
export type UtilityArea =
  | "overview"
  | "power"
  | "gas"
  | "water"
  | "hvac"
  | "compressedAir"
  | "vacuum"
  | "chemicals"
  | "cost"
  | "downtime";

export interface UtilityFilters {
  period: UtilityPeriod;
  date: string;
  shift: ShiftNumber;
  area: UtilityArea;
}

// ---------------------------------------------------------------------------
// Power & Electrical
// ---------------------------------------------------------------------------

/**
 * The single source of truth for how plant power is consumed. HVAC,
 * Compressed Air, and Vacuum (via a Process Equipment sub-share) read their
 * power figures from these rows - they never regenerate their own
 * consumption number (see utilityGenerator.ts).
 */
export interface PlantPowerBreakdownRow {
  key: string;
  label: string;
  consumptionMWh: number;
  pctOfTotal: number;
}

export interface PowerMetrics {
  totalConsumptionMWh: number;
  consumptionPerW: number; // kWh per W of production - a physical intensity metric
  costPerW: number;
  costPerWTarget: number;
  totalCostCr: number;
  sanctionedDemandKVA: number;
  peakDemandKVA: number;
  powerFactorPct: number;
  powerFactorTargetPct: number;
  demandPenaltyRs: number;
  gridAvailabilityPct: number;
  gridAvailabilityTargetPct: number;
  backupAvailabilityPct: number;
  dgFuelConsumptionLPerDay: number;
  dgFuelCostRs: number;
  breakdown: PlantPowerBreakdownRow[];
}

// ---------------------------------------------------------------------------
// Gas System
// ---------------------------------------------------------------------------

export interface GasTypeRow {
  key: string;
  label: string;
  unit: string;
  consumption: number;
  costRs: number;
  pctOfTotal: number;
}

export interface GasMetrics {
  totalCostCr: number;
  costPerW: number;
  costPerWTarget: number;
  availabilityPct: number;
  availabilityTargetPct: number;
  byType: GasTypeRow[];
}

// ---------------------------------------------------------------------------
// Water System - Feed/RO/DM, UPW/DI, Cooling, ETP
// ---------------------------------------------------------------------------

export interface ROMetrics {
  feedKL: number;
  productKL: number;
  rejectKL: number;
  recoveryPct: number;
  rejectPct: number;
  recoveryTargetPct: number;
}

export interface UPWUsageRow {
  key: string;
  label: string;
  consumptionKL: number;
  pctOfTotal: number;
}

export interface UPWMetrics {
  consumptionKL: number;
  resistivityMOhmCm: number;
  resistivityTargetMOhmCm: number;
  tocPpb: number;
  tocTargetPpb: number;
  usageBreakdown: UPWUsageRow[];
}

export interface CoolingWaterMetrics {
  circulationKL: number;
  makeupKL: number;
  cyclesOfConcentration: number;
  approachTempC: number;
  rangeTempC: number;
  availabilityPct: number;
  availabilityTargetPct: number;
}

export interface ETPMetrics {
  inletKL: number;
  treatedKL: number;
  recycledKL: number;
  recoveryPct: number; // Recycled / Inlet x 100 - see calculations.ts for the explicit assumption note
  chemicalConsumptionKg: number; // read from the chemical ledger's "etp" consumed-by bucket
  availabilityPct: number;
  availabilityTargetPct: number;
}

export interface WaterMetrics {
  totalCostCr: number;
  costPerW: number;
  costPerWTarget: number;
  freshWaterIntakeKL: number;
  ro: ROMetrics;
  upw: UPWMetrics;
  cooling: CoolingWaterMetrics;
  etp: ETPMetrics;
}

// ---------------------------------------------------------------------------
// HVAC / Compressed Air / Vacuum
// ---------------------------------------------------------------------------

export interface HVACMetrics {
  consumptionMWh: number; // sourced from PlantPowerBreakdownRow "hvac", not regenerated
  chilledWaterSupplyTempC: number;
  chilledWaterReturnTempC: number;
  coolingLoadTR: number;
  cleanroomTempDeviationC: number;
  cleanroomRHDeviationPct: number;
  availabilityPct: number;
  availabilityTargetPct: number;
}

export interface CompressorUnit {
  id: string;
  name: string;
  availabilityPct: number;
}

export interface CompressedAirMetrics {
  consumptionMWh: number; // sourced from PlantPowerBreakdownRow "compressedAir"
  generationNm3: number;
  specificPowerKwPerNm3Min: number;
  dewPointC: number;
  leakagePct: number;
  compressors: CompressorUnit[];
  availabilityPct: number; // multiplicative across `compressors` - series-line model
  availabilityTargetPct: number;
}

export interface VacuumPumpUnit {
  id: string;
  name: string;
  availabilityPct: number;
}

export interface VacuumMetrics {
  /** Vacuum pumps are wired into the Process Equipment bucket of the Plant
   * Power Breakdown rather than their own row (see PROCESS_EQUIPMENT_VACUUM_SHARE
   * in utilityConstants.ts) - consumptionMWh is that carved-out sub-share,
   * not an independently generated figure. */
  consumptionMWh: number;
  vacuumLevelMbar: number;
  vacuumLevelTargetMbar: number;
  pumpDownTimeSec: number;
  pumps: VacuumPumpUnit[];
  availabilityPct: number; // multiplicative across `pumps` - series-line model
  availabilityTargetPct: number;
}

// ---------------------------------------------------------------------------
// Chemicals - single ledger, filtered by consumed-by for ETP/Chemicals sections
// ---------------------------------------------------------------------------

export type ChemicalConsumedBy = "process" | "etp" | "coolingTreatment" | "other";

export interface ChemicalLedgerRow {
  key: string;
  label: string;
  unit: string;
  totalConsumption: number;
  costRs: number;
  consumedBy: Record<ChemicalConsumedBy, number>;
}

export interface ChemicalsMetrics {
  totalCostCr: number;
  costPerW: number;
  costPerWTarget: number;
  ledger: ChemicalLedgerRow[];
}

// ---------------------------------------------------------------------------
// Utility Cost rollup + reconciliation
// ---------------------------------------------------------------------------

export interface UtilityCostRow {
  key: string;
  label: string;
  costCr: number;
  pctOfTotal: number;
}

export interface CostReconciliation {
  utilityRollupPerW: number;
  mdCostComponentsPerW: number;
  variancePct: number;
  withinTolerance: boolean;
}

export interface UtilityCostSummary {
  totalCostCr: number;
  totalCostPerW: number;
  rows: UtilityCostRow[];
  reconciliation: CostReconciliation;
}

// ---------------------------------------------------------------------------
// Utility Availability rollup
// ---------------------------------------------------------------------------

export interface UtilityAvailabilityRow {
  key: string;
  label: string;
  actualPct: number;
  targetPct: number;
  status: Status;
}

// ---------------------------------------------------------------------------
// Utility-Driven Production Downtime & Economic Impact
// ---------------------------------------------------------------------------

export interface DowntimeImpactRow {
  key: string;
  label: string;
  actualAvailabilityPct: number;
  targetAvailabilityPct: number;
  shortfallPct: number;
  downtimeHours: number;
  affectedCapacityShare: number;
  lostProductionMW: number;
  economicImpactCr: number;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface UtilityAlert {
  id: string;
  severity: AlertSeverity;
  message: string;
  metric: string;
}

export interface UtilityExecutiveSummary {
  totalUtilityCostPerW: number;
  totalUtilityCostCr: number;
  plantPowerConsumptionPerW: number;
  compositeAvailabilityPct: number;
}

export interface UtilityData {
  filters: UtilityFilters;
  scopeLabel: string;
  periodLabel: string;
  lastUpdated: string;
  productionMW: number; // sourced from manufacturingGenerator - the shared "/W" denominator
  contributionPerW: number; // sourced from the MD dashboard generator - used for downtime economic impact
  summary: UtilityExecutiveSummary;
  power: PowerMetrics;
  gas: GasMetrics;
  water: WaterMetrics;
  hvac: HVACMetrics;
  compressedAir: CompressedAirMetrics;
  vacuum: VacuumMetrics;
  chemicals: ChemicalsMetrics;
  cost: UtilityCostSummary;
  availability: UtilityAvailabilityRow[];
  downtimeImpact: DowntimeImpactRow[];
  alerts: UtilityAlert[];
}

export type { Status };
