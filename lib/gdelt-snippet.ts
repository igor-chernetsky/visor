/**
 * GDELT Doc API article objects vary by mode/version; try common text fields.
 * Full HTML article body is not stored unless a provider field included it.
 */
const TEXT_KEYS = [
  "description",
  "Description",
  "excerpt",
  "Excerpt",
  "snippet",
  "Snippet",
  "summary",
  "Summary",
  "quote",
  "Quote",
  "context",
  "Context",
  "body",
  "Body",
  "text",
  "Text",
  "content",
  "Content",
] as const;

export function excerptFromGdeltSnippet(
  snippet: Record<string, unknown> | null | undefined,
): string | null {
  if (!snippet || typeof snippet !== "object") return null;
  for (const key of TEXT_KEYS) {
    const v = snippet[key];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.trim();
    }
  }
  return null;
}
