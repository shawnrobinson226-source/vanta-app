import { FRACTURES } from "./fractures";
import { Fracture } from "./types";

export function matchFracture(trigger: string): Fracture {
  const text = trigger.trim().toLowerCase();

  // Deterministic fallback for no-match / empty input
  const fallback =
    FRACTURES.find((f) => f.id === "uncertainty_intolerance") ?? FRACTURES[0];

  if (!text) return fallback;

  let bestMatch: { fracture: Fracture; score: number } | null = null;

  for (const fracture of FRACTURES) {
    let score = 0;

    for (const signal of fracture.signals) {
      if (text.includes(signal.toLowerCase())) {
        score += 1;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { fracture, score };
    }

    // Intentional tie behavior:
    // if score === bestMatch.score, keep the earlier fracture in FRACTURES order.
    // This preserves deterministic first-win behavior in V1.
  }

  if (!bestMatch || bestMatch.score <= 0) {
    return fallback;
  }

  return bestMatch.fracture;
}