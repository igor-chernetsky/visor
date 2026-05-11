import { notFound } from "next/navigation";

import { NewsHomeShell } from "@/components/news-home-shell";
import { isAllowedTopic } from "@/lib/news-topics";

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
