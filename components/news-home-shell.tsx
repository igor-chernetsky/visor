"use client";

import { useRouter } from "next/navigation";

import { DigestPanel } from "@/components/digest-panel";
import { NewsInfiniteFeed } from "@/components/news-infinite-feed";
import { TOPIC_FILTERS } from "@/lib/news-topics";

export function NewsHomeShell({
  topic,
  showDigest,
}: {
  topic: string;
  showDigest: boolean;
}) {
  const router = useRouter();

  return (
    <main className="animated-page-bg mx-auto flex h-screen w-full max-w-[1800px] flex-col px-4 py-4 sm:px-6 xl:px-8 2xl:px-10">
      <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-sky-50/70 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">News!</h1>
            <p className="text-sm text-slate-600">Latest normalized English news from your API.</p>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 sm:mt-0">
            <button
              type="button"
              onClick={() => router.push("/")}
              aria-label="All topics"
              title="All topics"
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                topic === ""
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50/70"
              }`}
            >
              🧭
            </button>
            {TOPIC_FILTERS.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => router.push(`/category/${t.slug}`)}
                aria-label={t.label}
                title={t.label}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  topic === t.slug
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50/70"
                }`}
              >
                {t.icon}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="scroll-animated-container flex-1 overflow-y-auto pb-8">
        {showDigest ? <DigestPanel /> : null}
        <NewsInfiniteFeed topic={topic} />
      </section>
    </main>
  );
}
