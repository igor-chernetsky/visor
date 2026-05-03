export type NewsItem = {
  url: string;
  title: string | null;
  seen_at: string | null;
  domain: string | null;
  language: string | null;
  source_country: string | null;
  social_image_url: string | null;
  s3_bucket: string | null;
  s3_object_key: string | null;
};

type NewsResponse = {
  count: number;
  items: NewsItem[];
};

import { getNewsFetchRevalidateSeconds } from "@/lib/news-revalidate";

/** Full API root including path prefix (e.g. http://host:8000/api). No trailing slash. */
function newsApiBaseUrl(): string {
  const raw =
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api";
  return raw.replace(/\/+$/, "");
}

function newsFetchInit(): RequestInit {
  const sec = getNewsFetchRevalidateSeconds();
  if (sec > 0) {
    return { next: { revalidate: sec, tags: ["news"] } };
  }
  return { cache: "no-store", next: { tags: ["news"] } };
}

export async function fetchNews(params?: {
  q?: string;
  domain?: string;
  language?: string;
  source_country?: string;
  limit?: number;
  offset?: number;
}): Promise<NewsResponse> {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.domain) query.set("domain", params.domain);
  if (params?.language) query.set("language", params.language);
  if (params?.source_country) query.set("source_country", params.source_country);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));

  const url = `${newsApiBaseUrl()}/news${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url, newsFetchInit());
  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`);
  }
  return (await response.json()) as NewsResponse;
}

export async function fetchNewsByEncodedUrl(
  encodedUrl: string,
): Promise<NewsItem | null> {
  const url = Buffer.from(encodedUrl, "base64url").toString("utf-8");
  const result = await fetchNews({ q: url, limit: 100 });
  return result.items.find((item) => item.url === url) ?? null;
}

export function encodeNewsUrl(url: string): string {
  return Buffer.from(url, "utf-8").toString("base64url");
}
