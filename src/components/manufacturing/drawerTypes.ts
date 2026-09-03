export type MfgDrawerTarget =
  | { type: "production" }
  | { type: "capacity" }
  | { type: "oee" }
  | { type: "yield" }
  | { type: "quality" }
  | { type: "line"; lineId: string }
  | { type: "processStep"; stepId: string };
