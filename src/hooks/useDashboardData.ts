"use client";

import { useMemo, useState } from "react";
import { generateDashboardData } from "@/data/generator";
import { DEFAULT_DATE } from "@/lib/constants";
import type { DashboardFilters } from "@/types/dashboard";

const DEFAULT_FILTERS: DashboardFilters = {
  period: "day",
  date: DEFAULT_DATE,
  shift: 1,
  line: "all",
};

export function useDashboardData() {
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);

  const data = useMemo(() => generateDashboardData(filters), [filters]);

  return { filters, setFilters, data };
}
