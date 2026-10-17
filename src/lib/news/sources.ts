// The news sources ClassBrief reads. Details and terms of use are in SOURCES.md.
// access_type: "open" = free to read; "subscription" = the article is behind a paywall
// (we still only show its public headline, snippet and link). "licensed" is for future
// sources used under a licence.
// Each newspaper has several section feeds (world, Europe, business, climate...), so we
// search far more of its recent articles than its front page alone.

export type AccessType = "open" | "licensed" | "subscription";

export type Source = {
  id: string;
  name: string;
  kind: "guardian" | "rss";
  feeds: string[]; // Guardian: the search API; RSS: one or more feed URLs
  access_type: AccessType;
};

const ft = (section: string) => `https://www.ft.com/${section}?format=rss`;
const economist = (section: string) => `https://www.economist.com/${section}/rss.xml`;
const nyt = (section: string) => `https://rss.nytimes.com/services/xml/rss/nyt/${section}.xml`;
const bbc = (section: string) => `https://feeds.bbci.co.uk/news/${section}/rss.xml`;
const leMonde = (section: string) => `https://www.lemonde.fr/en/${section}/rss_full.xml`;
const wsj = (feed: string) => `https://feeds.content.dowjones.io/public/rss/${feed}`;
const elPais = (section: string) =>
  `https://feeds.elpais.com/mrss-s/list/ep/site/english.elpais.com/section/${section}`;

export const SOURCES: Source[] = [
  // Newspapers
  {
    id: "guardian",
    name: "The Guardian",
    kind: "guardian",
    feeds: ["https://content.guardianapis.com/search"],
    access_type: "open",
  },
  {
    id: "economist",
    name: "The Economist",
    kind: "rss",
    feeds: [
      "europe", "international", "finance-and-economics", "business", "science-and-technology",
      "leaders", "britain", "united-states", "middle-east-and-africa", "asia", "china", "the-americas",
    ].map(economist),
    access_type: "subscription",
  },
  {
    id: "ft",
    name: "Financial Times",
    kind: "rss",
    feeds: ["home/international", "world", "europe", "global-economy", "companies", "technology", "climate-capital"].map(
      (s) => (s === "home/international" ? "https://www.ft.com/rss/home/international" : ft(s)),
    ),
    access_type: "subscription",
  },
  {
    id: "wsj",
    name: "The Wall Street Journal",
    kind: "rss",
    feeds: ["RSSWorldNews", "WSJcomUSBusiness", "RSSMarketsMain", "RSSWSJD", "socialeconomyfeed"].map(wsj),
    access_type: "subscription",
  },
  {
    id: "nyt",
    name: "The New York Times",
    kind: "rss",
    feeds: ["World", "Europe", "Business", "Economy", "Climate", "Technology", "Politics", "Health"].map(nyt),
    access_type: "subscription",
  },
  {
    id: "le-monde",
    name: "Le Monde",
    kind: "rss",
    feeds: [
      "https://www.lemonde.fr/en/rss/une.xml",
      ...["international", "europe", "economy", "environment"].map(leMonde),
    ],
    access_type: "subscription",
  },
  {
    id: "spiegel",
    name: "Der Spiegel",
    kind: "rss",
    feeds: ["https://www.spiegel.de/international/index.rss"],
    access_type: "open",
  },
  {
    id: "bbc",
    name: "BBC News",
    kind: "rss",
    feeds: ["world", "world/europe", "business", "politics", "science_and_environment", "technology", "health"].map(bbc),
    access_type: "open",
  },
  {
    id: "el-pais",
    name: "El País",
    kind: "rss",
    feeds: [
      "https://feeds.elpais.com/mrss-s/pages/ep/site/english.elpais.com/portada",
      ...["international", "spain", "economy-and-business", "climate", "technology"].map(elPais),
    ],
    access_type: "open",
  },
  // Official sources
  {
    id: "european-commission",
    name: "European Commission",
    kind: "rss",
    feeds: ["https://ec.europa.eu/commission/presscorner/api/rss?language=en"],
    access_type: "open",
  },
  {
    id: "council-eu",
    name: "Council of the EU",
    kind: "rss",
    feeds: ["https://www.consilium.europa.eu/en/rss/pressreleases.ashx"],
    access_type: "open",
  },
  {
    id: "who",
    name: "World Health Organization",
    kind: "rss",
    feeds: ["https://www.who.int/rss-feeds/news-english.xml"],
    access_type: "open",
  },
];
