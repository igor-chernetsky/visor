import Link from "next/link";

import { encodeNewsUrl, fetchNews } from "@/lib/news-api";

export default async function Home() {
  const news = await fetchNews({ limit: 50 });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold">News</h1>
      <p className="mb-8 text-sm text-gray-600">
        Latest normalized news from your API.
      </p>

      <div className="space-y-4">
        {news.items.map((item) => (
          <article
            key={item.url}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-semibold">
              <Link
                href={`/news/${encodeNewsUrl(item.url)}`}
                className="text-blue-700 hover:underline"
              >
                {item.title || item.url}
              </Link>
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {item.domain || "unknown-domain"}
              {" • "}
              {item.language || "unknown-language"}
              {" • "}
              {item.source_country || "unknown-country"}
            </p>
            {item.seen_at ? (
              <p className="mt-1 text-xs text-gray-500">
                Seen at: {new Date(item.seen_at).toLocaleString()}
              </p>
            ) : null}
          </article>
        ))}

        {news.items.length === 0 ? (
          <p className="text-gray-600">No news found yet.</p>
        ) : null}
      </div>
    </main>
  );
}
