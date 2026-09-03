"use client";

import { useMemo, useState } from "react";
import { generateManufacturingData } from "@/data/manufacturingGenerator";
import { MFG_DEFAULT_DATE } from "@/lib/manufacturingConstants";
import type { MfgFilters } from "@/types/manufacturing";

const DEFAULT_FILTERS: MfgFilters = {
  period: "day",
  date: MFG_DEFAULT_DATE,
  shift: 1,
  line: "all",
  cellType: "all",
};

export function useManufacturingData() {
  const [filters, setFilters] = useState<MfgFilters>(DEFAULT_FILTERS);

  const data = useMemo(() => generateManufacturingData(filters), [filters]);

  return { filters, setFilters, data };
}
