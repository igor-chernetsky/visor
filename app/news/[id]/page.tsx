import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { excerptFromGdeltSnippet } from "@/lib/gdelt-snippet";
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

  const excerpt = excerptFromGdeltSnippet(item.gdelt_snippet);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm text-blue-700 hover:underline">
        ← Back to news list
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{item.title || item.url}</h1>

      {item.social_image_url ? (
        <div className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={item.social_image_url}
            alt={item.title ? item.title : "Article image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 48rem"
            unoptimized
          />
        </div>
      ) : null}

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {item.domain ? (
          <p>
            Domain: <strong>{item.domain}</strong>
          </p>
        ) : null}
        {item.language ? (
          <p>
            Language: <strong>{item.language}</strong>
          </p>
        ) : null}
        {item.source_country ? (
          <p>
            Source country: <strong>{item.source_country}</strong>
          </p>
        ) : null}
        {item.seen_at ? (
          <p>
            Seen:{" "}
            <strong>{new Date(item.seen_at).toLocaleString()}</strong>
          </p>
        ) : null}
      </div>

      {excerpt ? (
        <section className="mt-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Excerpt</h2>
          <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {excerpt}
          </p>
        </section>
      ) : (
        <p className="mt-8 text-sm text-gray-600">
          No excerpt is stored for this article. GDELT usually provides metadata
          and sometimes a short description; the full text is on the publisher’s
          site — use the link below.
        </p>
      )}

      <div className="mt-8">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-700 hover:underline"
        >
          Open original article →
        </a>
      </div>
    </main>
  );
}
