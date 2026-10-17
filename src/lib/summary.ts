// Writes a short AI summary of the headlines for one topic, using Claude.
// Server-only: it uses ANTHROPIC_API_KEY, which must never reach the browser.
// The summary is based ONLY on the headlines and snippets we show, and every
// point cites the article numbers it comes from.

import Anthropic from "@anthropic-ai/sdk";
import { unstable_cache } from "next/cache";
import type { Article } from "@/lib/news";

export type SummaryPoint = { text: string; sources: number[] };
export type Summary = { points: SummaryPoint[]; differences: SummaryPoint[] };

const MODEL = "claude-opus-5-5";

const SYSTEM_PROMPT = `You help university students quickly understand the news behind a topic their course covers.

You receive numbered news items (headline, source, date and a short snippet). Write a brief, neutral summary for a student who has not read them.

Rules:
- Use ONLY the information in the numbered items. Do not add background facts, numbers or names that are not in them. If the items say little, say little.
- "points": 2 to 4 short sentences on what the items report. Each sentence lists the item numbers it is based on in "sources".
- "differences": only when different sources clearly cover the story differently (focus, framing, what they leave out). Otherwise return an empty list. Never label sources as biased, left or right, and never claim any source is "objective".
- If the items are about unrelated stories, summarise the most relevant ones to the topic and ignore the rest.
- Plain English, no jargon, max 30 words per sentence.`;

// JSON shape Claude must return (structured outputs guarantee it matches).
const POINT_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string" },
    sources: { type: "array", items: { type: "integer" } },
  },
  required: ["text", "sources"],
  additionalProperties: false,
};
const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    points: { type: "array", items: POINT_SCHEMA },
    differences: { type: "array", items: POINT_SCHEMA },
  },
  required: ["points", "differences"],
  additionalProperties: false,
};

async function callClaude(topic: string, articles: Article[]): Promise<Summary | null> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  const items = articles
    .map((a, i) => `[${i + 1}] ${a.title}\nSource: ${a.source}, ${a.publishedAt.slice(0, 10)}\n${a.snippet}`)
    .join("\n\n");

  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 4000,
    // If the model declines for policy reasons, Anthropic retries on a recommended fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    // Summaries are a simple task: low effort keeps them fast and cheap.
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: SUMMARY_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Course topic: ${topic}\n\nNews items:\n\n${items}` }],
  });

  if (response.stop_reason === "refusal") return null;
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") return null;

  const parsed = JSON.parse(text.text) as Summary;
  // Keep only citations that point to real items (1..n).
  const valid = (p: SummaryPoint) => ({
    text: p.text,
    sources: p.sources.filter((n) => n >= 1 && n <= articles.length),
  });
  return { points: parsed.points.map(valid), differences: parsed.differences.map(valid) };
}

// Same topic + same headlines = same summary, so reuse it for 6 hours instead of paying again.
export function getSummary(topic: string, articles: Article[]): Promise<Summary | null> {
  const key = [topic.toLowerCase(), ...articles.map((a) => a.url)];
  return unstable_cache(() => callClaude(topic, articles), ["summary", ...key], {
    revalidate: 6 * 60 * 60,
  })();
}
