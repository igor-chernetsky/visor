"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { excerptFromGdeltSnippet } from "@/lib/gdelt-snippet";
import type { NewsItem } from "@/lib/news-api";

const PAGE_SIZE = 50;

/** Labels for chips; `slug` is sent as `topic=` (server uses bundled vectors for these slugs). */
const TOPIC_FILTERS: { label: string; slug: string }[] = [
  { label: "Climate", slug: "climate" },
  { label: "Technology", slug: "technology" },
  { label: "Health", slug: "health" },
];

type NewsResponse = { count: number; items: NewsItem[] };

/** Collapse http/https, www, trailing slash, hash — same story often appears with variants. */
function normalizeUrlKey(url: string): string {
  const s = url.trim();
  if (!s) return "";
  try {
    const u = new URL(s);
    u.hash = "";
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    let path = u.pathname;
    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    return `${u.protocol.toLowerCase()}//${host}${path}${u.search}`;
  } catch {
    return s.toLowerCase();
  }
}

/** First row wins per normalized URL (client safety net + variant URLs). */
function dedupeByUrl(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    const key = normalizeUrlKey(item.url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function fetchPage(offset: number, language: string, topic: string): Promise<NewsResponse> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    order_by: "created_at",
  });
  if (language) {
    params.set("language", language);
  }
  if (topic) {
    params.set("topic", topic);
  }
  const res = await fetch(`/api/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load news (${res.status})`);
  }
  return (await res.json()) as NewsResponse;
}

export function NewsInfiniteFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [language, setLanguage] = useState("");
  /** Empty = chronological list; non-empty = server ranks by embedding similarity to this phrase. */
  const [semanticTopic, setSemanticTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  /** Rows already consumed from the API (for OFFSET); do not use `items.length` after dedupe. */
  const [apiOffset, setApiOffset] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadMoreLockRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news/languages");
        if (!res.ok) return;
        const data = (await res.json()) as { languages?: string[] };
        if (!cancelled && Array.isArray(data.languages)) {
          setLanguages(data.languages);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadInitial = useCallback(async (lang: string, topic: string) => {
    setLoading(true);
    setError(null);
    setHasMore(true);
    setApiOffset(0);
    try {
      const data = await fetchPage(0, lang, topic);
      setItems(dedupeByUrl(data.items));
      setApiOffset(data.items.length);
      setHasMore(data.items.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
      setHasMore(false);
      setApiOffset(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial(language, semanticTopic);
  }, [language, semanticTopic, loadInitial]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || loadMoreLockRef.current) return;
    loadMoreLockRef.current = true;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchPage(apiOffset, language, semanticTopic);
      setApiOffset((o) => o + data.items.length);
      setItems((prev) => dedupeByUrl([...prev, ...data.items]));
      setHasMore(data.items.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [apiOffset, language, semanticTopic, hasMore, loading, loadingMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Topic (vector search)</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSemanticTopic("")}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                semanticTopic === ""
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              All topics
            </button>
            {TOPIC_FILTERS.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSemanticTopic(t.slug)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  semanticTopic === t.slug
                    ? "border-blue-600 bg-blue-50 text-blue-800"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <label htmlFor="language-filter" className="mb-1 block text-sm font-medium text-gray-700">
              Language
            </label>
            <select
              id="language-filter"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All languages</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <p className="text-sm text-gray-500">
              {items.length} article{items.length === 1 ? "" : "s"} loaded
              {language ? ` · ${language}` : ""}
              {semanticTopic ? " · ranked by topic" : ""}
            </p>
          )}
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const summary = excerptFromGdeltSnippet(item.gdelt_snippet);
          return (
            <article
              key={normalizeUrlKey(item.url)}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {item.social_image_url ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[16/10] w-full shrink-0 bg-gray-100 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  <Image
                    src={item.social_image_url}
                    alt={item.title ? item.title : "Article thumbnail"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </a>
              ) : (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-medium text-gray-500 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  No thumbnail — open article
                </a>
              )}

              <div className="flex flex-1 flex-col p-4">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-700 hover:underline"
                  >
                    {item.title || item.url}
                  </a>
                </h2>
                {summary ? (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-700">
                    {summary}
                  </p>
                ) : null}
                <p className="mt-auto pt-3 line-clamp-2 text-xs text-gray-500">
                  {item.domain || "unknown-domain"}
                  {" • "}
                  {item.language || "unknown-language"}
                  {" • "}
                  {item.source_country || "unknown-country"}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden />

      {loadingMore ? (
        <p className="mt-6 text-center text-sm text-gray-500">Loading more…</p>
      ) : null}

      {!loading && !hasMore && items.length > 0 ? (
        <p className="mt-6 text-center text-sm text-gray-500">End of list</p>
      ) : null}

      {!loading && items.length === 0 ? (
        <p className="mt-8 text-gray-600">No news found yet.</p>
      ) : null}
    </>
  );
}
