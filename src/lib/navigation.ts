import { Factory, LayoutDashboard } from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "MD Dashboard",
    description: "Executive production, cost & contribution overview",
    icon: LayoutDashboard,
  },
  {
    href: "/manufacturing",
    label: "Manufacturing Plant Dashboard",
    description: "Production, process, equipment & quality",
    icon: Factory,
  },
];
