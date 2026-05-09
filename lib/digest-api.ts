export type DigestDetail = {
  digest_date: string;
  title: string | null;
  body_markdown: string;
  meta: { image_slots?: { slot: number; article_id: number | null; url: string | null }[] } | null;
  created_at?: string | null;
};

function apiBase(): string {
  return (process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(/\/+$/, "");
}

export async function fetchDigestByDate(date: string): Promise<DigestDetail | null> {
  const url = `${apiBase()}/digests/by-date?date=${encodeURIComponent(date)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Digest API ${res.status}`);
  }
  return (await res.json()) as DigestDetail;
}
