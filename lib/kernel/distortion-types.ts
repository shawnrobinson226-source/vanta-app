export const DISTORTION_CLASSES = [
  "narrative",
  "emotional",
  "behavioral",
  "perceptual",
  "continuity",
] as const;

export type DistortionClass = (typeof DISTORTION_CLASSES)[number];

export type DistortionClassifierResult = {
  primary_class: DistortionClass;
  confidence: number;
  secondary_candidates: Array<{
    class: DistortionClass;
    confidence: number;
  }>;
  evidence: string[];
  reasoning: string;
  user_confirmation_question: string;
};

export function isDistortionClass(value: unknown): value is DistortionClass {
  return (
    typeof value === "string" &&
    DISTORTION_CLASSES.includes(value as DistortionClass)
  );
}

export function normalizeConfidence(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function sanitizeClassifierResult(
  input: unknown,
): DistortionClassifierResult {
  const fallback: DistortionClassifierResult = {
    primary_class: "narrative",
    confidence: 0,
    secondary_candidates: [],
    evidence: [],
    reasoning: "Unable to safely classify the text.",
    user_confirmation_question:
      "Does this look closer to narrative, emotional, behavioral, perceptual, or continuity distortion?",
  };

  if (!input || typeof input !== "object") return fallback;

  const obj = input as Record<string, unknown>;

  const primary = isDistortionClass(obj.primary_class)
    ? obj.primary_class
    : fallback.primary_class;

  const confidence = normalizeConfidence(obj.confidence);

  const secondary_candidates = Array.isArray(obj.secondary_candidates)
    ? obj.secondary_candidates
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const candidate = item as Record<string, unknown>;
          if (!isDistortionClass(candidate.class)) return null;

          return {
            class: candidate.class,
            confidence: normalizeConfidence(candidate.confidence),
          };
        })
        .filter(
          (
            item,
          ): item is { class: DistortionClass; confidence: number } => item !== null,
        )
        .slice(0, 3)
    : [];

  const evidence = Array.isArray(obj.evidence)
    ? obj.evidence
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const reasoning =
    typeof obj.reasoning === "string" && obj.reasoning.trim().length > 0
      ? obj.reasoning.trim()
      : fallback.reasoning;

  const user_confirmation_question =
    typeof obj.user_confirmation_question === "string" &&
    obj.user_confirmation_question.trim().length > 0
      ? obj.user_confirmation_question.trim()
      : fallback.user_confirmation_question;

  return {
    primary_class: primary,
    confidence,
    secondary_candidates,
    evidence,
    reasoning,
    user_confirmation_question,
  };
}
