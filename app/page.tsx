import { NewsInfiniteFeed } from "@/components/news-infinite-feed";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-3xl font-bold">News!</h1>
      <p className="mb-8 text-sm text-gray-600">
        Latest normalized news from your API. Scroll down to load more.
      </p>

      <NewsInfiniteFeed />
    </main>
  );
}
