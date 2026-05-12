"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { DigestCalendar } from "@/components/digest-calendar";
import { digestPlainExcerpt, firstDigestImageUrl } from "@/lib/digest-utils";

type DigestListResponse = { dates: string[] };

type ImageSlot = { slot: number; article_id: number | null; url: string | null };

type DigestDetail = {
  digest_date: string;
  title: string | null;
  body_markdown: string;
  meta: { image_slots?: ImageSlot[] } | null;
  created_at?: string | null;
};

export function DigestPanel() {
  const [dates, setDates] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [digest, setDigest] = useState<DigestDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teaserImageBroken, setTeaserImageBroken] = useState(false);

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
        const todayUtc = new Date().toISOString().slice(0, 10);
        setSelected((prev) => {
          if (!list.length) return null;
          if (prev && list.includes(prev)) return prev;
          if (list.includes(todayUtc)) return todayUtc;
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
    setTeaserImageBroken(false);
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

  const remoteThumb = digest ? (firstDigestImageUrl(digest.meta) ?? "").trim() : "";
  const thumbSrc =
    remoteThumb && !teaserImageBroken ? remoteThumb : "/th-all.png";
  const thumbAlt = digest?.title
    ? remoteThumb && !teaserImageBroken
      ? digest.title
      : `${digest.title} — default illustration`
    : remoteThumb && !teaserImageBroken
      ? "Digest illustration"
      : "Default illustration";

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <div className="flex h-full min-h-0 flex-col gap-3 lg:col-span-2 xl:col-span-3 2xl:col-span-4">
          {error ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {error}
            </p>
          ) : null}

          {loadingDigest ? (
            <div className="flex min-h-[12rem] flex-1 rounded-xl border border-slate-200/90 bg-white/95 p-6 text-sm text-slate-500 shadow-sm sm:min-h-0">
              Loading…
            </div>
          ) : digest && selected ? (
            <Link
              href={`/digest/${selected}`}
              className="group flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md lg:flex-row lg:items-stretch"
            >
              <div className="relative aspect-[16/10] w-full shrink-0 bg-emerald-50/50 lg:aspect-auto lg:h-auto lg:w-52 lg:min-h-0 lg:self-stretch">
                <Image
                  src={thumbSrc}
                  alt={thumbAlt}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 208px"
                  className="object-cover"
                  unoptimized={Boolean(remoteThumb) && !teaserImageBroken}
                  onError={() => {
                    if (!remoteThumb || teaserImageBroken) return;
                    setTeaserImageBroken(true);
                  }}
                />
              </div>
              <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
                <p className="text-xs font-medium text-slate-500">{selected} UTC</p>
                <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-gray-900 sm:text-lg">
                  <span className="group-hover:text-blue-700 group-hover:underline">
                    {digest.title?.trim() || "Daily digest"}
                  </span>
                </h2>
                {(() => {
                  const excerpt = digestPlainExcerpt(digest.body_markdown, 560);
                  return excerpt ? (
                    <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-gray-700 sm:line-clamp-6 lg:line-clamp-8 lg:text-base">
                      {excerpt}
                    </p>
                  ) : null;
                })()}
                <p className="mt-auto pt-3 text-sm font-medium text-emerald-700 decoration-emerald-300 underline-offset-2 group-hover:underline">
                  Read full digest →
                </p>
              </div>
            </Link>
          ) : (
            <p className="rounded-xl border border-slate-200/90 bg-white/95 p-6 text-sm text-slate-500 shadow-sm">
              Select a highlighted date.
            </p>
          )}
        </div>

        <aside className="flex h-full min-h-0 min-w-0 flex-col">
          <DigestCalendar
            availableDates={dates}
            selectedDate={selected}
            onSelectDate={setSelected}
          />
        </aside>
      </div>
    </div>
  );
}
