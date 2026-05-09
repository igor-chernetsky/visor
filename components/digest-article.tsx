"use client";

import { DigestMarkdownBody } from "@/components/digest-markdown-body";
import { injectDigestImages, type DigestMeta } from "@/lib/digest-utils";

export function DigestArticle({
  bodyMarkdown,
  meta,
}: {
  bodyMarkdown: string;
  meta: DigestMeta;
}) {
  const markdown = injectDigestImages(bodyMarkdown, meta);
  return <DigestMarkdownBody markdown={markdown} />;
}
