// app/api/ai/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "vanta-ai-route",
    message: "AI route online (stub).",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  return NextResponse.json({
    ok: true,
    service: "vanta-ai-route",
    received: body,
  });
}
