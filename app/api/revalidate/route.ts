import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand cache bust when new articles are ingested.
 * POST /api/revalidate?secret=YOUR_SECRET
 * Or: Authorization: Bearer YOUR_SECRET
 */
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 501 },
    );
  }

  const q = request.nextUrl.searchParams.get("secret");
  const auth = request.headers.get("authorization");
  const bearer =
    auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  const provided = q ?? bearer;

  if (provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  revalidateTag("news", "max");
  return NextResponse.json({ ok: true, revalidated: "news" });
}
