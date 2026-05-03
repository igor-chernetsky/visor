import { NextResponse } from "next/server";

function backendBase(): string {
  return (
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api"
  ).replace(/\/+$/, "");
}

export async function GET() {
  const url = `${backendBase()}/news/languages`;
  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type":
        res.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}
