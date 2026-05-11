export type TopicFilter = { label: string; slug: string; icon: string };

export const TOPIC_FILTERS: TopicFilter[] = [
  { label: "Nature", slug: "nature", icon: "🌿" },
  { label: "World", slug: "world", icon: "🌍" },
  { label: "Science", slug: "science", icon: "🔬" },
];

export function isAllowedTopic(slug: string): boolean {
  return TOPIC_FILTERS.some((t) => t.slug === slug);
}
