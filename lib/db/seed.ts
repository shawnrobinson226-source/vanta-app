import type { Client } from "@libsql/client";

export type SeedFracture = {
  id: string;
  label: string;
  description: string;
  signals: string[];
};

export type SeedRedirect = {
  id: string;
  label: string;
  steps: string[];
};

export const SEED_FRACTURES: SeedFracture[] = [
  {
    id: "control_loss",
    label: "Control Loss",
    description: "Triggered by loss of control or forced dependence.",
    signals: ["out of control", "forced", "trapped", "no choice", "helpless"],
  },
  {
    id: "rejection_sensitivity",
    label: "Rejection Sensitivity",
    description: "Triggered by perceived dismissal or abandonment.",
    signals: ["ignored", "rejected", "left out", "unwanted", "alone"],
  },
  {
    id: "status_threat",
    label: "Status Threat",
    description: "Triggered by embarrassment or perceived disrespect.",
    signals: ["disrespect", "embarrassed", "humiliated", "undermined"],
  },
  {
    id: "uncertainty_intolerance",
    label: "Uncertainty Intolerance",
    description: "Triggered by ambiguity or waiting.",
    signals: ["not sure", "unclear", "waiting", "no answer", "unknown"],
  },
  {
    id: "self_worth_dependency",
    label: "Self-Worth Dependency",
    description: "Triggered by value tied to outcome or approval.",
    signals: ["not enough", "failure", "validation", "prove", "approved"],
  },
  {
    id: "boundary_violation",
    label: "Boundary Violation",
    description: "Triggered by overreach or intrusion.",
    signals: ["crossed a line", "too far", "shouldn't", "invaded"],
  },
  {
    id: "comparison_spiral",
    label: "Comparison Spiral",
    description: "Triggered by measuring against others.",
    signals: ["behind", "everyone else", "compare", "catch up"],
  },
  {
    id: "over_responsibility",
    label: "Over-Responsibility",
    description: "Triggered by carrying others' outcomes.",
    signals: ["my fault", "have to fix", "responsible for"],
  },
  {
    id: "avoidance_loop",
    label: "Avoidance Loop",
    description: "Triggered by procrastination or delay.",
    signals: ["later", "avoid", "procrastinate", "too much"],
  },
  {
    id: "shame_spike",
    label: "Shame Spike",
    description: "Triggered by self-attack framing.",
    signals: ["ashamed", "pathetic", "disgusting", "hate myself"],
  },
];

export const SEED_REDIRECTS: SeedRedirect[] = [
  {
    id: "do_20_min_block",
    label: "20-Minute Action Block",
    steps: ["Set a 20-minute timer.", "Work on the smallest viable part.", "Stop when the timer ends."],
  },
  {
    id: "set_boundary",
    label: "Set One Boundary",
    steps: ["Write one clear boundary sentence.", "Deliver it once.", "Do not over-explain."],
  },
  {
    id: "clarify",
    label: "Clarify Directly",
    steps: ["Ask one direct clarifying question.", "Wait for the response."],
  },
  {
    id: "next_action",
    label: "Name Next Action",
    steps: ["Write the next action in 7 words or fewer.", "Complete it within 24 hours."],
  },
];

export async function seedDb(db: Client) {
  // fractures
  for (const f of SEED_FRACTURES) {
    await db.execute({
      sql: `insert or ignore into fractures (id, label, description, signals_json)
            values (?, ?, ?, ?)`,
      args: [f.id, f.label, f.description, JSON.stringify(f.signals)],
    });
  }

  // redirects
  for (const r of SEED_REDIRECTS) {
    await db.execute({
      sql: `insert or ignore into redirects (id, label, steps_json)
            values (?, ?, ?)`,
      args: [r.id, r.label, JSON.stringify(r.steps)],
    });
  }
}