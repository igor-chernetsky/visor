export type DigestImageSlot = {
  slot: number;
  article_id: number | null;
  url: string | null;
};

export type DigestMeta = { image_slots?: DigestImageSlot[] } | null;

export function injectDigestImages(md: string, meta: DigestMeta): string {
  let out = md;
  const slots = meta?.image_slots ?? [];
  for (const s of slots) {
    if (!s?.url?.trim()) continue;
    const ph = `[DIGEST_IMAGE_${s.slot}]`;
    const block = `\n\n![Digest illustration](${s.url.trim()})\n\n`;
    if (out.includes(ph)) {
      out = out.split(ph).join(block);
    }
  }
  return out
    .replace(/\[DIGEST_IMAGE_[1-9]\]/g, "")
    .replace(/\[DIGEST_IMAGE_1[0-9]\]/g, "");
}

/** Short plain-text blurb for home teaser (no markdown rendered). */
export function digestPlainExcerpt(md: string, maxLen = 220): string {
  let t = md
    .replace(/^#[^\n]+\n+/gm, "")
    .replace(/\[DIGEST_IMAGE_\d\]/g, "")
    .replace(/!?\[([^\]]*)]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
  const firstPara = t.split(/\n\n+/).find((p) => p.trim().length > 0) ?? t;
  const oneLine = firstPara.replace(/\n/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen - 1).trimEnd()}…`;
}

export function firstDigestImageUrl(meta: DigestMeta): string | null {
  for (const s of meta?.image_slots ?? []) {
    const u = s?.url?.trim();
    if (u) return u;
  }
  return null;
}
