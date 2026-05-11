import { notFound } from "next/navigation";

import { NewsHomeShell, isAllowedTopic } from "@/components/news-home-shell";

type PageProps = {
  params: Promise<{ topic: string }>;
};

export default async function CategoryPage({ params }: PageProps) {
  const { topic } = await params;
  const slug = topic.trim().toLowerCase();

  if (!isAllowedTopic(slug)) {
    notFound();
  }

  return <NewsHomeShell topic={slug} showDigest={false} />;
}
