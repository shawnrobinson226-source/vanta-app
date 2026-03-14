import { FractureId } from "./types";

export function reframeFor(id: FractureId): string {
  switch (id) {
    case "control_loss":
      return "Loss of control feels urgent, but focus returns by identifying the next controllable step.";

    case "rejection_sensitivity":
      return "A response is data, not a verdict on your value.";

    case "status_threat":
      return "Escalation is optional. Protect standards with precision.";

    case "uncertainty_intolerance":
      return "Uncertainty is uncomfortable, not dangerous. Reduce it with one clear action.";

    case "self_worth_dependency":
      return "Value is not negotiated by outcomes. Measure alignment, not approval.";

    case "boundary_violation":
      return "Clarify the boundary directly and briefly.";

    case "comparison_spiral":
      return "Return to your own lane and next step.";

    case "over_responsibility":
      return "Own your part. Release what is not yours.";

    case "avoidance_loop":
      return "Start small. Momentum reduces pressure.";

    case "shame_spike":
      return "Separate behavior from identity. Repair the action.";

    default:
      // Defensive fallback
      return "Name the distortion and choose the next executable step.";
  }
}