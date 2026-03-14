import { FractureId, Redirect } from "./types";

const REDIRECTS: Record<string, Redirect> = {
  do_20_min_block: {
    id: "do_20_min_block",
    label: "20-Minute Action Block",
    steps: [
      "Set a 20-minute timer.",
      "Work on the smallest viable part.",
      "Stop when the timer ends.",
    ],
  },

  set_boundary: {
    id: "set_boundary",
    label: "Set One Boundary",
    steps: [
      "Write one clear boundary sentence.",
      "Deliver it once.",
      "Do not over-explain.",
    ],
  },

  clarify: {
    id: "clarify",
    label: "Clarify Directly",
    steps: [
      "Ask one direct clarifying question.",
      "Wait for the response.",
    ],
  },

  next_action: {
    id: "next_action",
    label: "Name Next Action",
    steps: [
      "Write the next action in 7 words or fewer.",
      "Complete it within 24 hours.",
    ],
  },
};

export function redirectFor(id: FractureId): Redirect {
  switch (id) {
    case "avoidance_loop":
      return REDIRECTS.do_20_min_block;

    case "boundary_violation":
    case "status_threat":
      return REDIRECTS.set_boundary;

    case "uncertainty_intolerance":
      return REDIRECTS.clarify;

    default:
      return REDIRECTS.next_action;
  }
}