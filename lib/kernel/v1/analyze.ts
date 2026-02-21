import { matchFracture } from "./matcher";
import { reframeFor } from "./reframe";
import { redirectFor } from "./redirect";
import { AnalysisResult } from "./types";

export function analyzeTrigger(trigger: string): AnalysisResult {
  const fracture = matchFracture(trigger);
  const reframe = reframeFor(fracture.id);
  const redirect = redirectFor(fracture.id);

  return {
    fracture,
    reframe,
    redirect
  };
}