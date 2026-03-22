// /lib/engine/recompute/types.ts
import type { DistortionClass, SessionOutcome } from "@/lib/kernel/recompute";

export type SessionIndexRow = {
  operator_id: string;
  session_id: string;
  occurred_at: string;

  confirmed_class: DistortionClass | null;
  outcome: SessionOutcome;
  clarity_rating: number;
  steps_completed: number;

  continuity_before: number | null;
  continuity_after: number | null;
  continuity_delta: number | null;

  protocol_type: string | null;
  formula_version: string | null;

  is_complete: boolean;
};

export type RecurrenceRow = {
  operator_id: string;
  class: DistortionClass;
  window_days: number;
  count: number;
  last_seen_at: string | null;
  avg_days_between: number | null;
};

export type RecoveryRow = {
  operator_id: string;
  class: DistortionClass;
  sample_size: number;
  reduced_rate: number;
  escalated_rate: number;
  avg_sessions_to_reduce: number | null;
  avg_clarity_delta: number | null;
};

export type VolatilityRow = {
  operator_id: string;
  window_days: number;
  clarity_variance: number;
  continuity_variance: number;
  volatility_band: "low" | "medium" | "high";
};