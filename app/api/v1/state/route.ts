import { getDashboardState, getVolatilityBand } from "@/app/session/actions";
import { apiError, apiOk } from "@/lib/api/responses";
import { rateLimit } from "@/lib/api/rateLimit";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rl = rateLimit(`state:${ip}`, 5, 60000);

  if (!rl.allowed) {
    return apiError("Rate limit exceeded", 429);
  }

  try {
    const [state, volatilityBand] = await Promise.all([
      getDashboardState("op_legacy"),
      getVolatilityBand("op_legacy"),
    ]);

    return apiOk({
      ...state,
      volatilityBand,
    });
  } catch (err) {
    return apiError(err instanceof Error ? err.message : "Unknown error");
  }
}
export async function POST() {
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