import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const apiToken = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

/**
 * Proxies estimate design images from FastAPI with the API token applied server-side.
 * Use this for <img src> instead of /backend/... so the response is not double-rewritten
 * and the session + token handling is reliable.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ estimateId: string; side: string }> },
) {
  const { estimateId, side } = await context.params;
  if (side !== "front" && side !== "back") {
    return NextResponse.json({ detail: "Invalid side" }, { status: 400 });
  }

  if (!apiToken) {
    return NextResponse.json({ detail: "API token not configured" }, { status: 503 });
  }

  const url = `${backendUrl}/api/estimates/${encodeURIComponent(estimateId)}/design/${side}?token=${encodeURIComponent(apiToken)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return new NextResponse(null, { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const body = res.body;
  if (body) {
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=300",
      },
    });
  }

  const buf = await res.arrayBuffer();
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
