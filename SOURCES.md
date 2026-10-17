# News sources

ClassBrief only uses **open** sources for now. For every article we show the **headline, a short snippet (max. 200 characters), the date, the source name and a link to the original**. We never copy or display full articles, in line with EU copyright rules and the press publishers' right. Results are cached for about one hour.

Each source has an `access_type` (`open | licensed | subscription`) in [`src/lib/news/sources.ts`](src/lib/news/sources.ts), so paid sources (e.g. FT, The Economist) can be added later under a licence.

| Source | How we read it | access_type | Terms |
|---|---|---|---|
| The Guardian | Content API search (`content.guardianapis.com/search`) with a free developer key | open | [Guardian Open Platform terms](https://www.theguardian.com/open-platform/terms-and-conditions): non-commercial developer key, rate-limited, attribution and links back to theguardian.com |
| European Commission | Press corner RSS feed | open | [European Commission legal notice](https://commission.europa.eu/legal-notice_en): reuse allowed with acknowledgement of the source |
| Council of the EU | Press releases RSS feed | open | [Council legal notice](https://www.consilium.europa.eu/en/about-site/legal-notice/): reuse allowed with acknowledgement of the source |
| World Health Organization | News RSS feed | open | [WHO terms of use](https://www.who.int/about/policies/publishing/copyright): headlines and links to WHO pages; no full-text republication |

## How matching works

- **The Guardian:** its search API returns the newest articles for the topic text.
- **RSS feeds:** we read the latest items and keep those whose headline or snippet contains **every** important word of the topic (common words like "the" or "new" are ignored).
- Results from all sources are merged, duplicates removed, sorted newest first, and the top 5 are shown.

## Keys

The Guardian key is stored only in `.env.local` (not in Git) and in Vercel environment variables as `GUARDIAN_API_KEY`. It is used only on the server and never sent to the browser.
