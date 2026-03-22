"use server";

import { classifyDistortionText } from "@/lib/ai/distortion-classifier";
import { DistortionClassifierResult } from "@/lib/kernel/distortion-types";

export type ClassifyDistortionActionState =
  | {
      ok: true;
      result: DistortionClassifierResult;
      error: null;
    }
  | {
      ok: false;
      result: null;
      error: string;
    };

export async function classifyDistortionAction(
  _prevState: ClassifyDistortionActionState,
  formData: FormData,
): Promise<ClassifyDistortionActionState> {
  const userText = formData.get("userText");

  if (typeof userText !== "string" || userText.trim().length === 0) {
    return {
      ok: false,
      result: null,
      error: "Please enter text before classifying.",
    };
  }

  try {
    const result = await classifyDistortionText(userText);

    return {
      ok: true,
      result,
      error: null,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown classification error.";

    return {
      ok: false,
      result: null,
      error: message,
    };
  }
}
