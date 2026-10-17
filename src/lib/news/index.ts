// Finds recent news for one topic from all sources in sources.ts.
// Server-only: it uses GUARDIAN_API_KEY, which must never reach the browser.
//
// How the search works:
// - The Guardian has a search engine (Content API) that searches whole articles.
// - The other newspapers publish RSS feeds per section. We read all of them and search
//   everything each feed provides: headline, summary, the paper's own topic tags and,
//   where the feed includes it, the article text. That text is only used for matching;
//   we only ever SHOW the headline, a short snippet, the date and a link.
// - Each article gets a relevance score: specific (rarer) topic words count more than
//   common ones, and a match in the headline counts more than one in the body.

import { SOURCES, type AccessType, type Source } from "./sources";

export type Article = {
  title: string;
  url: string;
  snippet: string;
  publishedAt: string; // ISO date
  source: string; // source name, e.g. "The Guardian"
  accessType: AccessType; // "subscription" = the article is behind a paywall
};

// An RSS article plus the extra text we search but never show.
type FeedItem = Article & { tags: string; body: string };

const CACHE_SECONDS = 60 * 60; // feeds and searches are reused for 1 hour
const SNIPPET_LENGTH = 200;
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // only news from the last 30 days
const MIN_COVERAGE = 0.7; // share of the topic's (weighted) words an article must contain
const MAX_RESULTS = 40; // best matches handed to the story grouping

// Field weights: where a topic word is found matters.
const WEIGHT = { title: 3, tags: 2, snippet: 1.5, body: 1 } as const;

// Common words that say nothing about a topic.
const STOPWORDS = new Set([
  "the", "and", "for", "with", "from", "into", "about", "over", "that", "this", "new",
  "news", "what", "how", "why", "are", "was", "its", "his", "her", "their", "in", "of",
  "on", "to", "a", "an", "at", "by", "or", "is", "be",
]);

// Removes HTML tags and entities, collapses spaces and shortens the text.
function cleanText(html: string, maxLength = SNIPPET_LENGTH): string {
  const text = html
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/\uFEFF/g, "") // invisible "byte order mark" some feeds include
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    // Numeric character codes, e.g. &#x2019; (’) or &#8217; (’).
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength - 1).trimEnd() + "…" : text;
}

// Makes a word safe to use inside a regular expression.
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Other ways newspapers write the same short words (e.g. the NYT writes "A.I.").
const VARIANTS: Record<string, string[]> = {
  ai: ["ai", "a.i.", "artificial intelligence"],
  eu: ["eu", "e.u.", "european union", "brussels"],
  uk: ["uk", "u.k.", "britain", "british"],
  us: ["us", "u.s.", "united states", "america"],
  un: ["un", "u.n.", "united nations"],
};

