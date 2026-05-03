"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { encodeNewsUrl } from "@/lib/encode-news-url";
import type { NewsItem } from "@/lib/news-api";

const PAGE_SIZE = 50;

type NewsResponse = { count: number; items: NewsItem[] };

async function fetchPage(offset: number, language: string): Promise<NewsResponse> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    order_by: "created_at",
  });
  if (language) {
    params.set("language", language);
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  const loadInitial = useCallback(async (lang: string) => {
    setLoading(true);
    setError(null);
    setHasMore(true);
    try {
      const data = await fetchPage(0, lang);
      setItems(data.items);
      setHasMore(data.items.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitial(language);
  }, [language, loadInitial]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await fetchPage(items.length, language);
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.url));
        const merged = [...prev];
        for (const row of data.items) {
          if (!seen.has(row.url)) {
            seen.add(row.url);
            merged.push(row);
          }
        }
        return merged;
      });
      setHasMore(data.items.length === PAGE_SIZE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }, [items.length, language, hasMore, loading, loadingMore]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
          </p>
        )}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.url}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {item.social_image_url ? (
              <Link
                href={`/news/${encodeNewsUrl(item.url)}`}
                className="relative aspect-[16/10] w-full shrink-0 bg-gray-100"
              >
                <Image
                  src={item.social_image_url}
                  alt={item.title ? item.title : "Article thumbnail"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </Link>
            ) : (
              <Link
                href={`/news/${encodeNewsUrl(item.url)}`}
                className="relative flex aspect-[16/10] w-full shrink-0 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xs font-medium text-gray-500"
              >
                No thumbnail
              </Link>
            )}

            <div className="flex flex-1 flex-col p-4">
              <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-900">
                <Link
                  href={`/news/${encodeNewsUrl(item.url)}`}
                  className="hover:text-blue-700 hover:underline"
                >
                  {item.title || item.url}
                </Link>
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {item.domain || "unknown-domain"}
                {" • "}
                {item.language || "unknown-language"}
                {" • "}
                {item.source_country || "unknown-country"}
              </p>
              <div className="mt-auto space-y-1 pt-3 text-xs text-gray-500">
                {item.seen_at ? (
                  <p>
                    <span className="font-medium text-gray-600">Seen: </span>
                    {new Date(item.seen_at).toLocaleString()}
                  </p>
                ) : null}
                {item.created_at ? (
                  <p>
                    <span className="font-medium text-gray-600">Recorded: </span>
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
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
