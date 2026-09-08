/**
 * Deterministic dummy-data generator for the Utility Dashboard, structured
 * exactly like manufacturingGenerator.ts: pure function of UtilityFilters,
 * seeded by the shared string-seeded PRNG so a given filter combination
 * always reproduces the same numbers.
 *
 * Real-world source systems this would eventually be replaced by, section by
 * section:
 *   - Power & Electrical      -> EMS / energy meters (DISCOM interface + sub-meters)
 *   - Gas System              -> PLC flow meters per line + gas-type tank/cylinder sensors
 *   - Water (RO/DM, cooling)  -> RO skid PLC, cooling tower BMS
 *   - UPW quality             -> BMS / inline analyzers (resistivity, TOC)
 *   - ETP                     -> ETP SCADA (inlet/outlet flow, treatment status)
 *   - HVAC                    -> BMS (chilled water temps, cleanroom sensors)
 *   - Compressed Air / Vacuum -> PLC (flow, dew point, vacuum gauges) + CMMS (compressor/pump runtime)
 *   - Chemicals               -> CMMS / inventory system (goods receipt + consumption logging)
 *
 * Two distribution conventions are used throughout, matching
 * manufacturingGenerator.ts exactly:
 *   - distributeAdditiveByShare: a known total split into weighted parts that
 *     sum back to the total (Plant Power Breakdown, Gas/Chemical spend by type).
 *   - Multiplicative ("series-line") combination: independent sub-systems'
 *     availabilities are multiplied together, never averaged (compressors,
 *     vacuum pumps, and the composite utility availability score).
 */
import { generateDashboardData } from "@/data/generator";
import { generateManufacturingData } from "@/data/manufacturingGenerator";
import { COST_COMPONENTS } from "@/lib/constants";
import { clamp, statusHigherIsBetter } from "@/lib/calculations";
import { noise } from "@/lib/prng";
import { formatDateLong, formatMonthYear, formatWeekLabel, formatYear, monthKey, weekKey } from "@/lib/dateUtils";
import {
  demandPenaltyRs,
  dgFuelConsumptionLPerDay,
  dgFuelCostRs,
  distributeAdditiveByShare,
  etpRecoveryPct,
  roRecoveryPct,
  roRejectPct,
  assertInvariant,
  computeDowntimeImpact,
} from "@/lib/utilityCalculations";
import {
  AFFECTED_CAPACITY_SHARE,
  BACKUP_AVAILABILITY_TARGET_PCT,
  CHEMICAL_TYPES,
  CHEMICALS_COST_PER_W_TARGET,
  COMPRESSED_AIR_TARGETS,
  COMPRESSORS,
  COOLING_AVAILABILITY_TARGET_PCT,
  COOLING_CIRCULATION_PER_W_L_TARGET,
  COOLING_CYCLES_OF_CONCENTRATION_TARGET,
  COST_RECONCILIATION_TOLERANCE_PCT,
  DG_PROFILE,
  ENERGY_RATE_RS_PER_KWH,
  ETP_AVAILABILITY_TARGET_PCT,
  ETP_RECOVERY_TARGET_PCT,
  FRESH_WATER_PER_W_L_TARGET,
  FRESH_WATER_RATE_RS_PER_KL,
  GAS_AVAILABILITY_TARGET_PCT,
  GAS_COST_PER_W_TARGET,
  GAS_TYPES,
  GRID_AVAILABILITY_TARGET_PCT,
  HVAC_TARGETS,
  PERIOD_HOURS,
  PLANT_POWER_BREAKDOWN_WEIGHTS,
  POWER_CONSUMPTION_PER_W_TARGET_KWH,
  POWER_FACTOR_TARGET_PCT,
  PROCESS_EQUIPMENT_VACUUM_SHARE_PCT,
  RO_RECOVERY_TARGET_PCT,
  SANCTIONED_DEMAND_KVA,
  UPW_AVAILABILITY_TARGET_PCT,
  UPW_RESISTIVITY_TARGET_MOHM_CM,
  UPW_SHARE_OF_RO_PRODUCT,
  UPW_TOC_TARGET_PPB,
  UPW_USAGE_CATEGORIES,
  UTIL_DEFAULT_LAST_UPDATED,
  VACUUM_PUMPS,
  VACUUM_TARGETS,
  WATER_COST_PER_W_TARGET,
} from "@/lib/utilityConstants";
import type { Period, ShiftNumber } from "@/types/dashboard";
import type {
  ChemicalConsumedBy,
  ChemicalLedgerRow,
  CompressorUnit,
  DowntimeImpactRow,
  ETPMetrics,
  GasTypeRow,
  PlantPowerBreakdownRow,
  ROMetrics,
  UPWMetrics,
  UPWUsageRow,
  UtilityAlert,
  UtilityAvailabilityRow,
  UtilityCostRow,
  UtilityData,
  UtilityFilters,
  UtilityPeriod,
  VacuumPumpUnit,
} from "@/types/utility";
import type { MfgFilters, MfgPeriod } from "@/types/manufacturing";

