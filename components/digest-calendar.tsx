"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  availableDates: string[];
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  className?: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function isoFromYmd(year: number, monthIndex: number, day: number): string {
  return `${year}-${pad2(monthIndex + 1)}-${pad2(day)}`;
}

/** Monday-based weekday index 0..6 for the first of month (0 = Monday). */
function mondayWeekday(year: number, monthIndex: number): number {
  const js = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  return (js + 6) % 7;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function DigestCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  className = "",
}: Props) {
  const available = useMemo(() => new Set(availableDates), [availableDates]);

  const initial = useMemo(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split("-").map(Number);
      if (y && m) return { year: y, monthIndex: m - 1 };
    }
    const now = new Date();
    return { year: now.getUTCFullYear(), monthIndex: now.getUTCMonth() };
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonthIndex, setViewMonthIndex] = useState(initial.monthIndex);

  useEffect(() => {
    if (!selectedDate) return;
    const parts = selectedDate.split("-").map(Number);
    const y = parts[0];
    const m = parts[1];
    if (y && m) {
      setViewYear(y);
      setViewMonthIndex(m - 1);
    }
  }, [selectedDate]);

  const monthLabel = useMemo(
    () =>
      new Date(Date.UTC(viewYear, viewMonthIndex, 1)).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    [viewYear, viewMonthIndex],
  );

  const lead = mondayWeekday(viewYear, viewMonthIndex);
  const dim = daysInMonth(viewYear, viewMonthIndex);
  const cells: ({ day: number } | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push({ day: d });

  return (
    <div
      className={`flex h-full min-h-0 flex-col rounded-xl border border-emerald-100 bg-white/90 p-4 shadow-sm ${className}`}
    >
      <h2 className="mb-3 text-sm font-semibold text-slate-800">Digest calendar</h2>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          aria-label="Previous month"
          onClick={() => {
            if (viewMonthIndex === 0) {
              setViewYear((y) => y - 1);
              setViewMonthIndex(11);
            } else {
              setViewMonthIndex((m) => m - 1);
            }
          }}
        >
          ‹
        </button>
        <span className="text-sm font-medium text-slate-800">{monthLabel}</span>
        <button
          type="button"
          className="rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          aria-label="Next month"
          onClick={() => {
            if (viewMonthIndex === 11) {
              setViewYear((y) => y + 1);
              setViewMonthIndex(0);
            } else {
              setViewMonthIndex((m) => m + 1);
            }
          }}
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 font-medium">
            {w}
          </div>
        ))}
        {cells.map((cell, idx) => {
          if (!cell) {
            return <div key={`e-${idx}`} className="h-9" />;
          }
          const iso = isoFromYmd(viewYear, viewMonthIndex, cell.day);
          const has = available.has(iso);
          const isSel = selectedDate === iso;
          return (
            <button
              key={iso}
              type="button"
              disabled={!has}
              title={has ? `Digest ${iso}` : "No digest"}
              onClick={() => has && onSelectDate(iso)}
              className={`flex h-9 items-center justify-center rounded-lg text-sm transition-colors ${
                !has
                  ? "cursor-default text-slate-300"
                  : isSel
                    ? "bg-emerald-600 font-semibold text-white shadow-sm"
                    : "bg-emerald-100 font-medium text-emerald-900 hover:bg-emerald-200"
              }`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      <p className="mt-auto pt-3 text-xs text-slate-500">
        Highlighted days have a digest. Tap to read.
      </p>
    </div>
  );
}
