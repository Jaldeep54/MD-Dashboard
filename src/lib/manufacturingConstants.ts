import type { CellTypeRef, MfgPeriod, ProductionLineRef } from "@/types/manufacturing";

export const MFG_PLANT_INSTALLED_CAPACITY_MW_YEAR = 1200; // 1.2 GW, same plant as the MD dashboard

// Same operating calendar convention used by the MD dashboard, plus a week bucket.
export const OPERATING_DAYS_PER_YEAR = 360;
export const OPERATING_DAYS_PER_MONTH = 30;
export const OPERATING_WEEKS_PER_YEAR = 52;
export const SHIFTS_PER_DAY = 3;

export const AVG_CELL_WATTAGE = 3.3; // Wp per half-cut TOPCon cell, approx.

export const PRODUCTION_LINES: ProductionLineRef[] = [
  { id: "line1", name: "Line 1" },
  { id: "line2", name: "Line 2" },
  { id: "line3", name: "Line 3" },
  { id: "line4", name: "Line 4" },
];

export const CELL_TYPES: CellTypeRef[] = [
  { id: "m10", name: "M10 (182mm)" },
  { id: "g12r", name: "G12R (210mm)" },
];

export const MFG_PERIOD_LABELS: Record<MfgPeriod, string> = {
  shift: "Shift",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
};

/**
 * The full TOPCon process sequence used for the compact process-flow visual,
 * including the wafer input and finished-cell endpoints.
 */
export const TOPCON_PROCESS_FLOW: { id: string; name: string }[] = [
  { id: "wafer-in", name: "n-type Wafer" },
  { id: "texturing", name: "Texturing" },
  { id: "boron-diffusion", name: "Boron Diffusion" },
  { id: "oxidation", name: "Oxidation" },
  { id: "inline-bsg", name: "Inline BSG" },
  { id: "batch-polishing", name: "Batch Polishing" },
  { id: "lpcvd", name: "LPCVD" },
  { id: "pocl3-diffusion", name: "POCl3 Diffusion" },
  { id: "inline-psg", name: "Inline PSG" },
  { id: "rca", name: "RCA" },
  { id: "ald", name: "ALD" },
  { id: "front-pecvd", name: "Front PECVD" },
  { id: "rear-pecvd", name: "Rear PECVD" },
  { id: "metallization", name: "Metallization" },
  { id: "laser-scribing", name: "Laser Scribing / Cutting" },
  { id: "epd", name: "EPD" },
  { id: "final-cell", name: "Final Half-Cut Cell" },
];

/**
 * Step-level process yield targets. Excludes the wafer-input and
 * finished-cell endpoints, which are not yield-bearing steps themselves.
 */
export const PROCESS_YIELD_STEPS: { id: string; name: string; targetPct: number }[] = [
  { id: "texturing", name: "Texturing", targetPct: 99.6 },
  { id: "boron-diffusion", name: "Boron Diffusion", targetPct: 99.4 },
  { id: "oxidation", name: "Oxidation", targetPct: 99.7 },
  { id: "inline-bsg", name: "BSG", targetPct: 99.7 },
  { id: "batch-polishing", name: "Polishing", targetPct: 99.3 },
  { id: "lpcvd", name: "LPCVD", targetPct: 99.5 },
  { id: "pocl3-diffusion", name: "POCl3 Diffusion", targetPct: 99.4 },
  { id: "inline-psg", name: "PSG", targetPct: 99.7 },
  { id: "rca", name: "RCA", targetPct: 99.6 },
  { id: "ald", name: "ALD", targetPct: 99.5 },
  { id: "front-pecvd", name: "Front PECVD", targetPct: 99.4 },
  { id: "rear-pecvd", name: "Rear PECVD", targetPct: 99.4 },
  { id: "metallization", name: "Metallization", targetPct: 99.2 },
  { id: "laser-scribing", name: "Laser Scribing / Cutting", targetPct: 99.5 },
  { id: "epd", name: "EPD", targetPct: 99.6 },
];

