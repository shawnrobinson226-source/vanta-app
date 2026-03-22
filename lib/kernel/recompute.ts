// /lib/kernel/recompute.ts

export const RECOMPUTE_WINDOWS_DAYS = [7, 30, 90] as const;
export type RecomputeWindowDays = (typeof RECOMPUTE_WINDOWS_DAYS)[number];

export const VOLATILITY_WINDOWS_DAYS = [30, 90] as const;
export type VolatilityWindowDays = (typeof VOLATILITY_WINDOWS_DAYS)[number];

export const DISTORTION_CLASSES = [
  "narrative",
  "emotional",
  "behavioral",
  "perceptual",
  "continuity",
] as const;

export type DistortionClass = (typeof DISTORTION_CLASSES)[number];

export const OUTCOMES = ["reduced", "unresolved", "escalated"] as const;
export type SessionOutcome = (typeof OUTCOMES)[number];

// V1 guardrails (match your validator assumptions)
export const REDUCED_MIN_STEPS = 6;
export const REDUCED_MIN_CLARITY = 6;

// Volatility bands (tune later; deterministic now)
export const VOL_BAND = {
  LOW_MAX: 4,
  MED_MAX: 12,
} as const;