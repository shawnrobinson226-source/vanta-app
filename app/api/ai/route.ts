// app/api/ai/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // safe default for Vercel

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "vanta-ai-route",
    message: "AI route online (stub).",
  });
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  return NextResponse.json({
    ok: true,
    service: "vanta-ai-route",
    received: body,
  });
}
