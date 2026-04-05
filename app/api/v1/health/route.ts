import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      version: "v1",
      data: {
        status: "healthy",
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
