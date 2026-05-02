import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchNewsByEncodedUrl } from "@/lib/news-api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function NewsDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const item = await fetchNewsByEncodedUrl(id);

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        ← Back to news list
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{item.title || item.url}</h1>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          Domain: <strong>{item.domain || "unknown"}</strong>
        </p>
        <p>
          Language: <strong>{item.language || "unknown"}</strong>
        </p>
        <p>
          Source country: <strong>{item.source_country || "unknown"}</strong>
        </p>
        <p>
          Seen at:{" "}
          <strong>
            {item.seen_at ? new Date(item.seen_at).toLocaleString() : "unknown"}
          </strong>
        </p>
      </div>

      <div className="mt-6">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 hover:underline"
        >
          Open original article
        </a>
      </div>
    </main>
  );
}