// The pattern for one topic word.
// - Short words (3 letters or less, like "ai" or "eu") must be a whole word, or one of
//   their VARIANTS, so "ai" doesn't match "aircraft".
// - Longer words match the start of a word: "iran" is found in "Iranian" but not in
//   "Tirana"; "tariff" is found in "tariffs".
const patterns = new Map<string, RegExp>();
function wordPattern(word: string): RegExp {
  let re = patterns.get(word);
  if (!re) {
    const forms = (VARIANTS[word] ?? [word]).map(escapeRegExp).join("|");
    re =
      word.length <= 3
        ? new RegExp(`(^|[^\\p{L}\\p{N}])(${forms})s?(?![\\p{L}\\p{N}])`, "u")
        : new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(word)}`, "u");
    patterns.set(word, re);
  }
  return re;
}

function startsWord(word: string, text: string): boolean {
  return wordPattern(word).test(text.toLowerCase());
}

// "Tariffs" -> "tariff", so a topic in plural also finds singular mentions.
function singular(word: string): string {
  return word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

// Splits a topic like "EU air quality rules" into useful words: ["eu", "air", "quality", "rule"].
function keywords(topic: string): string[] {
  const words = topic
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w))
    .map(singular);
  return [...new Set(words)];
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

// ---------------------------------------------------------------------------
// The Guardian: search engine over whole articles.

async function guardianSearch(source: Source, words: string[], apiKey: string, precise: boolean) {
  const fromDate = new Date(Date.now() - WINDOW_MS).toISOString().slice(0, 10);
  const params = new URLSearchParams({
    q: words.join(" AND "), // every word must appear
    "from-date": fromDate,
    "order-by": precise ? "newest" : "relevance",
    "page-size": "10",
    "show-fields": "trailText",
    "api-key": apiKey,
  });
  // Precise = only headline and summary; otherwise the whole article text.
  if (precise) params.set("query-fields", "headline,trailText");

  const res = await cachedFetch(`${source.feeds[0]}?${params}`);
  if (!res.ok) return [] as Article[];

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
      accessType: source.access_type,
    }),
  ) as Article[];
}

async function fromGuardian(source: Source, words: string[]): Promise<Article[]> {
  const apiKey = process.env.GUARDIAN_API_KEY;
  if (!apiKey || words.length === 0) return [];
  const [precise, wider] = await Promise.all([
    guardianSearch(source, words, apiKey, true),
    guardianSearch(source, words, apiKey, false),
  ]);
  // Whole-text results must mention at least half of the topic words in the headline or summary.
  const relevantWider = wider.filter(
    (a) => words.filter((w) => startsWord(w, `${a.title} ${a.snippet}`)).length >= words.length / 2,
  );
  return [...precise, ...relevantWider];
}

// ---------------------------------------------------------------------------
// RSS feeds: read every section feed of a newspaper.

// Reads one tag (e.g. <title>) from an RSS <item>; `all` joins every occurrence.
function tag(item: string, name: string, all = false): string {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "gi");
  const matches = [...item.matchAll(re)].map((m) => m[1]);
  return all ? matches.join(" ") : (matches[0] ?? "");
}

function parseFeed(xml: string, source: Source): FeedItem[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.map((item) => {
    // Feeds name the date differently (e.g. the Council of the EU uses <a10:updated>).
    const rawDate = tag(item, "pubDate") || tag(item, "a10:updated") || tag(item, "dc:date");
    const date = new Date(cleanText(rawDate));
    return {
      title: cleanText(tag(item, "title"), 300),
      url: cleanText(tag(item, "link"), 500),
      snippet: cleanText(tag(item, "description")),
      publishedAt: isNaN(date.getTime()) ? "" : date.toISOString(),
      source: source.name,
      accessType: source.access_type,
      // Searched, never shown:
      tags: cleanText(`${tag(item, "category", true)} ${tag(item, "media:keywords")}`, 1000),
      body: cleanText(
        `${tag(item, "description")} ${tag(item, "media:description")} ${tag(item, "content:encoded")}`,
        6000,
      ),
    };
  });
}

// All recent articles of one newspaper (all its section feeds), without duplicates.
// Kept in memory for 15 minutes so several topics don't re-read the same feeds.
const feedMemory = new Map<string, { at: number; items: Promise<FeedItem[]> }>();

function loadSource(source: Source): Promise<FeedItem[]> {
  const cached = feedMemory.get(source.id);
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) return cached.items;

  const items = Promise.allSettled(
    source.feeds.map(async (url) => {
      const res = await cachedFetch(url, { "User-Agent": "ClassBrief/1.0 (student project)" });
      return res.ok ? parseFeed(await res.text(), source) : [];
    }),
  ).then((results) => {
    const seen = new Set<string>();
    return results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((a) => a.title && a.url.startsWith("http") && a.publishedAt)
      .filter((a) => Date.now() - Date.parse(a.publishedAt) <= WINDOW_MS)
      .filter((a) => !seen.has(a.url) && seen.add(a.url));
  });
  feedMemory.set(source.id, { at: Date.now(), items });
  return items;
}

// Relevance of one article for the topic words (0 = no match). `rarity` gives each word
// a weight: words found in few articles (e.g. "quality") count more than common ones ("eu").
function score(item: FeedItem, words: string[], rarity: Map<string, number>): number {
  let found = 0;
  let total = 0;
  let points = 0;
  let visible = false; // at least one word in the headline, tags or summary
  for (const w of words) {
    const weight = rarity.get(w) ?? 1;
    total += weight;
    const where = startsWord(w, item.title)
      ? WEIGHT.title
      : startsWord(w, item.tags)
        ? WEIGHT.tags
        : startsWord(w, item.snippet)
          ? WEIGHT.snippet
          : startsWord(w, item.body)
            ? WEIGHT.body
            : 0;
    if (where > 0) {
      found += weight;
      points += weight * where;
      if (where > WEIGHT.body) visible = true;
    }
  }
  return visible && found / total >= MIN_COVERAGE ? points : 0;
}

// ---------------------------------------------------------------------------

// The most relevant recent articles for one topic from all sources, without duplicates.
// A source that fails or is slow is skipped, so the page never breaks.
export async function collectArticles(topic: string): Promise<Article[]> {
  const words = keywords(topic);
  if (words.length === 0) return [];

  const guardian = SOURCES.find((s) => s.kind === "guardian")!;
  const [guardianResults, ...feeds] = await Promise.all([
    fromGuardian(guardian, words).catch(() => [] as Article[]),
    ...SOURCES.filter((s) => s.kind === "rss").map((s) => loadSource(s).catch(() => [] as FeedItem[])),
  ]);
  const all = feeds.flat();

  // How rare each topic word is across today's articles (rarer = more important).
  const rarity = new Map(
    words.map((w) => {
      const containing = all.filter((a) => startsWord(w, `${a.title} ${a.tags} ${a.body}`)).length;
      return [w, Math.log((all.length + 1) / (containing + 1)) + 1];
    }),
  );

  const matches = all
    .map((item) => ({ item, points: score(item, words, rarity) }))
    .filter((m) => m.points > 0)
    .sort((a, b) => b.points - a.points || b.item.publishedAt.localeCompare(a.item.publishedAt))
    .slice(0, MAX_RESULTS)
    // Only show public fields: headline, snippet, date, link, source.
    .map(({ item }) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet,
      publishedAt: item.publishedAt,
      source: item.source,
      accessType: item.accessType,
    }));

  const seen = new Set<string>();
  return [...guardianResults, ...matches].filter((a) => !seen.has(a.url) && seen.add(a.url));
}
