"use client";

import { useCallback, useEffect, useState } from "react";

import { DigestPanel } from "@/components/digest-panel";
import { NewsInfiniteFeed } from "@/components/news-infinite-feed";

function pillClass(active: boolean): string {
  return `rounded-full border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
    active
      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
      : "border-emerald-200 bg-white/80 text-slate-700 hover:bg-emerald-50/70"
  }`;
}

export function NewsHomeShell() {
  const [rssLabel, setRssLabel] = useState("");
  const [rssOptions, setRssOptions] = useState<string[]>([]);

  const loadRssLabels = useCallback(async () => {
    try {
      const res = await fetch("/api/news/rss-labels", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { labels?: string[] };
      const list = Array.isArray(data.labels) ? data.labels : [];
      setRssOptions(list);
    } catch {
      setRssOptions([]);
    }
  }, []);

  useEffect(() => {
    void loadRssLabels();
  }, [loadRssLabels]);

  return (
    <main className="animated-page-bg mx-auto flex h-screen w-full max-w-[1800px] flex-col px-4 py-4 sm:px-6 xl:px-8 2xl:px-10">
      <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-sky-50/70 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">News!</h1>
              <p className="text-sm text-slate-600">Latest normalized English news from your API.</p>
            </div>
          </div>
          {rssOptions.length > 0 ? (
            <div className="flex flex-col gap-2 border-t border-emerald-100/80 pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">RSS source</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRssLabel("")}
                  className={pillClass(rssLabel === "")}
                  aria-pressed={rssLabel === ""}
                >
                  All
                </button>
                {rssOptions.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => setRssLabel(slug)}
                    className={pillClass(rssLabel === slug)}
                    aria-pressed={rssLabel === slug}
                  >
                    {slug}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <section className="scroll-animated-container flex-1 overflow-y-auto pb-8">
        <DigestPanel />
        <NewsInfiniteFeed rssLabel={rssLabel} />
      </section>
    </main>
  );
}
