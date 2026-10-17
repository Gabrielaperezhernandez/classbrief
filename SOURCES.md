# News sources

ClassBrief only uses **open** sources for now. For every article we show the **headline, a short snippet (max. 200 characters), the date, the source name and a link to the original**. We never copy or display full articles, in line with EU copyright rules and the press publishers' right. Results are cached for about one hour.

Each source has an `access_type` (`open | licensed | subscription`) in [`src/lib/news/sources.ts`](src/lib/news/sources.ts), so paid sources (e.g. FT, The Economist) can be added later under a licence.

| Source | How we read it | access_type | Terms |
|---|---|---|---|
| The Guardian | Content API search (`content.guardianapis.com/search`) with a free developer key | open | [Guardian Open Platform terms](https://www.theguardian.com/open-platform/terms-and-conditions): non-commercial developer key, rate-limited, attribution and links back to theguardian.com |
| European Commission | Press corner RSS feed | open | [European Commission legal notice](https://commission.europa.eu/legal-notice_en): reuse allowed with acknowledgement of the source |
| Council of the EU | Press releases RSS feed | open | [Council legal notice](https://www.consilium.europa.eu/en/about-site/legal-notice/): reuse allowed with acknowledgement of the source |
| World Health Organization | News RSS feed | open | [WHO terms of use](https://www.who.int/about/policies/publishing/copyright): headlines and links to WHO pages; no full-text republication |

### Newspapers read through their public RSS feeds

Publishers offer these feeds so others can show their headlines with a link back. We use them for a non-commercial student project, show only the headline, a short snippet, the date and the source name, and always link to the original. Paywalled newspapers get a **"Subscription"** label so students know before clicking. Each publisher's own RSS/terms page applies and should be re-checked before any commercial use.

We read several **section feeds** per newspaper (world, Europe, business, economy, climate, technology, politics, health…), so we search far more recent articles than a front page alone. The exact feed URLs are in [`src/lib/news/sources.ts`](src/lib/news/sources.ts).

| Source | Sections read | access_type |
|---|---|---|
| The Economist | Europe, International, Finance & economics, Business, Science & technology, Leaders, Britain, United States, Middle East & Africa, Asia, China, The Americas | subscription |
| Financial Times | International home, World, Europe, Global economy, Companies, Technology, Climate | subscription |
| The Wall Street Journal | World, US business, Markets, Tech, Economy | subscription |
| The New York Times | World, Europe, Business, Economy, Climate, Technology, Politics, Health | subscription |
| Le Monde (English) | Front page, International, Europe, Economy, Environment | subscription |
| Der Spiegel International | All | open |
| BBC News | World, Europe, Business, Politics, Science & environment, Technology, Health | open |
| El País (English) | Front page, International, Spain, Economy & business, Climate, Technology | open |

Not available (no public feed, or the feed blocks requests): Reuters, AP, The Washington Post, Politico, The Telegraph. Showing full articles from paywalled newspapers (e.g. FT, The Economist) would need a licence (`access_type: licensed`).

## How matching works

We never download newspaper web pages. We search only what each source gives us:

- **The Guardian:** its search engine (Content API) searches whole articles: first headline + summary, then the full text (those results must mention at least half of the topic words in their headline or summary).
- **RSS feeds:** we search the headline, the summary, the newspaper's own topic tags and, where a feed includes it (e.g. El País, the NYT), the article text. This extra text is used **only for matching and is never shown or stored** by us.
- **Relevance score:** each article gets points for every topic word it contains. Rare, specific words (e.g. "quality", "Houthi") count more than common ones (e.g. "EU", "rules"), and a word in the headline counts more than one in the tags, summary or body. An article must contain at least 70% of the topic's weighted words, with at least one in the headline, tags or summary.
- **Word matching:** words match at the start of a word ("Iran" finds "Iranian" but not "Tirana"; "tariff" finds "tariffs"). Short words like "AI" or "EU" must be whole words, and common variants count ("A.I.", "artificial intelligence", "European Union").
- **Stories (My news page):** articles about the same story are grouped automatically, without AI: two articles join when their headline + snippet share at least 3 distinctive words (names, places, key terms; singular and plural count as the same) covering at least 30% of the shorter one. Each story keeps one article per newspaper and shows "Covered by N newspapers". Stories covered by more newspapers come first; up to 6 per topic.
- Only news from the last 30 days is used.

## Keys

The Guardian key is stored only in `.env.local` (not in Git) and in Vercel environment variables as `GUARDIAN_API_KEY`. It is used only on the server and never sent to the browser.
