import type { ChemicalConsumedBy, UtilityPeriod } from "@/types/utility";

export const UTIL_PLANT_NAME_NOTE = "LAPLACE Utilities - 1.2 GW TOPCon Cell Manufacturing";

// Same 360-day/12-month/3-shift operating calendar convention already used by
// manufacturingConstants.ts, extended with hour counts for downtime-impact math.
export const OPERATING_DAYS_PER_YEAR = 360;
export const OPERATING_DAYS_PER_MONTH = 30;
export const OPERATING_WEEKS_PER_YEAR = 52;
export const SHIFTS_PER_DAY = 3;
export const HOURS_PER_SHIFT = 8;

export const PERIOD_HOURS: Record<UtilityPeriod, number> = {
  shift: HOURS_PER_SHIFT,
  day: 24,
  week: 7 * 24,
  month: OPERATING_DAYS_PER_MONTH * 24,
  year: OPERATING_DAYS_PER_YEAR * 24,
};

export const UTIL_PERIOD_LABELS: Record<UtilityPeriod, string> = {
  shift: "Shift",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

export const UTILITY_AREAS: { id: string; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "power", label: "Power" },
  { id: "gas", label: "Gas" },
  { id: "water", label: "Water" },
  { id: "hvac", label: "HVAC" },
  { id: "compressedAir", label: "Compressed Air" },
  { id: "vacuum", label: "Vacuum" },
  { id: "chemicals", label: "Chemicals" },
  { id: "cost", label: "Cost" },
  { id: "downtime", label: "Downtime Impact" },
];

// ---------------------------------------------------------------------------
// Power & Electrical
// ---------------------------------------------------------------------------
// Real source: EMS / energy meters (DISCOM interface meter + sub-meters per
// bus) would feed totalConsumption, peak demand and power factor directly;
// sanctioned capacity and tariff rates come from the utility's tariff master.

/** Factory's own electrical draw from the grid - unrelated to the 1.2 GW cell
 * OUTPUT capacity. A large TOPCon fab of this scale realistically draws
 * tens of MW continuously (diffusion furnaces, cleanroom HVAC, PECVD). */
export const SANCTIONED_DEMAND_KVA = 55_000;
export const ENERGY_RATE_RS_PER_KWH = 8.2;
/** Excess-demand penalty tariff slab, prorated by period length below. */
export const EXCESS_DEMAND_PENALTY_RS_PER_KVA_PER_MONTH = 450;
export const POWER_FACTOR_TARGET_PCT = 97;
/** Specific energy consumption target - kWh of grid power per Watt of good
 * cell output. Assumption calibrated for a modern, cleanroom-heavy TOPCon
 * line (published fab figures for solar cell manufacturing broadly range
 * ~0.12-0.20 kWh/Wp); documented here so it is trivially tunable later. */
export const POWER_CONSUMPTION_PER_W_TARGET_KWH = 0.15;
export const GRID_AVAILABILITY_TARGET_PCT = 99.5;
export const BACKUP_AVAILABILITY_TARGET_PCT = 99.9;

/** Standby diesel generator profile backing "Backup Power Availability %". */
export const DG_PROFILE = {
  capacityKVA: 2000,
  specificFuelConsumptionLPerKWh: 0.25,
  dieselPriceRsPerL: 92,
  // Typical standby run-time for testing/brief ride-through, not full backup duty.
  assumedRunHoursPerDay: 0.5,
  // Partial-load factor typical of standby-only running (rarely at full rated load).
  typicalLoadFactor: 0.7,
};

/**
 * Single source of truth for how plant power is consumed. HVAC, Compressed
 * Air, and (via processEquipmentVacuumSharePct below) Vacuum all read their
 * MWh figure from this breakdown - see utilityGenerator.ts. Shares are
 * illustrative for a cleanroom-heavy solar cell fab (HVAC and process tools
 * dominate) and sum to 1.
 */
export const PLANT_POWER_BREAKDOWN_WEIGHTS: { key: string; label: string; share: number }[] = [
  { key: "processEquipment", label: "Process Equipment", share: 0.42 },
  { key: "hvac", label: "HVAC", share: 0.22 },
  { key: "pumps", label: "Pumps", share: 0.08 },
  { key: "chillers", label: "Chillers", share: 0.1 },
  { key: "compressedAir", label: "Compressed Air", share: 0.07 },
  { key: "waterSystems", label: "Water Systems", share: 0.04 },
  { key: "lighting", label: "Lighting", share: 0.03 },
  { key: "other", label: "Other", share: 0.04 },
];