/** Process parameter monitored per step, for the Process Performance vs Target view. */
export const PROCESS_PARAMETERS: {
  id: string;
  processStepId: string;
  name: string;
  unit: string;
  target: number;
  tolerance: number;
}[] = [
  { id: "reflectance", processStepId: "texturing", name: "Reflectance", unit: "%", target: 10.5, tolerance: 0.8 },
  { id: "sheet-resistance-boron", processStepId: "boron-diffusion", name: "Sheet Resistance", unit: "Ω/sq", target: 135, tolerance: 8 },
  { id: "oxide-thickness", processStepId: "oxidation", name: "Oxide Thickness", unit: "nm", target: 1.6, tolerance: 0.2 },
  { id: "bsg-thickness", processStepId: "inline-bsg", name: "BSG Thickness", unit: "nm", target: 25, tolerance: 3 },
  { id: "twi-polishing", processStepId: "batch-polishing", name: "Total Thickness Variation", unit: "µm", target: 8, tolerance: 1.5 },
  { id: "poly-thickness", processStepId: "lpcvd", name: "Polysilicon Thickness", unit: "nm", target: 150, tolerance: 10 },
  { id: "sheet-resistance-pocl3", processStepId: "pocl3-diffusion", name: "Sheet Resistance", unit: "Ω/sq", target: 95, tolerance: 6 },
  { id: "psg-thickness", processStepId: "inline-psg", name: "PSG Thickness", unit: "nm", target: 20, tolerance: 3 },
  { id: "surface-cleanliness", processStepId: "rca", name: "Surface Particle Count", unit: "count/wafer", target: 15, tolerance: 5 },
  { id: "aloz-thickness", processStepId: "ald", name: "AlOx Thickness", unit: "nm", target: 5, tolerance: 0.5 },
  { id: "arc-uniformity-front", processStepId: "front-pecvd", name: "ARC Uniformity", unit: "%", target: 97, tolerance: 1.5 },
  { id: "arc-uniformity-rear", processStepId: "rear-pecvd", name: "ARC Uniformity", unit: "%", target: 97, tolerance: 1.5 },
  { id: "contact-resistance", processStepId: "metallization", name: "Contact Resistance", unit: "mΩ·cm²", target: 3.2, tolerance: 0.5 },
  { id: "cut-precision", processStepId: "laser-scribing", name: "Cut Line Precision", unit: "µm", target: 15, tolerance: 4 },
  { id: "edge-leakage", processStepId: "epd", name: "Edge Leakage Current", unit: "mA", target: 8, tolerance: 2 },
];

/** Representative equipment/tool per process step (kept to one per step to avoid MES-level clutter). */
export const EQUIPMENT_LIST: { id: string; name: string; processStepId: string }[] = [
  { id: "eq-texturing", name: "Texturing Bath", processStepId: "texturing" },
  { id: "eq-boron", name: "Boron Diffusion Furnace", processStepId: "boron-diffusion" },
  { id: "eq-oxidation", name: "Oxidation Furnace", processStepId: "oxidation" },
  { id: "eq-bsg", name: "Inline BSG Coater", processStepId: "inline-bsg" },
  { id: "eq-polishing", name: "Batch Polishing Bath", processStepId: "batch-polishing" },
  { id: "eq-lpcvd", name: "LPCVD Furnace", processStepId: "lpcvd" },
  { id: "eq-pocl3", name: "POCl3 Diffusion Furnace", processStepId: "pocl3-diffusion" },
  { id: "eq-psg", name: "Inline PSG Coater", processStepId: "inline-psg" },
  { id: "eq-rca", name: "RCA Clean Line", processStepId: "rca" },
  { id: "eq-ald", name: "ALD System", processStepId: "ald" },
  { id: "eq-pecvd-front", name: "Front PECVD Tool", processStepId: "front-pecvd" },
  { id: "eq-pecvd-rear", name: "Rear PECVD Tool", processStepId: "rear-pecvd" },
  { id: "eq-metallization", name: "Metallization Printer", processStepId: "metallization" },
  { id: "eq-laser", name: "Laser Scribing System", processStepId: "laser-scribing" },
  { id: "eq-epd", name: "EPD Line", processStepId: "epd" },
];

/** Process steps tracked for wafer-breakage drill-down (a slightly different, handling-inclusive list). */
export const WAFER_BREAKAGE_STEPS: { key: string; label: string; share: number }[] = [
  { key: "texturing", label: "Texturing", share: 0.22 },
  { key: "boron-diffusion", label: "Boron Diffusion", share: 0.12 },
  { key: "oxidation", label: "Oxidation", share: 0.06 },
  { key: "polishing", label: "Polishing", share: 0.1 },
  { key: "lpcvd", label: "LPCVD", share: 0.08 },
  { key: "pocl3-diffusion", label: "POCl3 Diffusion", share: 0.07 },
  { key: "rca", label: "RCA", share: 0.05 },
  { key: "ald", label: "ALD", share: 0.04 },
  { key: "pecvd", label: "PECVD", share: 0.06 },
  { key: "metallization", label: "Metallization", share: 0.05 },
  { key: "handling", label: "Handling / Transfer", share: 0.15 },
];

