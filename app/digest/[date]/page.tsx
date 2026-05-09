import Link from "next/link";
import { notFound } from "next/navigation";

import { DigestArticle } from "@/components/digest-article";
import { fetchDigestByDate } from "@/lib/digest-api";

type Props = { params: Promise<{ date: string }> };

export default async function DigestDetailPage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }

  let digest;
  try {
    digest = await fetchDigestByDate(date);
  } catch {
    notFound();
  }
  if (!digest) {
    notFound();
  }

  const title = digest.title?.trim() || `Daily digest · ${digest.digest_date}`;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <p className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
        >
          ← Home
        </Link>
      </p>
      <header className="mb-8 border-b border-slate-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {digest.digest_date} UTC
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
      </header>
      <article className="rounded-xl border border-slate-200/90 bg-white/95 p-5 shadow-sm sm:p-8">
        <DigestArticle bodyMarkdown={digest.body_markdown} meta={digest.meta} />
      </article>
    </main>
  );
}
