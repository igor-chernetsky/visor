/**
 * NEWS_FETCH_REVALIDATE_SECONDS — applies to `fetch()` in lib/news-api.ts only.
 * Pages use `dynamic = "force-dynamic"` (segment config must stay static for `next build`).
 *
 * - unset / empty / 0: `cache: "no-store"` on the API fetch.
 * - positive (e.g. 21600): `next: { revalidate }` on the API fetch (up to N seconds stale).
 */
export function getNewsFetchRevalidateSeconds(): number {
  const raw = process.env.NEWS_FETCH_REVALIDATE_SECONDS;
  if (raw == null || String(raw).trim() === "" || raw === "0") {
    return 0;
  }
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
