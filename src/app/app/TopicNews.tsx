"use client";

// Shows the latest headlines for one topic (loaded from /api/news after the topic appears).
import { useEffect, useState } from "react";
import type { Article } from "@/lib/news";

type State = { status: "loading" } | { status: "done"; articles: Article[] } | { status: "error" };

export default function TopicNews({ topic }: { topic: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

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
    <ul className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      {state.articles.map((article) => (
        <li key={article.url}>
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
        </li>
      ))}
    </ul>
  );
}
