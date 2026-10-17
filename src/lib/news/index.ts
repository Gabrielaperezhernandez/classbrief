// Finds recent news for one topic from all sources in sources.ts.
// Server-only: it uses GUARDIAN_API_KEY, which must never reach the browser.
// We keep only headline, short snippet, date and link (never full articles).

import { SOURCES, type Source } from "./sources";

export type Article = {
  title: string;
  url: string;
  snippet: string;
  publishedAt: string; // ISO date
  source: string; // source name, e.g. "The Guardian"
};

const CACHE_SECONDS = 60 * 60; // reuse results for 1 hour (fast pages, low API use)
const MAX_ARTICLES = 5;
const SNIPPET_LENGTH = 200;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // only news from the last 30 days

// Common words that don't help matching a topic to a headline.
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "into", "about", "over", "that", "this",
  "new", "news", "what", "how", "why", "are", "was", "its", "his", "her", "their",
]);

// Removes HTML tags and entities, collapses spaces and shortens the text.
function cleanText(html: string, maxLength = SNIPPET_LENGTH): string {
  const text = html
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1).trimEnd() + "…" : text;
}

// Splits a topic like "EU air quality rules" into useful words: ["eu", "air", "quality", "rules"].
function keywords(topic: string): string[] {
  return topic
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
}

// Downloads a URL through Next's cache, giving up after 5 seconds (some feeds are slow).
function cachedFetch(url: string, headers?: Record<string, string>) {
  return fetch(url, {
    cache: "force-cache",
    next: { revalidate: CACHE_SECONDS },
    signal: AbortSignal.timeout(5000),
    headers,
  });
}

// One Guardian search. `precise` = only headline + summary, newest first;
// otherwise the whole article text, most relevant first.
async function guardianSearch(source: Source, words: string[], apiKey: string, precise: boolean) {
  const fromDate = new Date(Date.now() - WINDOW_MS).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    q: words.join(" AND "), // every word must appear
    "from-date": fromDate, // last 30 days only
    "order-by": precise ? "newest" : "relevance",
    "page-size": String(MAX_ARTICLES),
    "show-fields": "trailText",
    "api-key": apiKey,
  });
  if (precise) params.set("query-fields", "headline,trailText");

  const res = await cachedFetch(`${source.url}?${params}`);
  if (!res.ok) return [];

  const data = await res.json();
  type GuardianResult = {
    webTitle: string;
    webUrl: string;
    webPublicationDate: string;
    fields?: { trailText?: string };
  };
  return (data.response?.results ?? []).map(
    (r: GuardianResult): Article => ({
      title: r.webTitle,
      url: r.webUrl,
      snippet: cleanText(r.fields?.trailText ?? ""),
      publishedAt: r.webPublicationDate,
      source: source.name,
    }),
  );
}

// Guardian: precise search first; if it finds fewer than 3, add the closest wider matches.
async function fromGuardian(source: Source, topic: string): Promise<Article[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  const words = keywords(topic);
  if (!apiKey || words.length === 0) return [];

  const precise = await guardianSearch(source, words, apiKey, true);
  if (precise.length >= 3) return precise;
  const wider = await guardianSearch(source, words, apiKey, false);
  return [...precise, ...wider];
}

// Reads one tag (e.g. <title>) from an RSS <item>.
function tag(item: string, name: string): string {
  const match = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? match[1] : "";
}

// RSS feeds: download the latest items and keep those that mention every topic keyword.
async function fromRss(source: Source, topic: string): Promise<Article[]> {
  const words = keywords(topic);
  if (words.length === 0) return [];

  const res = await cachedFetch(source.url, { "User-Agent": "ClassBrief/1.0 (student project)" });
  if (!res.ok) return [];

  const xml = await res.text();
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];

  return items
    .map((item) => {
      const title = cleanText(tag(item, "title"), 300);
      const snippet = cleanText(tag(item, "description"));
      // Feeds name the date differently (e.g. the Council of the EU uses <a10:updated>).
      const rawDate = tag(item, "pubDate") || tag(item, "a10:updated") || tag(item, "dc:date");
      const date = new Date(cleanText(rawDate));
      return {
        title,
        url: cleanText(tag(item, "link"), 500),
        snippet,
        publishedAt: isNaN(date.getTime()) ? "" : date.toISOString(),
        source: source.name,
      };
    })
    .filter((a) => {
      if (!a.title || !a.url.startsWith("http")) return false;
      // Same window as the Guardian search: last 30 days only (some feeds keep years of items).
      if (!a.publishedAt || Date.now() - Date.parse(a.publishedAt) > WINDOW_MS) {
        return false;
      }
      const text = `${a.title} ${a.snippet}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
}

// Main function: news for one topic, newest first, from all sources.
// A source that fails or is slow is skipped, so the page never breaks.
export async function getNewsForTopic(topic: string): Promise<Article[]> {
  const results = await Promise.allSettled(
    SOURCES.map((s) => (s.kind === "guardian" ? fromGuardian(s, topic) : fromRss(s, topic))),
  );

  const seen = new Set<string>();
  return results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((a) => !seen.has(a.url) && seen.add(a.url))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_ARTICLES);
}