/** Vacuum pumps (PECVD/LPCVD/ALD chambers) are wired into the Process
 * Equipment bucket rather than metered separately - this carves out a named
 * sub-share for the Vacuum section and the cost rollup, so vacuum power is
 * traceable without adding a competing top-level breakdown row (which would
 * double count against Process Equipment). Documented assumption. */
export const PROCESS_EQUIPMENT_VACUUM_SHARE_PCT = 0.15;

// ---------------------------------------------------------------------------
// Gas System
// ---------------------------------------------------------------------------
// Real source: PLC flow meters per gas line + gas-type tank/cylinder-farm
// sensors (mass flow controllers already log this at the tool level).

export const GAS_TYPES: { key: string; label: string; unit: string; share: number; unitCostRs: number }[] = [
  { key: "n2", label: "Nitrogen (N2)", unit: "Nm³", share: 0.55, unitCostRs: 8 },
  { key: "o2", label: "Oxygen (O2)", unit: "Nm³", share: 0.12, unitCostRs: 15 },
  { key: "ar", label: "Argon (Ar)", unit: "Nm³", share: 0.1, unitCostRs: 90 },
  { key: "sih4", label: "Silane (SiH4)", unit: "kg", share: 0.1, unitCostRs: 450 },
  { key: "nh3", label: "Ammonia (NH3)", unit: "kg", share: 0.07, unitCostRs: 120 },
  { key: "ph3", label: "Phosphine, diluted (PH3)", unit: "kg", share: 0.06, unitCostRs: 900 },
];
/** Total gas spend as a fraction of production, used to size GAS_TYPES'
 * absolute quantities (their `share` above splits this total). */
export const GAS_COST_PER_W_TARGET = 0.62;
export const GAS_AVAILABILITY_TARGET_PCT = 99.5;

// ---------------------------------------------------------------------------
// Water System
// ---------------------------------------------------------------------------
// Real source: RO skid PLC (feed/product/reject flow meters), BMS/analyzers
// for UPW resistivity & TOC, cooling tower BMS, ETP SCADA for inlet/outlet.

export const FRESH_WATER_RATE_RS_PER_KL = 45;
export const RO_RECOVERY_TARGET_PCT = 75;
/** Physical intensity assumptions sizing the water balance from production,
 * calibrated for a UPW-intensive TOPCon line (RCA cleans, texturing rinses). */
export const FRESH_WATER_PER_W_L_TARGET = 0.012;
export const UPW_SHARE_OF_RO_PRODUCT = 0.85;
export const COOLING_CIRCULATION_PER_W_L_TARGET = 0.05;
export const UPW_AVAILABILITY_TARGET_PCT = 99.5;
export const UPW_RESISTIVITY_TARGET_MOHM_CM = 18; // ultrapure water spec, higher is better
export const UPW_TOC_TARGET_PPB = 5; // lower is better
export const COOLING_CYCLES_OF_CONCENTRATION_TARGET = 4.5;
export const COOLING_AVAILABILITY_TARGET_PCT = 99;
/**
 * ETP Recovery % was left undefined in the source requirements. Explicit
 * assumption used throughout this module: Recycled/Reused Water / ETP
 * Inlet x 100 (i.e. how much of what enters the ETP is ultimately returned
 * to the plant rather than discharged).
 */
export const ETP_RECOVERY_TARGET_PCT = 65;
export const ETP_AVAILABILITY_TARGET_PCT = 99;
export const WATER_COST_PER_W_TARGET = 0.12;

export const UPW_USAGE_CATEGORIES: { key: string; label: string; share: number }[] = [
  { key: "process", label: "Process", share: 0.55 },
  { key: "rinsing", label: "Rinsing", share: 0.3 },
  { key: "cleaning", label: "Cleaning", share: 0.1 },
  { key: "other", label: "Other", share: 0.05 },
];

// ---------------------------------------------------------------------------
// HVAC / Compressed Air / Vacuum
// ---------------------------------------------------------------------------

export const HVAC_TARGETS = {
  chilledWaterSupplyTempC: 6.5,
  chilledWaterReturnTempC: 12.5,
  cleanroomTempToleranceC: 1.0,
  cleanroomRHTolerancePct: 5,
  availabilityTargetPct: 99.5,
};

export const COMPRESSORS: { id: string; name: string }[] = [
  { id: "ca-1", name: "Compressor 1" },
  { id: "ca-2", name: "Compressor 2" },
  { id: "ca-3", name: "Compressor 3 (standby)" },
];
export const COMPRESSED_AIR_TARGETS = {
  specificPowerKwPerNm3Min: 6.2,
  dewPointC: -40,
  leakageTargetPct: 8,
  availabilityTargetPct: 99,
};

