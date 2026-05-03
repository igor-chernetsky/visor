import Image from "next/image";
import Link from "next/link";

import { encodeNewsUrl, fetchNews } from "@/lib/news-api";

/** Must be a static literal for Next.js — no env-based `revalidate` export (breaks build). Cache TTL uses `NEWS_FETCH_REVALIDATE_SECONDS` in fetch only. */
export const dynamic = "force-dynamic";

export default async function Home() {
  const news = await fetchNews({ limit: 50 });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold">News!</h1>
      <p className="mb-8 text-sm text-gray-600">
        Latest normalized news from your API.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {news.items.map((item) => (
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
              {item.seen_at ? (
                <p className="mt-auto pt-3 text-xs text-gray-500">
                  {new Date(item.seen_at).toLocaleString()}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      {news.items.length === 0 ? (
        <p className="mt-8 text-gray-600">No news found yet.</p>
      ) : null}
    </main>
  );
}
