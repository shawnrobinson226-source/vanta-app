import { NextResponse } from "next/server";
import { getRecentSessions } from "@/app/session/actions";

export async function GET() {
  try {
    const sessions = await getRecentSessions(50);

    return NextResponse.json({
      ok: true,
      version: "v1",
      data: {
        sessions,
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