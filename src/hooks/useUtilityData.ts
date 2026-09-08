"use client";

import { useMemo, useState } from "react";
import { generateUtilityData } from "@/data/utilityGenerator";
import { UTIL_DEFAULT_DATE } from "@/lib/utilityConstants";
import type { UtilityFilters } from "@/types/utility";

const DEFAULT_FILTERS: UtilityFilters = {
  period: "day",
  date: UTIL_DEFAULT_DATE,
  shift: 1,
  area: "overview",
};

export function useUtilityData() {
  const [filters, setFilters] = useState<UtilityFilters>(DEFAULT_FILTERS);

  const data = useMemo(() => generateUtilityData(filters), [filters]);

  return { filters, setFilters, data };
}
