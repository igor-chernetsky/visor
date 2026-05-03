/**
 * NEWS_FETCH_REVALIDATE_SECONDS
 * - unset / empty / 0: always fetch fresh (no time-based cache).
 * - positive (e.g. 21600): Next.js may reuse the response for up to that many seconds (6h = 21600).
 */
export function getNewsFetchRevalidateSeconds(): number {
  const raw = process.env.NEWS_FETCH_REVALIDATE_SECONDS;
  if (raw == null || String(raw).trim() === "" || raw === "0") {
    return 0;
  }
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
