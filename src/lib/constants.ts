import type { CellLineId, Period } from "@/types/dashboard";

export const PLANT_NAME = "LAPLACE";
export const PLANT_SUBTITLE = "TOPCon Cell Manufacturing";

// Installed / theoretical annual capacity of the plant. Fixed per spec.
export const THEORETICAL_CAPACITY_MW_YEAR = 1200; // 1.2 GW

// Operating calendar convention used to prorate the annual theoretical
// capacity down to shorter periods. A clean 360-day / 12-month / 3-shift
// calendar keeps the math exact across period boundaries.
export const OPERATING_DAYS_PER_YEAR = 360;
export const OPERATING_DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const SHIFTS_PER_DAY = 3;

export const AVG_CELL_WATTAGE = 3.3; // Wp per cell, approx. M10 TOPCon bifacial cell

export const CELL_LINES: { id: CellLineId; name: string }[] = [
  { id: "line1", name: "Line 1" },
  { id: "line2", name: "Line 2" },
  { id: "line3", name: "Line 3" },
  { id: "line4", name: "Line 4" },
];

export const PERIOD_LABELS: Record<Period, string> = {
  shift: "Shift",
  day: "Day",
  month: "Month",
  year: "Year",
};

export const COST_COMPONENTS: { key: string; label: string; share: number }[] = [
  { key: "wafers", label: "Wafers", share: 0.46 },
  { key: "silver", label: "Silver Paste", share: 0.17 },
  { key: "chemicals", label: "Chemicals", share: 0.09 },
  { key: "gases", label: "Gases", share: 0.06 },
  { key: "power", label: "Power", share: 0.08 },
  { key: "water", label: "Water", share: 0.015 },
  { key: "labour", label: "Labour", share: 0.055 },
  { key: "maintenance", label: "Maintenance", share: 0.035 },
  { key: "consumables", label: "Consumables", share: 0.02 },
  { key: "others", label: "Others", share: 0.015 },
];

export const LOSS_CATEGORIES: { key: string; label: string; share: number }[] = [
  { key: "breakage", label: "Breakage", share: 0.42 },
  { key: "processRejection", label: "Process Rejection", share: 0.25 },
  { key: "handling", label: "Handling Loss", share: 0.12 },
  { key: "equipment", label: "Equipment-related Loss", share: 0.14 },
  { key: "others", label: "Others", share: 0.07 },
];

// Baseline per-line performance profile, calibrated from the plant's
// management review table. Line 3 is the persistent underperformer.
export const LINE_PROFILES: Record<
  CellLineId,
  {
    availabilityPct: number;
    availabilityTargetPct: number;
    utilizationOfAvailablePct: number;
    utilizationOfAvailableTargetPct: number;
    yieldPct: number;
    yieldTargetPct: number;
    costPerW: number;
    costTargetPerW: number;
  }
> = {
  line1: {
    availabilityPct: 95.5,
    availabilityTargetPct: 97,
    utilizationOfAvailablePct: 92.1,
    utilizationOfAvailableTargetPct: 93,
    yieldPct: 97.4,
    yieldTargetPct: 98,
    costPerW: 13.6,
    costTargetPerW: 13.5,
  },
  line2: {
    availabilityPct: 97.8,
    availabilityTargetPct: 97,
    utilizationOfAvailablePct: 93.0,
    utilizationOfAvailableTargetPct: 93,
    yieldPct: 98.1,
    yieldTargetPct: 98,
    costPerW: 13.4,
    costTargetPerW: 13.5,
  },
  line3: {
    availabilityPct: 90.3,
    availabilityTargetPct: 97,
    utilizationOfAvailablePct: 93.1,
    utilizationOfAvailableTargetPct: 93,
    yieldPct: 96.8,
    yieldTargetPct: 98,
    costPerW: 14.1,
    costTargetPerW: 13.5,
  },
  line4: {
    availabilityPct: 96.0,
    availabilityTargetPct: 97,
    utilizationOfAvailablePct: 92.7,
    utilizationOfAvailableTargetPct: 93,
    yieldPct: 97.8,
    yieldTargetPct: 98,
    costPerW: 13.7,
    costTargetPerW: 13.5,
  },
};

export const VALUE_PER_W_TARGET = 16.0;
export const VALUE_PER_W_BASE = 16.2;

export const DEFAULT_DATE = "2026-08-26";
export const DEFAULT_LAST_UPDATED = "26 Aug 2026, 16:30";
