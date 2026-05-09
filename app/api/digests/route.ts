import { NextResponse } from "next/server";

/** How long Next keeps this route’s fetch cache (new digest days appear at most ~daily). */
export const revalidate = 3600;

function backendBase(): string {
  return (
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
}

/** Proxy GET /api/digests → FastAPI list of digest dates. */
export async function GET() {
  const target = `${backendBase()}/digests`;
  const res = await fetch(target, { next: { revalidate } });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
      "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=86400`,
    },
  });
}
