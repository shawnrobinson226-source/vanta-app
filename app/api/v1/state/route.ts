import { NextResponse } from "next/server";
import { getDashboardState, getVolatilityBand } from "@/app/session/actions";

export async function GET() {
  try {
    const [state, volatilityBand] = await Promise.all([
      getDashboardState("op_legacy"),
      getVolatilityBand("op_legacy"),
    ]);

    return NextResponse.json({
      ok: true,
      version: "v1",
      data: {
        ...state,
        volatilityBand,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        version: "v1",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}