/** Non-breakage process loss/scrap categories (breakage is tracked as its own KPI). */
export const PROCESS_LOSS_CATEGORIES: { key: string; label: string; share: number }[] = [
  { key: "process-rejection", label: "Process Rejection", share: 0.34 },
  { key: "contamination", label: "Contamination", share: 0.18 },
  { key: "electrical-failure", label: "Electrical Failure", share: 0.16 },
  { key: "visual-defect", label: "Visual Defect", share: 0.14 },
  { key: "metallization-defect", label: "Metallization Defect", share: 0.11 },
  { key: "other", label: "Other Process Scrap", share: 0.07 },
];

/** Quality-stage defect categories (distinct from process loss - these are post-test classifications). */
export const DEFECT_CATEGORIES: { key: string; label: string; share: number }[] = [
  { key: "el-defect", label: "EL Defect", share: 0.27 },
  { key: "metallization-defect", label: "Metallization Defect", share: 0.2 },
  { key: "visual-defect", label: "Visual Defect", share: 0.16 },
  { key: "electrical-failure", label: "Electrical Failure", share: 0.15 },
  { key: "cracking", label: "Cracking", share: 0.11 },
  { key: "contamination", label: "Contamination", share: 0.06 },
  { key: "printing-defect", label: "Printing Defect", share: 0.03 },
  { key: "other", label: "Other", share: 0.02 },
];

export const MFG_TARGETS = {
  availabilityTargetPct: 92,
  performanceTargetPct: 93,
  waferToCellYieldTargetPct: 97.5,
  waferBreakageTargetPct: 1.0,
  processLossTargetPct: 1.8,
  cellEfficiencyTargetPct: 24.8,
  oeeTargetPct: 85,
  equipmentAvailabilityTargetPct: 90,
  fpyTargetPct: 97,
  reworkTargetPct: 2,
  finalQualityPassTargetPct: 98,
};

/**
 * Relative "difficulty" weight per process step, shared by the step-yield and
 * equipment-availability loss models so both distribute a single plant-level
 * loss/downtime budget across steps consistently (series-line model: the
 * product of per-step yields, or per-equipment availabilities, equals the
 * plant-level figure).
 */
export const PROCESS_STEP_WEIGHTS: Record<string, number> = {
  texturing: 0.05,
  "boron-diffusion": 0.07,
  oxidation: 0.04,
  "inline-bsg": 0.03,
  "batch-polishing": 0.09,
  lpcvd: 0.07,
  "pocl3-diffusion": 0.07,
  "inline-psg": 0.03,
  rca: 0.03,
  ald: 0.06,
  "front-pecvd": 0.07,
  "rear-pecvd": 0.07,
  metallization: 0.16,
  "laser-scribing": 0.1,
  epd: 0.06,
};

/** Baseline per-line performance profile. Line 3 is the persistent underperformer, consistent with the MD dashboard's narrative. */
export const MFG_LINE_PROFILES: Record<
  string,
  { availabilityPct: number; performancePct: number; goodGradeBiasPct: number }
> = {
  line1: { availabilityPct: 93.0, performancePct: 94.0, goodGradeBiasPct: 0 },
  line2: { availabilityPct: 95.0, performancePct: 95.5, goodGradeBiasPct: 1.2 },
  line3: { availabilityPct: 85.5, performancePct: 88.5, goodGradeBiasPct: -2.5 },
  line4: { availabilityPct: 92.0, performancePct: 93.0, goodGradeBiasPct: 0.3 },
};

/** Cell-type modifiers so switching the Product/Cell Type filter visibly changes scale. */
export const CELL_TYPE_MODIFIERS: Record<string, { wattageMultiplier: number; efficiencyOffsetPct: number }> = {
  all: { wattageMultiplier: 1.3, efficiencyOffsetPct: 0.05 },
  m10: { wattageMultiplier: 1.0, efficiencyOffsetPct: 0 },
  g12r: { wattageMultiplier: 1.65, efficiencyOffsetPct: 0.1 },
};

export const MFG_DEFAULT_DATE = "2026-08-26";
export const MFG_DEFAULT_LAST_UPDATED = "26 Aug 2026, 16:30";