export const VACUUM_PUMPS: { id: string; name: string }[] = [
  { id: "vac-1", name: "Vacuum Pump 1 (PECVD)" },
  { id: "vac-2", name: "Vacuum Pump 2 (LPCVD)" },
  { id: "vac-3", name: "Vacuum Pump 3 (ALD)" },
];
export const VACUUM_TARGETS = {
  levelTargetMbar: 0.5,
  pumpDownTimeTargetSec: 45,
  availabilityTargetPct: 99,
};

// ---------------------------------------------------------------------------
// Chemicals
// ---------------------------------------------------------------------------
// Real source: CMMS/inventory system (goods-receipt + consumption logging
// against work orders) would feed the ledger directly per chemical.

export const CHEMICAL_TYPES: {
  key: string;
  label: string;
  unit: string;
  unitCostRs: number;
  shareOfPlantSpend: number;
  consumedByShare: Record<ChemicalConsumedBy, number>;
}[] = [
  {
    key: "naoh",
    label: "NaOH (Caustic Soda)",
    unit: "kg",
    unitCostRs: 35,
    shareOfPlantSpend: 0.22,
    consumedByShare: { process: 0.7, etp: 0.25, coolingTreatment: 0, other: 0.05 },
  },
  {
    key: "h2o2",
    label: "H2O2 (Hydrogen Peroxide)",
    unit: "kg",
    unitCostRs: 55,
    shareOfPlantSpend: 0.2,
    consumedByShare: { process: 0.9, etp: 0.05, coolingTreatment: 0, other: 0.05 },
  },
  {
    key: "hf",
    label: "HF (Hydrofluoric Acid)",
    unit: "kg",
    unitCostRs: 180,
    shareOfPlantSpend: 0.24,
    consumedByShare: { process: 0.95, etp: 0.05, coolingTreatment: 0, other: 0 },
  },
  {
    key: "diWater",
    label: "DI Water (bulk consumable)",
    unit: "KL",
    unitCostRs: 5,
    shareOfPlantSpend: 0.08,
    consumedByShare: { process: 0.85, etp: 0.1, coolingTreatment: 0, other: 0.05 },
  },
  {
    key: "hcl",
    label: "HCl (Hydrochloric Acid)",
    unit: "kg",
    unitCostRs: 25,
    shareOfPlantSpend: 0.14,
    consumedByShare: { process: 0.6, etp: 0.3, coolingTreatment: 0.1, other: 0 },
  },
  {
    key: "antiscalant",
    label: "Antiscalant",
    unit: "kg",
    unitCostRs: 150,
    shareOfPlantSpend: 0.06,
    consumedByShare: { process: 0, etp: 0, coolingTreatment: 0.9, other: 0.1 },
  },
  {
    key: "biocide",
    label: "Biocide (Cooling Treatment)",
    unit: "kg",
    unitCostRs: 200,
    shareOfPlantSpend: 0.04,
    consumedByShare: { process: 0, etp: 0, coolingTreatment: 1, other: 0 },
  },
  {
    key: "flocculant",
    label: "Flocculant / Polymer (ETP)",
    unit: "kg",
    unitCostRs: 120,
    shareOfPlantSpend: 0.02,
    consumedByShare: { process: 0, etp: 1, coolingTreatment: 0, other: 0 },
  },
];
export const CHEMICALS_COST_PER_W_TARGET = 1.25;

// ---------------------------------------------------------------------------
// Downtime & Economic Impact
// ---------------------------------------------------------------------------
// Assumption: fraction of plant production capacity that stalls when a given
// utility is unavailable, e.g. a grid outage stops ~everything, while an ETP
// shortfall is mostly a compliance/discharge risk with little direct
// production stoppage. Documented here so it is easy to recalibrate.
export const AFFECTED_CAPACITY_SHARE: Record<string, number> = {
  power: 1.0,
  gas: 0.55,
  upw: 0.45,
  cooling: 0.35,
  hvac: 0.25,
  compressedAir: 0.45,
  vacuum: 0.3,
  etp: 0.05,
};

/** Cost-reconciliation tolerance band for correction #2's cross-check against
 * the MD Dashboard's COST_COMPONENTS shares - independently modeled tariffs
 * are not expected to match exactly, only to stay in a plausible band. */
export const COST_RECONCILIATION_TOLERANCE_PCT = 25;

export const UTIL_DEFAULT_DATE = "2026-08-26";
export const UTIL_DEFAULT_LAST_UPDATED = "26 Aug 2026, 16:30";
