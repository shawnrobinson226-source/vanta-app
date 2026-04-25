import { DISTORTION_CLASSES, type DistortionClass } from "@/lib/kernel/distortion-types";

const ALLOWED_REQUEST_FIELDS = [
  "trigger",
  "classification",
  "next_action",
  "outcome",
] as const;

type AllowedRequestField = (typeof ALLOWED_REQUEST_FIELDS)[number];

export type ValidatedRequestBody = {
  trigger: string;
  classification?: DistortionClass;
  next_action?: string;
  outcome?: string;
};

export type RequestValidationResult =
  | {
      ok: true;
      operatorId: string;
      body: ValidatedRequestBody;
    }
  | {
      ok: false;
      error: string;
    };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDistortionClass(value: string): value is DistortionClass {
  return DISTORTION_CLASSES.includes(value as DistortionClass);
}

export function validateRequest(
  req: Request,
  body: unknown,
): RequestValidationResult {
  const operatorId = req.headers.get("x-operator-id")?.trim() ?? "";
  if (!operatorId) {
    return { ok: false, error: "Missing operator identity" };
  }

  if (!isPlainObject(body)) {
    return { ok: false, error: "Invalid request body shape" };
  }

  const unknownFields = Object.keys(body).filter(
    (key) => !ALLOWED_REQUEST_FIELDS.includes(key as AllowedRequestField),
  );

  if (unknownFields.length > 0) {
    return {
      ok: false,
      error: `Unexpected fields: ${unknownFields.join(", ")}`,
    };
  }

  if (typeof body.trigger !== "string" || !body.trigger.trim()) {
    return { ok: false, error: "Trigger is required" };
  }

  const validatedBody: ValidatedRequestBody = {
    trigger: body.trigger.trim(),
  };

  if ("classification" in body) {
    if (typeof body.classification !== "string" || !body.classification.trim()) {
      return { ok: false, error: "Invalid classification" };
    }

    const classification = body.classification.trim();
    if (!isDistortionClass(classification)) {
      return { ok: false, error: "Invalid classification" };
    }

    validatedBody.classification = classification;
  }

  if ("next_action" in body) {
    if (typeof body.next_action !== "string" || !body.next_action.trim()) {
      return { ok: false, error: "Invalid next_action" };
    }

    validatedBody.next_action = body.next_action.trim();
  }

  if ("outcome" in body) {
    if (typeof body.outcome !== "string" || !body.outcome.trim()) {
      return { ok: false, error: "Invalid outcome" };
    }

    validatedBody.outcome = body.outcome.trim();
  }

  return {
    ok: true,
    operatorId,
    body: validatedBody,
  };
}
