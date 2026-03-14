// /lib/validation/entry.ts
import { z } from "zod";

/**
 * Lane 1: validator + normalizer for entries table inserts.
 * Goal: prevent poisoned rows from ever hitting DB.
 */

const MAX_TRIGGER_LEN = 1000;
const MAX_LABEL_LEN = 120;
const MAX_REFRAME_LEN = 2000;
const MAX_STEP_LEN = 240;
const MAX_STEPS = 7;

function normalizeText(input: string) {
  return input
    .replace(/[^\S\r\n\t]+/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

const normStr = (min: number, max: number, label: string) =>
  z.preprocess(
    (v) => (typeof v === "string" ? normalizeText(v) : v),
    z.string().min(min, `${label} required`).max(max, `${label} too long`)
  );

const StepSchema = normStr(1, MAX_STEP_LEN, "Step");

const StepsArraySchema = z
  .array(StepSchema)
  .min(1, "At least one redirect step required")
  .max(MAX_STEPS, `Max ${MAX_STEPS} steps`);

const AnalysisSchema = z.object({
  fracture: z.object({
    id: normStr(1, 64, "fracture.id"),
    label: normStr(1, MAX_LABEL_LEN, "fracture.label"),
    description: z.string().optional(),
    signals: z.array(z.string()).optional(),
  }),
  reframe: normStr(1, MAX_REFRAME_LEN, "reframe"),
  redirect: z.object({
    id: normStr(1, 64, "redirect.id"),
    label: normStr(1, MAX_LABEL_LEN, "redirect.label"),
    steps: StepsArraySchema,
  }),
});

export type ValidatedEntryInput = {
  trigger: string;
  fracture_id: string;
  fracture_label: string;
  reframe: string;
  redirect_id: string;
  redirect_label: string;
  redirect_steps_json: string; // canonical JSON array string
};

export function validateAndNormalizeEntry(args: {
  trigger: string;
  analysis: unknown;
  allowedFractureIds?: ReadonlySet<string>;
  allowedRedirectIds?: ReadonlySet<string>;
}): ValidatedEntryInput {
  const trigger = normalizeText(args.trigger ?? "");
  if (!trigger) throw new Error("Trigger is required.");
  if (trigger.length > MAX_TRIGGER_LEN) {
    throw new Error(`Trigger too long (max ${MAX_TRIGGER_LEN}).`);
  }

  const parsed = AnalysisSchema.parse(args.analysis);

  if (
    args.allowedFractureIds &&
    !args.allowedFractureIds.has(parsed.fracture.id)
  ) {
    throw new Error("Invalid fracture_id.");
  }

  if (
    args.allowedRedirectIds &&
    !args.allowedRedirectIds.has(parsed.redirect.id)
  ) {
    throw new Error("Invalid redirect_id.");
  }

  return {
    trigger,
    fracture_id: parsed.fracture.id,
    fracture_label: parsed.fracture.label,
    reframe: parsed.reframe,
    redirect_id: parsed.redirect.id,
    redirect_label: parsed.redirect.label,
    redirect_steps_json: JSON.stringify(parsed.redirect.steps),
  };
}