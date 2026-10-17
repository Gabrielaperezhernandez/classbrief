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

| Source | Feed | access_type |
|---|---|---|
| The Economist | `economist.com/europe/rss.xml`, `economist.com/international/rss.xml` | subscription |
| Financial Times | `ft.com/rss/home/international` | subscription |
| The Wall Street Journal | `feeds.content.dowjones.io/public/rss/RSSWorldNews` | subscription |
| The New York Times | `rss.nytimes.com/services/xml/rss/nyt/World.xml` | subscription |
| Le Monde (English) | `lemonde.fr/en/rss/une.xml` | subscription |
| Der Spiegel International | `spiegel.de/international/index.rss` | open |
| BBC News (World) | `feeds.bbci.co.uk/news/world/rss.xml` | open |
| El País (English) | `feeds.elpais.com/.../english.elpais.com/portada` | open |

Not available (no public feed, or the feed blocks requests): Reuters, AP, The Washington Post, Politico, The Telegraph. Showing full articles from paywalled newspapers (e.g. FT, The Economist) would need a licence (`access_type: licensed`).

## How matching works

- **The Guardian:** its search API returns the newest articles for the topic text.
- **RSS feeds:** we read the latest items and keep those whose headline or snippet contains **every** important word of the topic (common words like "the" or "new" are ignored).
- Results from all sources are merged and duplicates removed.
- **Stories (My news page):** articles about the same story are grouped automatically, without AI: two articles join when their headline + snippet share at least 3 distinctive words (names, places, key terms; singular and plural count as the same) covering at least 30% of the shorter one. Each story keeps one article per newspaper and shows "Covered by N newspapers". Stories covered by more newspapers come first; up to 6 per topic.

## Keys

The Guardian key is stored only in `.env.local` (not in Git) and in Vercel environment variables as `GUARDIAN_API_KEY`. It is used only on the server and never sent to the browser.
