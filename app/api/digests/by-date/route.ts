import { NextRequest, NextResponse } from "next/server";

/** Digest for a given date is written once and never updated — cache aggressively. */
export const revalidate = 604800;

function backendBase(): string {
  return (
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
}

/** Proxy GET /api/digests/by-date?date=YYYY-MM-DD */
export async function GET(request: NextRequest) {
  const target = new URL(`${backendBase()}/digests/by-date`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const res = await fetch(target.toString(), { next: { revalidate } });
  const text = await res.text();
  const cc =
    res.status === 404
      ? "private, no-store"
      : `public, max-age=${revalidate}, s-maxage=${revalidate}, stale-while-revalidate=86400`;
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
      "Cache-Control": cc,
    },
  });
}
