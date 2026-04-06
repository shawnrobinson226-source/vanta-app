import { apiError, apiOk } from "@/lib/api/responses";

export async function GET() {
  try {
    return apiOk({
      status: "healthy",
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