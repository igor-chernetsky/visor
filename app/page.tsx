import { NewsInfiniteFeed } from "@/components/news-infinite-feed";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1800px] px-4 py-8 sm:px-6 xl:px-8 2xl:px-10">
      <div className="mb-8 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-teal-50/60 to-sky-50/70 px-5 py-5 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900">News!</h1>
        <p className="text-sm text-slate-600">
        Latest normalized news from your API. Scroll down to load more.
        </p>
      </div>

      <NewsInfiniteFeed />
    </main>
  );
}
