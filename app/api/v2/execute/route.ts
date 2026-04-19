import { randomUUID } from "node:crypto";
import { apiError, apiOk } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rateLimit";
import { db, initDbIfNeeded } from "@/lib/db/client";
import { DISTORTION_CLASSES } from "@/lib/kernel/distortion-types";
import { processSession } from "@/lib/session/process";

const ALLOWED_EXECUTE_FIELDS = [
  "trigger",
  "distortion_class",
  "next_action",
] as const;

async function logBoundaryViolation(params: {
  operatorId: string;
  ip: string;
  reason: string;
  payload: Record<string, unknown>;
}) {
  try {
    await initDbIfNeeded();
    await db.execute({
      sql: `
        INSERT INTO events (
          event_id,
          event_type,
          occurred_at,
          schema_version,
          actor_kind,
          actor_id,
          operator_id,
          session_id,
          fracture_id,
          distortion_id,
          payload_json,
          meta_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        randomUUID(),
        "security.boundary_violation",
        new Date().toISOString(),
        "v1",
        "system",
        "api.v2.execute",
        params.operatorId,
        null,
        null,
        null,
        JSON.stringify({
          route: "/api/v2/execute",
          reason: params.reason,
          payload: params.payload,
        }),
        JSON.stringify({
          ip: params.ip,
        }),
      ],
    });
  } catch {
    // fail-closed behavior on request validation remains; logging must not widen blast radius
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`v2-execute:${ip}`, 5, 60000);
  if (!rl.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  const operatorId = req.headers.get("x-operator-id")?.trim() ?? "";
  if (!operatorId) {
    return apiError("Missing operator identity", 401);
  }

  try {
    const parsed = (await req.json()) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      await logBoundaryViolation({
        operatorId,
        ip,
        reason: "invalid_payload_shape",
        payload: { body_type: typeof parsed },
      });
      return apiError("Invalid request body shape.", 400);
    }

    const body = parsed as Record<string, unknown>;
    const unknownFields = Object.keys(body).filter(
      (key) =>
        !ALLOWED_EXECUTE_FIELDS.includes(key as (typeof ALLOWED_EXECUTE_FIELDS)[number]),
    );
    if (unknownFields.length > 0) {
      await logBoundaryViolation({
        operatorId,
        ip,
        reason: "unknown_fields",
        payload: { unknown_fields: unknownFields },
      });
      return apiError(
        `Unexpected fields: ${unknownFields.join(", ")}`,
        400,
      );
    }

    const trigger = typeof body.trigger === "string" ? body.trigger.trim() : "";
    const distortion_class =
      typeof body.distortion_class === "string" ? body.distortion_class.trim() : "";
    const next_action =
      typeof body.next_action === "string" ? body.next_action.trim() : "";

    if (!trigger) return apiError("Trigger is required.", 400);
    if (!distortion_class) return apiError("Distortion class is required.", 400);
    if (!DISTORTION_CLASSES.includes(distortion_class as (typeof DISTORTION_CLASSES)[number])) {
      await logBoundaryViolation({
        operatorId,
        ip,
        reason: "invalid_distortion_class",
        payload: { distortion_class },
      });
      return apiError("Invalid distortion class.", 400);
    }
    if (!next_action) return apiError("Next action is required.", 400);

    const result = await processSession({
      operator_id: operatorId,
      trigger,
      distortion_class,
      next_action,
    });

    return apiOk(result);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Unknown error", 400);
  }
}

export async function GET() {
  return apiError("Method not allowed", 405);
}

export async function PUT() {
  return apiError("Method not allowed", 405);
}

export async function PATCH() {
  return apiError("Method not allowed", 405);
}

export async function DELETE() {
  return apiError("Method not allowed", 405);
}
