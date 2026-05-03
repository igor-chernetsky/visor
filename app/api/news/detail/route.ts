import { NextRequest, NextResponse } from "next/server";

function backendBase(): string {
  return (
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
}

/** Proxy GET /api/news/detail?url=… → FastAPI */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url?.trim()) {
    return NextResponse.json({ detail: "url is required" }, { status: 400 });
  }
  const target = new URL(`${backendBase()}/news/detail`);
  target.searchParams.set("url", url);
  const res = await fetch(target.toString(), { cache: "no-store" });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}
