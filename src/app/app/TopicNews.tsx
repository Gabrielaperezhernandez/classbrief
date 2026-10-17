"use client";

// Shows the latest headlines for one topic (loaded from /api/news after the topic appears),
// plus an optional AI summary of those headlines (from /api/summary, only when the user asks).
import { useEffect, useState } from "react";
import type { Article } from "@/lib/news";
import type { Summary, SummaryPoint } from "@/lib/summary";

type State = { status: "loading" } | { status: "done"; articles: Article[] } | { status: "error" };
type SummaryState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; summary: Summary }
  | { status: "error"; message: string };

export default function TopicNews({ topic }: { topic: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [summary, setSummary] = useState<SummaryState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/news?topic=${encodeURIComponent(topic)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => !cancelled && setState({ status: "done", articles: data.articles ?? [] }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [topic]);

  async function summarise() {
    setSummary({ status: "loading" });
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSummary({ status: "error", message: data.error ?? "Something went wrong." });
        return;
      }
      // Show the exact headlines the summary used, so citation numbers match.
      setState({ status: "done", articles: data.articles });
      setSummary({ status: "done", summary: data.summary });
    } catch {
      setSummary({ status: "error", message: "Something went wrong. Please try again." });
    }
  }

  if (state.status === "loading") {
    return <p className="mt-3 text-sm text-slate-600">Looking for recent news…</p>;
  }
  if (state.status === "error") {
    return <p className="mt-3 text-sm text-slate-600">Couldn&apos;t load news right now. Try again later.</p>;
  }
  if (state.articles.length === 0) {
    return (
      <p className="mt-3 text-sm text-slate-600">
        No recent news yet. Try a broader topic, like &ldquo;air pollution&rdquo;.
      </p>
    );
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {summary.status === "idle" && (
        <button
          type="button"
          onClick={summarise}
          className="rounded-md border border-blue-700 px-3 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-50"
        >
          Summarise with AI
        </button>
      )}
      {summary.status === "loading" && (
        <p className="text-sm text-slate-600" role="status">
          Writing a summary of these headlines…
        </p>
      )}
      {summary.status === "error" && (
        <p role="alert" className="text-sm text-red-800">
          {summary.message}
        </p>
      )}
      {summary.status === "done" && <SummaryBox summary={summary.summary} />}

      <ol className="mt-3 space-y-3">
        {state.articles.map((article, i) => (
          <li key={article.url} className="flex gap-2">
            <span className="text-sm font-semibold text-slate-500">[{i + 1}]</span>
            <div className="min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-800 underline-offset-2 hover:underline"
              >
                {article.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <p className="mt-0.5 text-xs text-slate-600">
                {article.source}
                {article.publishedAt &&
                  ` · ${new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
              </p>
              {article.snippet && <p className="mt-1 text-sm text-slate-700">{article.snippet}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The AI summary, clearly labelled as AI-generated, with [n] citations to the headlines below.
function SummaryBox({ summary }: { summary: Summary }) {
  const line = (p: SummaryPoint, i: number) => (
    <li key={i}>
      {p.text}{" "}
      {p.sources.length > 0 && (
        <span className="text-xs font-semibold text-slate-500">
          {p.sources.map((n) => `[${n}]`).join(" ")}
        </span>
      )}
    </li>
  );

  return (
    <section aria-label="AI-generated summary" className="rounded-md bg-blue-50 p-3 text-sm text-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-900">
        AI-generated summary · based only on the headlines below · may contain mistakes
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5">{summary.points.map(line)}</ul>
      {summary.differences.length > 0 && (
        <>
          <p className="mt-3 font-semibold text-slate-900">How the coverage differs</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">{summary.differences.map(line)}</ul>
        </>
      )}
    </section>
  );
}
