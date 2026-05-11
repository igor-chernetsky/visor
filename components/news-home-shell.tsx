"use client";

import { DigestPanel } from "@/components/digest-panel";
import { NewsInfiniteFeed } from "@/components/news-infinite-feed";

export function NewsHomeShell() {
  return (
    <main className="animated-page-bg mx-auto flex h-screen w-full max-w-[1800px] flex-col px-4 py-4 sm:px-6 xl:px-8 2xl:px-10">
      <header className="sticky top-0 z-20 mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-sky-50/70 px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-900">News!</h1>
            <p className="text-sm text-slate-600">Latest normalized English news from your API.</p>
          </div>
        </div>
      </header>

      <section className="scroll-animated-container flex-1 overflow-y-auto pb-8">
        <DigestPanel />
        <NewsInfiniteFeed />
      </section>
    </main>
  );
}
