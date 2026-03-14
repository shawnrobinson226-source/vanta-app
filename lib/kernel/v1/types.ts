export type FractureId =
  | "control_loss"
  | "rejection_sensitivity"
  | "status_threat"
  | "uncertainty_intolerance"
  | "self_worth_dependency"
  | "boundary_violation"
  | "comparison_spiral"
  | "over_responsibility"
  | "avoidance_loop"
  | "shame_spike";

export type RedirectId =
  | "do_20_min_block"
  | "set_boundary"
  | "clarify"
  | "next_action";

export type Fracture = {
  id: FractureId;
  label: string;
  description: string;
  signals: string[];
};

export type Redirect = {
  id: RedirectId;
  label: string;
  steps: string[];
};

export type AnalysisResult = {
  fracture: Fracture;
  reframe: string;
  redirect: Redirect;
};