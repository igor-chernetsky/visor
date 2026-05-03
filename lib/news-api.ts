export type NewsItem = {
  url: string;
  title: string | null;
  seen_at: string | null;
  /** When this row was first saved in our database (ingestion time). */
  created_at: string | null;
  domain: string | null;
  language: string | null;
  source_country: string | null;
  social_image_url: string | null;
  s3_bucket: string | null;
  s3_object_key: string | null;
};

/** Full row from GET /news/detail (includes raw GDELT fields). */
export type NewsItemDetail = NewsItem & {
  gdelt_snippet?: Record<string, unknown> | null;
};

type NewsResponse = {
  count: number;
  items: NewsItem[];
};

/** Full API root including path prefix (e.g. http://host:8000/api). No trailing slash. */
function newsApiBaseUrl(): string {
  const raw =
    process.env.NEWS_API_BASE_URL ?? "http://127.0.0.1:8000/api";
  return raw.replace(/\/+$/, "");
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
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`News API request failed: ${response.status}`);
  }
  return (await response.json()) as NewsResponse;
}

export async function fetchNewsDetailByUrl(
  articleUrl: string,
): Promise<NewsItemDetail | null> {
  const params = new URLSearchParams({ url: articleUrl });
  const response = await fetch(
    `${newsApiBaseUrl()}/news/detail?${params.toString()}`,
    { cache: "no-store" },
  );
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`News detail request failed: ${response.status}`);
  }
  return (await response.json()) as NewsItemDetail;
}

export async function fetchNewsByEncodedUrl(
  encodedUrl: string,
): Promise<NewsItemDetail | null> {
  const url = Buffer.from(encodedUrl, "base64url").toString("utf-8");
  return fetchNewsDetailByUrl(url);
}

export { encodeNewsUrl } from "./encode-news-url";
