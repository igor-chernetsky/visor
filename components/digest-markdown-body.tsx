"use client";

import ReactMarkdown from "react-markdown";

export function DigestMarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div className="digest-markdown max-w-none text-sm leading-relaxed sm:text-base">
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
    </div>
  );
}
