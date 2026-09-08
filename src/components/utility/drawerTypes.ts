export type UtilityDrawerTarget =
  | { type: "power" }
  | { type: "gas" }
  | { type: "water" }
  | { type: "ro" }
  | { type: "upw" }
  | { type: "cooling" }
  | { type: "etp" }
  | { type: "hvac" }
  | { type: "compressedAir" }
  | { type: "vacuum" }
  | { type: "chemicals" }
  | { type: "equipment-row"; area: "compressedAir" | "vacuum"; id: string }
  | { type: "downtime-impact"; key: string };