function periodSeedKey(filters: UtilityFilters): string {
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

function periodLabelFor(filters: UtilityFilters): string {
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

/** The MD Dashboard's Period type has no "week" option, so week-scoped utility
 * views fall back to the closest MD granularity for the Contribution/W lookup.
 * This only affects a rate (₹/W), not an absolute total, so the mismatch in
 * calendar bucket does not distort the figure materially. */
function toMdPeriod(period: UtilityPeriod): Period {
  if (period === "week") return "month";
  return period as Period;
}

function toMfgPeriod(period: UtilityPeriod): MfgPeriod {
  return period;
}

export function generateUtilityData(filters: UtilityFilters): UtilityData {
  const seed = periodSeedKey(filters);
  const periodHours = PERIOD_HOURS[filters.period];

  // --- Cross-dashboard inputs: the same production/contribution figures the
  // Manufacturing and MD Dashboards use, never independently regenerated. ---
  const mfgFilters: MfgFilters = {
    period: toMfgPeriod(filters.period),
    date: filters.date,
    shift: filters.shift,
    line: "all",
    cellType: "all",
  };
  const mfgData = generateManufacturingData(mfgFilters);
  const productionMW = mfgData.production.vsTarget.actualMW;
  const productionTargetMW = mfgData.production.vsTarget.targetMW;
  const productionW = productionMW * 1_000_000;

  const mdData = generateDashboardData({
    period: toMdPeriod(filters.period),
    date: filters.date,
    shift: filters.shift as ShiftNumber,
    line: "all",
  });
  const contributionPerW = mdData.contribution.perW;
  const mdCostPerW = mdData.cost.actualPerW;

  // ---------------------------------------------------------------------
  // Power & Electrical (single source of truth for HVAC/Compressed Air/
  // Vacuum power - see PlantPowerBreakdownRow usage below).
  // ---------------------------------------------------------------------
  const consumptionPerW = clamp(
    POWER_CONSUMPTION_PER_W_TARGET_KWH + noise(`${seed}-power-intensity`, 0.015),
    0.08,
    0.28,
  );
  const totalConsumptionKWh = productionW * consumptionPerW;
  const totalConsumptionMWh = totalConsumptionKWh / 1000;

  const powerBreakdownRaw = PLANT_POWER_BREAKDOWN_WEIGHTS.map((row, i) => {
    const base = distributeAdditiveByShare(totalConsumptionMWh, [row.share])[0];
    return base * (1 + noise(`${seed}-powerbreak-${row.key}-${i}`, 0.06));
  });
  const rawSum = powerBreakdownRaw.reduce((a, b) => a + b, 0);
  const scale = totalConsumptionMWh / rawSum;
  const breakdown: PlantPowerBreakdownRow[] = PLANT_POWER_BREAKDOWN_WEIGHTS.map((row, i) => {
    const consumptionMWh = powerBreakdownRaw[i] * scale;
    return { key: row.key, label: row.label, consumptionMWh, pctOfTotal: (consumptionMWh / totalConsumptionMWh) * 100 };
  });
  assertInvariant(
    "Plant Power Breakdown sums to Total Power Consumption",
    breakdown.reduce((acc, r) => acc + r.consumptionMWh, 0),
    totalConsumptionMWh,
    0.01,
  );

  const breakdownByKey = Object.fromEntries(breakdown.map((r) => [r.key, r]));
  const vacuumConsumptionMWh = breakdownByKey.processEquipment.consumptionMWh * PROCESS_EQUIPMENT_VACUUM_SHARE_PCT;

  const costPerW = consumptionPerW * ENERGY_RATE_RS_PER_KWH;
  const costPerWTarget = POWER_CONSUMPTION_PER_W_TARGET_KWH * ENERGY_RATE_RS_PER_KWH;
  const powerTotalCostCr = (costPerW * productionMW) / 10;

  const sanctionedDemandKVA = SANCTIONED_DEMAND_KVA;
  const peakDemandKVA = clamp(
    SANCTIONED_DEMAND_KVA * 0.8 + noise(`${seed}-peak-demand`, SANCTIONED_DEMAND_KVA * 0.12),
    SANCTIONED_DEMAND_KVA * 0.55,
    SANCTIONED_DEMAND_KVA * 1.15,
  );
  const powerFactorPct = clamp(POWER_FACTOR_TARGET_PCT - 1 + noise(`${seed}-pf`, 1.5), 88, 99.8);
  const demandPenalty = demandPenaltyRs(peakDemandKVA, sanctionedDemandKVA, periodHours);
  const gridAvailabilityPct = clamp(GRID_AVAILABILITY_TARGET_PCT - 0.3 + noise(`${seed}-grid-avail`, 0.6), 94, 100);
  const backupAvailabilityPct = clamp(
    BACKUP_AVAILABILITY_TARGET_PCT - 0.1 + noise(`${seed}-backup-avail`, 0.3),
    95,
    100,
  );
  const dgFuel = dgFuelConsumptionLPerDay(DG_PROFILE.capacityKVA) * (1 + noise(`${seed}-dg-fuel`, 0.1));
  const dgFuelCost = dgFuelCostRs(dgFuel);

  const power = {
    totalConsumptionMWh,
    consumptionPerW,
    costPerW,
    costPerWTarget,
    totalCostCr: powerTotalCostCr,
    sanctionedDemandKVA,
    peakDemandKVA,
    powerFactorPct,
    powerFactorTargetPct: POWER_FACTOR_TARGET_PCT,
    demandPenaltyRs: demandPenalty,
    gridAvailabilityPct,
    gridAvailabilityTargetPct: GRID_AVAILABILITY_TARGET_PCT,
    backupAvailabilityPct,
    dgFuelConsumptionLPerDay: dgFuel,
    dgFuelCostRs: dgFuelCost,
    breakdown,
  };

  // ---------------------------------------------------------------------
  // Gas System
  // ---------------------------------------------------------------------
  const gasCostPerW = clamp(GAS_COST_PER_W_TARGET + noise(`${seed}-gas-cost`, 0.05), 0.3, 1.2);
  const gasTotalCostCr = (gasCostPerW * productionMW) / 10;
  const gasTotalCostRs = gasTotalCostCr * 1e7;
  const gasRaw = GAS_TYPES.map((g, i) => {
    const base = distributeAdditiveByShare(gasTotalCostRs, [g.share])[0];
    return base * (1 + noise(`${seed}-gas-${g.key}-${i}`, 0.08));
  });
  const gasRawSum = gasRaw.reduce((a, b) => a + b, 0);
  const gasScale = gasTotalCostRs / gasRawSum;
  const gasByType: GasTypeRow[] = GAS_TYPES.map((g, i) => {
    const costRs = gasRaw[i] * gasScale;
    return {
      key: g.key,
      label: g.label,
      unit: g.unit,
      consumption: costRs / g.unitCostRs,
      costRs,
      pctOfTotal: (costRs / gasTotalCostRs) * 100,
    };
  });
  assertInvariant(
    "Gas consumption cost by type sums to Total Gas Cost",
    gasByType.reduce((acc, r) => acc + r.costRs, 0),
    gasTotalCostRs,
    1,
  );
  const gasAvailabilityPct = clamp(GAS_AVAILABILITY_TARGET_PCT - 0.2 + noise(`${seed}-gas-avail`, 0.5), 95, 100);

  const gas = {
    totalCostCr: gasTotalCostCr,
    costPerW: gasCostPerW,
    costPerWTarget: GAS_COST_PER_W_TARGET,
    availabilityPct: gasAvailabilityPct,
    availabilityTargetPct: GAS_AVAILABILITY_TARGET_PCT,
    byType: gasByType,
  };

  // ---------------------------------------------------------------------
  // Chemicals (single ledger - Chemicals section and ETP both read this)
  // ---------------------------------------------------------------------
  const chemicalsCostPerW = clamp(CHEMICALS_COST_PER_W_TARGET + noise(`${seed}-chem-cost`, 0.1), 0.6, 2.2);
  const chemicalsTotalCostCr = (chemicalsCostPerW * productionMW) / 10;
  const chemicalsTotalCostRs = chemicalsTotalCostCr * 1e7;
  const chemRaw = CHEMICAL_TYPES.map((c, i) => {
    const base = distributeAdditiveByShare(chemicalsTotalCostRs, [c.shareOfPlantSpend])[0];
    return base * (1 + noise(`${seed}-chem-${c.key}-${i}`, 0.08));
  });
  const chemRawSum = chemRaw.reduce((a, b) => a + b, 0);
  const chemScale = chemicalsTotalCostRs / chemRawSum;
  const ledger: ChemicalLedgerRow[] = CHEMICAL_TYPES.map((c, i) => {
    const costRs = chemRaw[i] * chemScale;
    const totalConsumption = costRs / c.unitCostRs;
    const consumedBy = Object.fromEntries(
      (Object.keys(c.consumedByShare) as ChemicalConsumedBy[]).map((k) => [k, totalConsumption * c.consumedByShare[k]]),
    ) as Record<ChemicalConsumedBy, number>;
    return { key: c.key, label: c.label, unit: c.unit, totalConsumption, costRs, consumedBy };
  });
  ledger.forEach((row) => {
    const sum = Object.values(row.consumedBy).reduce((a, b) => a + b, 0);
    assertInvariant(`Chemical ledger "${row.label}" consumed-by sums to total consumption`, sum, row.totalConsumption, 0.01);
  });
  assertInvariant(
    "Chemical ledger cost sums to Total Chemicals Cost",
    ledger.reduce((acc, r) => acc + r.costRs, 0),
    chemicalsTotalCostRs,
    1,
  );

  const chemicals = {
    totalCostCr: chemicalsTotalCostCr,
    costPerW: chemicalsCostPerW,
    costPerWTarget: CHEMICALS_COST_PER_W_TARGET,
    ledger,
  };

  /** ETP Chemical Consumption reads this same ledger's "etp" bucket (mass-based
   * rows only - DI Water is tracked in KL as a bulk consumable, not a mass
   * dose, so it is excluded from this "kg" figure). */
  const etpChemicalConsumptionKg = ledger
    .filter((row) => row.unit === "kg")
    .reduce((acc, row) => acc + row.consumedBy.etp, 0);

  // ---------------------------------------------------------------------
  // Water System - Feed/RO/DM -> UPW/DI -> Cooling -> ETP
  // ---------------------------------------------------------------------
  const freshWaterIntakeKL =
    (productionW * FRESH_WATER_PER_W_L_TARGET * (1 + noise(`${seed}-water-intake`, 0.05))) / 1000;
  const roFeedKL = freshWaterIntakeKL;
  const roRecoveryPctValue = clamp(RO_RECOVERY_TARGET_PCT - 1 + noise(`${seed}-ro-recovery`, 2), 55, 92);
  const roProductKL = roFeedKL * (roRecoveryPctValue / 100);
  const roRejectKL = roFeedKL - roProductKL; // guarantees Recovery% + Reject% = 100% exactly
  assertInvariant(
    "RO Recovery% + Reject% = 100%",
    roRecoveryPct(roFeedKL, roProductKL) + roRejectPct(roFeedKL, roRejectKL),
    100,
    0.05,
  );
  const ro: ROMetrics = {
    feedKL: roFeedKL,
    productKL: roProductKL,
    rejectKL: roRejectKL,
    recoveryPct: roRecoveryPctValue,
    rejectPct: 100 - roRecoveryPctValue,
    recoveryTargetPct: RO_RECOVERY_TARGET_PCT,
  };

  const upwConsumptionKL = roProductKL * UPW_SHARE_OF_RO_PRODUCT;
  const upwRaw = UPW_USAGE_CATEGORIES.map((c, i) => {
    const base = distributeAdditiveByShare(upwConsumptionKL, [c.share])[0];
    return base * (1 + noise(`${seed}-upw-${c.key}-${i}`, 0.06));
  });
  const upwRawSum = upwRaw.reduce((a, b) => a + b, 0);
  const upwScale = upwConsumptionKL / upwRawSum;
  const usageBreakdown: UPWUsageRow[] = UPW_USAGE_CATEGORIES.map((c, i) => {
    const consumptionKL = upwRaw[i] * upwScale;
    return { key: c.key, label: c.label, consumptionKL, pctOfTotal: (consumptionKL / upwConsumptionKL) * 100 };
  });
  assertInvariant(
    "UPW usage breakdown sums to UPW Consumption",
    usageBreakdown.reduce((acc, r) => acc + r.consumptionKL, 0),
    upwConsumptionKL,
    0.01,
  );
  const upw: UPWMetrics = {
    consumptionKL: upwConsumptionKL,
    resistivityMOhmCm: clamp(UPW_RESISTIVITY_TARGET_MOHM_CM - 0.6 + noise(`${seed}-upw-resistivity`, 0.5), 15, 18.3),
    resistivityTargetMOhmCm: UPW_RESISTIVITY_TARGET_MOHM_CM,
    tocPpb: clamp(UPW_TOC_TARGET_PPB + 0.5 + noise(`${seed}-upw-toc`, 1.5), 1, 12),
    tocTargetPpb: UPW_TOC_TARGET_PPB,
    usageBreakdown,
  };
  const upwAvailabilityPct = clamp(UPW_AVAILABILITY_TARGET_PCT - 0.2 + noise(`${seed}-upw-avail`, 0.5), 95, 100);

  const coolingCirculationKL =
    (productionW * COOLING_CIRCULATION_PER_W_L_TARGET * (1 + noise(`${seed}-cooling-circ`, 0.05))) / 1000;
  const coolingMakeupKL = coolingCirculationKL * clamp(0.03 + noise(`${seed}-cooling-makeup`, 0.008), 0.015, 0.05);
  const cooling = {
    circulationKL: coolingCirculationKL,
    makeupKL: coolingMakeupKL,
    cyclesOfConcentration: clamp(
      COOLING_CYCLES_OF_CONCENTRATION_TARGET - 0.3 + noise(`${seed}-cooling-coc`, 0.5),
      2.5,
      6,
    ),
    approachTempC: clamp(3.5 + noise(`${seed}-cooling-approach`, 0.6), 2, 5.5),
    rangeTempC: clamp(8 + noise(`${seed}-cooling-range`, 1), 5, 11),
    availabilityPct: clamp(COOLING_AVAILABILITY_TARGET_PCT - 0.3 + noise(`${seed}-cooling-avail`, 0.6), 94, 100),
    availabilityTargetPct: COOLING_AVAILABILITY_TARGET_PCT,
  };

  const etpInletKL =
    roRejectKL + upwConsumptionKL * 0.3 + coolingMakeupKL * 0.2 + noise(`${seed}-etp-inlet`, roRejectKL * 0.05);
  const etpRecoveryPctValue = clamp(ETP_RECOVERY_TARGET_PCT - 2 + noise(`${seed}-etp-recovery`, 3), 40, 85);
  const etpRecycledKL = etpInletKL * (etpRecoveryPctValue / 100);
  assertInvariant(
    "ETP Recovery% matches Recycled/Inlet definition",
    etpRecoveryPct(etpRecycledKL, etpInletKL),
    etpRecoveryPctValue,
    0.05,
  );
  const etp: ETPMetrics = {
    inletKL: etpInletKL,
    treatedKL: etpInletKL,
    recycledKL: etpRecycledKL,
    recoveryPct: etpRecoveryPctValue,
    chemicalConsumptionKg: etpChemicalConsumptionKg,
    availabilityPct: clamp(ETP_AVAILABILITY_TARGET_PCT - 0.3 + noise(`${seed}-etp-avail`, 0.6), 93, 100),
    availabilityTargetPct: ETP_AVAILABILITY_TARGET_PCT,
  };

  const waterSystemsPowerCostCr = (breakdownByKey.waterSystems.consumptionMWh * 1000 * ENERGY_RATE_RS_PER_KWH) / 1e7;
  const freshWaterTariffCostCr = (freshWaterIntakeKL * FRESH_WATER_RATE_RS_PER_KL) / 1e7;
  const waterTotalCostCr = waterSystemsPowerCostCr + freshWaterTariffCostCr;

  const water = {
    totalCostCr: waterTotalCostCr,
    costPerW: (waterTotalCostCr * 10) / productionMW,
    costPerWTarget: WATER_COST_PER_W_TARGET,
    freshWaterIntakeKL,
    ro,
    upw,
    cooling,
    etp,
  };

  // ---------------------------------------------------------------------
  // HVAC / Compressed Air / Vacuum - power figures reused from `breakdown`
  // ---------------------------------------------------------------------
  const hvacRow = breakdownByKey.hvac;
  const hvacAvgKW = (hvacRow.consumptionMWh * 1000) / periodHours;
  const hvac = {
    consumptionMWh: hvacRow.consumptionMWh,
    chilledWaterSupplyTempC: clamp(
      HVAC_TARGETS.chilledWaterSupplyTempC + noise(`${seed}-hvac-supply`, 0.4),
      5,
      8.5,
    ),
    chilledWaterReturnTempC: clamp(
      HVAC_TARGETS.chilledWaterReturnTempC + noise(`${seed}-hvac-return`, 0.5),
      11,
      14.5,
    ),
    coolingLoadTR: hvacAvgKW / 3.517, // 1 TR = 3.517 kW, standard refrigeration conversion
    cleanroomTempDeviationC: clamp(Math.abs(noise(`${seed}-hvac-temp-dev`, HVAC_TARGETS.cleanroomTempToleranceC)), 0, 2.5),
    cleanroomRHDeviationPct: clamp(Math.abs(noise(`${seed}-hvac-rh-dev`, HVAC_TARGETS.cleanroomRHTolerancePct)), 0, 12),
    availabilityPct: clamp(HVAC_TARGETS.availabilityTargetPct - 0.3 + noise(`${seed}-hvac-avail`, 0.6), 94, 100),
    availabilityTargetPct: HVAC_TARGETS.availabilityTargetPct,
  };

  const compressedAirRow = breakdownByKey.compressedAir;
  const caAvgKW = (compressedAirRow.consumptionMWh * 1000) / periodHours;
  const specificPower = clamp(
    COMPRESSED_AIR_TARGETS.specificPowerKwPerNm3Min + noise(`${seed}-ca-specific-power`, 0.3),
    5,
    8,
  );
  const compressors: CompressorUnit[] = COMPRESSORS.map((c, i) => ({
    id: c.id,
    name: c.name,
    availabilityPct: clamp(99.3 + noise(`${seed}-ca-unit-${c.id}-${i}`, 1.2), 92, 100),
  }));
  // Series-line model: overall availability is the PRODUCT of each unit's
  // availability, not their average - same convention as equipment
  // availability in manufacturingGenerator.ts.
  const compressedAirAvailabilityPct = compressors.reduce((acc, c) => acc * (c.availabilityPct / 100), 1) * 100;
  const compressedAir = {
    consumptionMWh: compressedAirRow.consumptionMWh,
    generationNm3: ((caAvgKW / specificPower) * periodHours * 60) / 1000, // Nm3/min -> Nm3 over the period (in '000s folded into unit below)
    specificPowerKwPerNm3Min: specificPower,
    dewPointC: clamp(COMPRESSED_AIR_TARGETS.dewPointC + noise(`${seed}-ca-dewpoint`, 4), -55, -25),
    leakagePct: clamp(COMPRESSED_AIR_TARGETS.leakageTargetPct + 1 + noise(`${seed}-ca-leak`, 2.5), 3, 20),
    compressors,
    availabilityPct: compressedAirAvailabilityPct,
    availabilityTargetPct: COMPRESSED_AIR_TARGETS.availabilityTargetPct,
  };

  const vacuumPumps: VacuumPumpUnit[] = VACUUM_PUMPS.map((v, i) => ({
    id: v.id,
    name: v.name,
    availabilityPct: clamp(99.2 + noise(`${seed}-vac-unit-${v.id}-${i}`, 1.4), 90, 100),
  }));
  const vacuumAvailabilityPct = vacuumPumps.reduce((acc, v) => acc * (v.availabilityPct / 100), 1) * 100;
  const vacuum = {
    consumptionMWh: vacuumConsumptionMWh,
    vacuumLevelMbar: clamp(VACUUM_TARGETS.levelTargetMbar + noise(`${seed}-vac-level`, 0.15), 0.1, 1.2),
    vacuumLevelTargetMbar: VACUUM_TARGETS.levelTargetMbar,
    pumpDownTimeSec: clamp(VACUUM_TARGETS.pumpDownTimeTargetSec + noise(`${seed}-vac-pumpdown`, 8), 25, 90),
    pumps: vacuumPumps,
    availabilityPct: vacuumAvailabilityPct,
    availabilityTargetPct: VACUUM_TARGETS.availabilityTargetPct,
  };

  // ---------------------------------------------------------------------
  // Utility Cost rollup - built by SUMMING the per-utility costs computed
  // above, never an independent random cost generator.
  // ---------------------------------------------------------------------
  const mwhToCr = (mwh: number) => (mwh * 1000 * ENERGY_RATE_RS_PER_KWH) / 1e7;
  const electricityCostCr =
    mwhToCr(breakdownByKey.processEquipment.consumptionMWh * (1 - PROCESS_EQUIPMENT_VACUUM_SHARE_PCT)) +
    mwhToCr(breakdownByKey.pumps.consumptionMWh) +
    mwhToCr(breakdownByKey.chillers.consumptionMWh) +
    mwhToCr(breakdownByKey.lighting.consumptionMWh);
  const hvacCostCr = mwhToCr(hvacRow.consumptionMWh);
  const compressedAirCostCr = mwhToCr(compressedAirRow.consumptionMWh);
  const vacuumCostCr = mwhToCr(vacuumConsumptionMWh);
  const otherCostCr = mwhToCr(breakdownByKey.other.consumptionMWh);

  const costRows: UtilityCostRow[] = [
    { key: "electricity", label: "Electricity (Process, Pumps, Chillers, Lighting)", costCr: electricityCostCr, pctOfTotal: 0 },
    { key: "gases", label: "Gases", costCr: gas.totalCostCr, pctOfTotal: 0 },
    { key: "water", label: "Water", costCr: water.totalCostCr, pctOfTotal: 0 },
    { key: "hvac", label: "HVAC", costCr: hvacCostCr, pctOfTotal: 0 },
    { key: "compressedAir", label: "Compressed Air", costCr: compressedAirCostCr, pctOfTotal: 0 },
    { key: "vacuum", label: "Vacuum", costCr: vacuumCostCr, pctOfTotal: 0 },
    { key: "chemicals", label: "Chemicals", costCr: chemicals.totalCostCr, pctOfTotal: 0 },
    { key: "other", label: "Other", costCr: otherCostCr, pctOfTotal: 0 },
  ];
  const totalUtilityCostCr = costRows.reduce((acc, r) => acc + r.costCr, 0);
  costRows.forEach((r) => (r.pctOfTotal = (r.costCr / totalUtilityCostCr) * 100));
  assertInvariant(
    "Utility Cost rollup total = sum of Power/Gas/Water/Chemicals",
    totalUtilityCostCr,
    power.totalCostCr + gas.totalCostCr + chemicals.totalCostCr + freshWaterTariffCostCr,
    1,
  );

  const totalUtilityCostPerW = (totalUtilityCostCr * 10) / productionMW;

  // Cross-check against the MD Dashboard's own COST_COMPONENTS shares for the
  // same period/scope - a genuine reconciliation, not a rewire of either side.
  const mdShareSum = COST_COMPONENTS.filter((c) => ["power", "water", "gases", "chemicals"].includes(c.key)).reduce(
    (acc, c) => acc + c.share,
    0,
  );
  const mdCostComponentsPerW = mdCostPerW * mdShareSum;
  const reconciliationVariancePct = ((totalUtilityCostPerW - mdCostComponentsPerW) / mdCostComponentsPerW) * 100;
  const reconciliation = {
    utilityRollupPerW: totalUtilityCostPerW,
    mdCostComponentsPerW,
    variancePct: reconciliationVariancePct,
    withinTolerance: Math.abs(reconciliationVariancePct) <= COST_RECONCILIATION_TOLERANCE_PCT,
  };

  const cost = {
    totalCostCr: totalUtilityCostCr,
    totalCostPerW: totalUtilityCostPerW,
    rows: costRows,
    reconciliation,
  };

  // ---------------------------------------------------------------------
  // Utility Availability rollup + downtime/economic impact
  // ---------------------------------------------------------------------
  const availabilitySource: { key: string; label: string; actualPct: number; targetPct: number }[] = [
    { key: "power", label: "Power (Grid)", actualPct: gridAvailabilityPct, targetPct: GRID_AVAILABILITY_TARGET_PCT },
    { key: "gas", label: "Gas", actualPct: gasAvailabilityPct, targetPct: GAS_AVAILABILITY_TARGET_PCT },
    { key: "upw", label: "UPW", actualPct: upwAvailabilityPct, targetPct: UPW_AVAILABILITY_TARGET_PCT },
    { key: "cooling", label: "Cooling Water", actualPct: cooling.availabilityPct, targetPct: cooling.availabilityTargetPct },
    { key: "hvac", label: "HVAC", actualPct: hvac.availabilityPct, targetPct: hvac.availabilityTargetPct },
    {
      key: "compressedAir",
      label: "Compressed Air",
      actualPct: compressedAir.availabilityPct,
      targetPct: compressedAir.availabilityTargetPct,
    },
    { key: "vacuum", label: "Vacuum", actualPct: vacuum.availabilityPct, targetPct: vacuum.availabilityTargetPct },
    { key: "etp", label: "ETP", actualPct: etp.availabilityPct, targetPct: etp.availabilityTargetPct },
  ];
  const availability: UtilityAvailabilityRow[] = availabilitySource.map((row) => ({
    ...row,
    status: statusHigherIsBetter(row.actualPct, row.targetPct, 2, 0.5),
  }));

  // Composite score across genuinely independent sub-systems - multiplicative,
  // matching the series-line convention rather than an average.
  const compositeAvailabilityPct = availability.reduce((acc, r) => acc * (r.actualPct / 100), 1) * 100;

  const downtimeImpact: DowntimeImpactRow[] = availabilitySource.map((row) => {
    const result = computeDowntimeImpact({
      actualPct: row.actualPct,
      targetPct: row.targetPct,
      periodHours,
      affectedCapacityShare: AFFECTED_CAPACITY_SHARE[row.key] ?? 0,
      productionTargetMW,
      contributionPerW,
    });
    return {
      key: row.key,
      label: row.label,
      actualAvailabilityPct: row.actualPct,
      targetAvailabilityPct: row.targetPct,
      shortfallPct: result.shortfallPct,
      downtimeHours: result.downtimeHours,
      affectedCapacityShare: AFFECTED_CAPACITY_SHARE[row.key] ?? 0,
      lostProductionMW: result.lostProductionMW,
      economicImpactCr: result.economicImpactCr,
    };
  });

  const alerts = generateUtilityAlerts({
    power,
    gas,
    water,
    hvac,
    compressedAir,
    vacuum,
    chemicals,
    cost,
    downtimeImpact,
  });

  const summary = {
    totalUtilityCostPerW,
    totalUtilityCostCr,
    plantPowerConsumptionPerW: consumptionPerW,
    compositeAvailabilityPct,
  };

  return {
    filters,
    scopeLabel: "Plant-wide",
    periodLabel: periodLabelFor(filters),
    lastUpdated: UTIL_DEFAULT_LAST_UPDATED,
    productionMW,
    contributionPerW,
    summary,
    power,
    gas,
    water,
    hvac,
    compressedAir,
    vacuum,
    chemicals,
    cost,
    availability,
    downtimeImpact,
    alerts,
  };
}

function generateUtilityAlerts(ctx: {
  power: UtilityData["power"];
  gas: UtilityData["gas"];
  water: UtilityData["water"];
  hvac: UtilityData["hvac"];
  compressedAir: UtilityData["compressedAir"];
  vacuum: UtilityData["vacuum"];
  chemicals: UtilityData["chemicals"];
  cost: UtilityData["cost"];
  downtimeImpact: UtilityData["downtimeImpact"];
}): UtilityAlert[] {
  const alerts: UtilityAlert[] = [];

  if (ctx.power.demandPenaltyRs > 0) {
    alerts.push({
      id: "demand-penalty",
      severity: ctx.power.demandPenaltyRs > 200_000 ? "critical" : "warning",
      metric: "Demand Penalty",
      message: `Peak demand exceeded sanctioned capacity - excess-demand penalty of ₹${(ctx.power.demandPenaltyRs / 1000).toFixed(1)}k for the period`,
    });
  }

  if (ctx.power.powerFactorPct < ctx.power.powerFactorTargetPct - 2) {
    alerts.push({
      id: "power-factor",
      severity: "warning",
      metric: "Power Factor",
      message: `Power factor is ${ctx.power.powerFactorPct.toFixed(1)}%, below the ${ctx.power.powerFactorTargetPct.toFixed(0)}% target - risk of low-PF penalty`,
    });
  }

  if (ctx.cost.reconciliation && !ctx.cost.reconciliation.withinTolerance) {
    alerts.push({
      id: "cost-reconciliation",
      severity: "warning",
      metric: "Cost Reconciliation",
      message: `Utility Cost/W (₹${ctx.cost.reconciliation.utilityRollupPerW.toFixed(2)}) diverges ${ctx.cost.reconciliation.variancePct >= 0 ? "+" : ""}${ctx.cost.reconciliation.variancePct.toFixed(0)}% from the MD Dashboard's Cost/W allocation (₹${ctx.cost.reconciliation.mdCostComponentsPerW.toFixed(2)}) for Power+Water+Gas+Chemicals`,
    });
  }

  const worstDowntime = [...ctx.downtimeImpact].sort((a, b) => b.economicImpactCr - a.economicImpactCr)[0];
  if (worstDowntime && worstDowntime.economicImpactCr > 0.01) {
    alerts.push({
      id: "downtime-impact",
      severity: worstDowntime.economicImpactCr > 0.5 ? "critical" : "warning",
      metric: "Utility-Driven Downtime",
      message: `${worstDowntime.label} availability shortfall (${worstDowntime.shortfallPct.toFixed(1)} pts) is estimated to cost ₹${worstDowntime.economicImpactCr.toFixed(2)} Cr in lost contribution this period`,
    });
  }

  if (ctx.water.ro.recoveryPct < ctx.water.ro.recoveryTargetPct - 3) {
    alerts.push({
      id: "ro-recovery",
      severity: "warning",
      metric: "RO Recovery",
      message: `RO Recovery is ${ctx.water.ro.recoveryPct.toFixed(1)}% vs target ${ctx.water.ro.recoveryTargetPct.toFixed(0)}% - reject volume is running high`,
    });
  }

  if (ctx.water.upw.resistivityMOhmCm < ctx.water.upw.resistivityTargetMOhmCm - 1) {
    alerts.push({
      id: "upw-quality",
      severity: "critical",
      metric: "UPW Quality",
      message: `UPW resistivity is ${ctx.water.upw.resistivityMOhmCm.toFixed(1)} MΩ·cm, below the ${ctx.water.upw.resistivityTargetMOhmCm.toFixed(0)} MΩ·cm spec - risk to wet-process quality`,
    });
  }

  if (ctx.compressedAir.leakagePct > COMPRESSED_AIR_TARGETS.leakageTargetPct + 5) {
    alerts.push({
      id: "compressed-air-leakage",
      severity: "warning",
      metric: "Compressed Air Leakage",
      message: `Compressed air leakage is ${ctx.compressedAir.leakagePct.toFixed(1)}% vs target ${COMPRESSED_AIR_TARGETS.leakageTargetPct.toFixed(0)}% - energy loss opportunity`,
    });
  }

  if (ctx.chemicals.costPerW > ctx.chemicals.costPerWTarget * 1.15) {
    alerts.push({
      id: "chemicals-cost",
      severity: "warning",
      metric: "Chemicals Cost/W",
      message: `Chemicals Cost/W is ₹${ctx.chemicals.costPerW.toFixed(2)} vs target ₹${ctx.chemicals.costPerWTarget.toFixed(2)}`,
    });
  }

  const severityRank: Record<string, number> = { critical: 0, warning: 1, positive: 2 };
  return alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]).slice(0, 5);
}
