import { apiError, apiOk } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rateLimit";
import { validateRequest } from "@/lib/api/validateRequest";
import { processSession } from "@/lib/session/process";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`v2-execute:${ip}`, 5, 60000);
  if (!rl.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  try {
    const body = await req.json();
    const validation = validateRequest(req, body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    if (!validation.body.classification) {
      return apiError("Classification is required", 400);
    }
    if (!validation.body.next_action) {
      return apiError("Next action is required", 400);
    }

    const result = await processSession({
      operator_id: validation.operatorId,
      trigger: validation.body.trigger,
      distortion_class: validation.body.classification,
      next_action: validation.body.next_action,
      outcome: validation.body.outcome,
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
