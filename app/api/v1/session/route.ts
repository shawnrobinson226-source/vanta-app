import { getRecentSessions, saveSessionCore } from "@/app/session/actions";
import { apiError, apiOk } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rateLimit";
import { withTimeout } from "@/lib/utils/withTimeout";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`session:${ip}`, 5, 60000);

  if (!rl.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  try {
    const operatorId =
  req.headers.get("x-operator-id") ?? "op_legacy";

const sessions = await withTimeout(
  getRecentSessions(operatorId, 50),
  3000
);
    return apiOk({ sessions });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Unknown error");
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`session_write:${ip}`, 10, 60000);

  if (!rl.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  try {
    const operatorId =
      req.headers.get("x-operator-id") ?? "op_legacy";

    const body = await req.json();

    if (!body?.trigger) {
      return apiError("Missing trigger", 400);
    }

    const allowedDistortionClasses = new Set([
      "narrative",
      "emotional",
      "behavioral",
      "perceptual",
      "continuity",
    ]);

    if (
      typeof body.distortion_class !== "string" ||
      !allowedDistortionClasses.has(body.distortion_class)
    ) {
      return apiError(
        "Missing or invalid distortion_class",
        400,
      );
    }

    const nextAction =
      body.next_action ||
      (Array.isArray(body.redirect_steps) ? body.redirect_steps[0] : "");

    if (typeof nextAction !== "string" || !nextAction.trim()) {
      return apiError("Missing next_action", 400);
    }

   const result = await withTimeout(
  saveSessionCore({
    operator_id: operatorId,
    trigger: body.trigger,
    distortion_class: body.distortion_class,
    next_action: nextAction.trim(),
  }),
  3000
);
    return apiOk({ result });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Unknown error");
  }
}

export async function PUT() { return apiError("Method not allowed", 405); }
export async function PATCH() { return apiError("Method not allowed", 405); }
export async function DELETE() { return apiError("Method not allowed", 405); }
