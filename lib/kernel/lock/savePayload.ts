import { z } from "zod";
import { DistortionClass, SessionOutcome } from "./taxonomy";

export const zCreateEntryInput = z.object({
  trigger: z.string().min(1),

  confirmed_class: z.enum([
    DistortionClass.NARRATIVE,
    DistortionClass.EMOTIONAL,
    DistortionClass.BEHAVIORAL,
    DistortionClass.PERCEPTUAL,
    DistortionClass.CONTINUITY,
  ]),

  outcome: z.enum([
    SessionOutcome.REDUCED,
    SessionOutcome.UNRESOLVED,
    SessionOutcome.ESCALATED,
  ]),

  clarity_0_10: z.number().min(0).max(10),
  steps_completed: z.number().int().min(0).max(9),

  analysis_preview: z.unknown().optional(),
});

export type CreateEntryInput = z.infer<typeof zCreateEntryInput>;
