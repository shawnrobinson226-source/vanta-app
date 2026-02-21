import { FRACTURES } from "./fractures";
import { Fracture } from "./types";

export function matchFracture(trigger: string): Fracture {
  const text = trigger.toLowerCase();

  let bestMatch: { fracture: Fracture; score: number } | null = null;

  for (const fracture of FRACTURES) {
    let score = 0;

    for (const signal of fracture.signals) {
      if (text.includes(signal.toLowerCase())) {
        score++;
      }
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { fracture, score };
    }
  }

  // Default fallback
  if (!bestMatch || bestMatch.score === 0) {
    return FRACTURES.find(f => f.id === "uncertainty_intolerance")!;
  }

  return bestMatch.fracture;
}