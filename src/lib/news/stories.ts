// Groups articles from different newspapers that are about the same story,
// so students can compare coverage instead of reading the same news several times.
// No AI: two articles belong together when their headlines + snippets share enough
// distinctive words (names, places, key terms).

import { collectArticles, type Article } from "./index";

export type Story = {
  articles: Article[]; // newest first; at most one per newspaper
  sources: string[]; // newspaper names, e.g. ["Financial Times", "BBC News"]
  latest: string; // ISO date of the newest article
};

const MAX_STORIES = 6;
const MIN_SHARED_WORDS = 3;
const MIN_OVERLAP = 0.3; // share of the shorter article's words that must match

// Everyday words that say nothing about which story an article is about.
const COMMON = new Set(
  (
    "about above after again against also although among another because been before being " +
    "between both cannot could during each even ever every first from have having here into " +
    "just last latest least like made make many more most much must never news next only other " +
    "over said says same should since some still such than that their them then there these " +
    "they this those though three through under until upon very want week weeks were what when " +
    "where whether which while will with within without would year years your amid back down " +
    "four five people says told time times today live update updates report reports world " +
    "according where after amid day days months month analysis opinion video watch read"
  ).split(" "),
);

// Distinctive words of an article: 4+ letters, not common, not the topic words themselves
// (every article in a topic shares those, so they can't tell stories apart).
function distinctiveWords(article: Article, topicWords: Set<string>): Set<string> {
  const words = `${article.title} ${article.snippet}`
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length >= 4 && !COMMON.has(w))
    .map(singular)
    .filter((w) => !topicWords.has(w));
  return new Set(words);
}

// Treats "houthis" and "houthi", "tariffs" and "tariff" as the same word.
function singular(word: string): string {
  return word.length > 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word;
}

function similar(a: Set<string>, b: Set<string>): boolean {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared++;
  return shared >= MIN_SHARED_WORDS && shared / Math.min(a.size, b.size) >= MIN_OVERLAP;
}

// Recent stories for one topic, the ones covered by the most newspapers first.
export async function getStoriesForTopic(topic: string): Promise<Story[]> {
  const articles = await collectArticles(topic);
  const topicWords = new Set(topic.toLowerCase().split(/[^\p{L}\p{N}]+/u).map(singular));

  // Greedy grouping: each article joins the first group that has a similar article.
  const groups: { article: Article; words: Set<string> }[][] = [];
  for (const article of articles) {
    const words = distinctiveWords(article, topicWords);
    const group = groups.find((g) => g.some((member) => similar(member.words, words)));
    if (group) group.push({ article, words });
    else groups.push([{ article, words }]);
  }

  const stories = groups.map((group) => {
    // Keep one article per newspaper (the newest), so "covered by" counts outlets.
    const seen = new Set<string>();
    const unique = group
      .map((m) => m.article)
      .filter((a) => !seen.has(a.source) && seen.add(a.source));
    return { articles: unique, sources: [...seen], latest: unique[0].publishedAt };
  });

  return stories
    .sort((a, b) => b.sources.length - a.sources.length || b.latest.localeCompare(a.latest))
    .slice(0, MAX_STORIES);
}
