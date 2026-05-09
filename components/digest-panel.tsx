"use client";

import ReactMarkdown from "react-markdown";
import { useCallback, useEffect, useState } from "react";

import { DigestCalendar } from "@/components/digest-calendar";

type DigestListResponse = { dates: string[] };

type ImageSlot = { slot: number; article_id: number | null; url: string | null };

type DigestDetail = {
  digest_date: string;
  title: string | null;
  body_markdown: string;
  meta: { image_slots?: ImageSlot[] } | null;
  created_at?: string | null;
};

function injectDigestImages(md: string, meta: DigestDetail["meta"]): string {
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
  return out.replace(/\[DIGEST_IMAGE_[1-9]\]/g, "").replace(/\[DIGEST_IMAGE_1[0-9]\]/g, "");
}

export function DigestPanel() {
  const [dates, setDates] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [digest, setDigest] = useState<DigestDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      setError(null);
      try {
        const res = await fetch("/api/digests", { cache: "default" });
        if (!res.ok) {
          throw new Error(`Digests list ${res.status}`);
        }
        const data = (await res.json()) as DigestListResponse;
        const list = Array.isArray(data.dates) ? data.dates : [];
        if (cancelled) return;
        setDates(list);
        setSelected((prev) => {
          if (!list.length) return null;
          if (prev && list.includes(prev)) return prev;
          return list[0] ?? null;
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load digests");
          setDates([]);
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadDigest = useCallback(async (iso: string) => {
    setLoadingDigest(true);
    setError(null);
    try {
      const res = await fetch(`/api/digests/by-date?date=${encodeURIComponent(iso)}`, {
        cache: "default",
      });
      if (res.status === 404) {
        setDigest(null);
        return;
      }
      if (!res.ok) {
        throw new Error(`Digest ${res.status}`);
      }
      const data = (await res.json()) as DigestDetail;
      setDigest(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load digest");
      setDigest(null);
    } finally {
      setLoadingDigest(false);
    }
  }, []);

  useEffect(() => {
    if (!selected) {
      setDigest(null);
      return;
    }
    void loadDigest(selected);
  }, [selected, loadDigest]);

  if (loadingList) {
    return (
      <div className="mb-6 rounded-xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600">
        Loading digest…
      </div>
    );
  }

  if (!dates.length) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-sm text-slate-600">
        No daily digest yet. Run{" "}
        <code className="rounded bg-slate-100 px-1">build_daily_digest_deepseek.py</code> after
        news are in the database.
      </div>
    );
  }

  const markdown = digest
    ? injectDigestImages(digest.body_markdown, digest.meta)
    : "";

  return (
    <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1 rounded-xl border border-slate-200/90 bg-white/95 p-5 shadow-sm">
        {error ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {error}
          </p>
        ) : null}
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            {digest?.title ?? "Daily digest"}
          </h2>
          {selected ? (
            <span className="text-xs font-medium text-slate-500">{selected} UTC</span>
          ) : null}
        </div>
        {loadingDigest ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : digest ? (
          <article className="digest-markdown max-w-none text-sm leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-3 text-2xl font-bold text-slate-900">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-6 text-lg font-semibold text-slate-900">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="mb-3 text-slate-700 [&:empty]:hidden">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="mb-3 list-inside list-disc space-y-1 text-slate-700">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-3 list-inside list-decimal space-y-1 text-slate-700">{children}</ol>
                ),
                li: ({ children }) => <li className="ms-1">{children}</li>,
                img: ({ src, alt }) => (
                  <img
                    src={src ?? ""}
                    alt={alt ?? "Digest"}
                    className="my-4 max-h-72 w-full rounded-lg object-cover shadow-sm"
                    loading="lazy"
                  />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </article>
        ) : (
          <p className="text-sm text-slate-500">Select a highlighted date.</p>
        )}
      </div>
      <aside className="w-full shrink-0 lg:w-72">
        <DigestCalendar
          availableDates={dates}
          selectedDate={selected}
          onSelectDate={setSelected}
        />
      </aside>
    </div>
  );
}
