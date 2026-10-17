// The news sources ClassBrief reads. Details and terms of use are in SOURCES.md.
// access_type: "open" = free to read; "subscription" = the article is behind a paywall
// (we still only show its public headline, snippet and link). "licensed" is for future
// sources used under a licence.

export type AccessType = "open" | "licensed" | "subscription";

export type Source = {
  id: string;
  name: string;
  kind: "guardian" | "rss";
  url: string; // API endpoint or RSS feed
  access_type: AccessType;
};

export const SOURCES: Source[] = [
  // Newspapers
  {
    id: "guardian",
    name: "The Guardian",
    kind: "guardian",
    url: "https://content.guardianapis.com/search",
    access_type: "open",
  },
  {
    id: "economist-europe",
    name: "The Economist",
    kind: "rss",
    url: "https://www.economist.com/europe/rss.xml",
    access_type: "subscription",
  },
  {
    id: "economist-international",
    name: "The Economist",
    kind: "rss",
    url: "https://www.economist.com/international/rss.xml",
    access_type: "subscription",
  },
  {
    id: "ft",
    name: "Financial Times",
    kind: "rss",
    url: "https://www.ft.com/rss/home/international",
    access_type: "subscription",
  },
  {
    id: "wsj",
    name: "The Wall Street Journal",
    kind: "rss",
    url: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews",
    access_type: "subscription",
  },
  {
    id: "nyt",
    name: "The New York Times",
    kind: "rss",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    access_type: "subscription",
  },
  {
    id: "le-monde",
    name: "Le Monde",
    kind: "rss",
    url: "https://www.lemonde.fr/en/rss/une.xml",
    access_type: "subscription",
  },
  {
    id: "spiegel",
    name: "Der Spiegel",
    kind: "rss",
    url: "https://www.spiegel.de/international/index.rss",
    access_type: "open",
  },
  {
    id: "bbc",
    name: "BBC News",
    kind: "rss",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml",
    access_type: "open",
  },
  {
    id: "el-pais",
    name: "El País",
    kind: "rss",
    url: "https://feeds.elpais.com/mrss-s/pages/ep/site/english.elpais.com/portada",
    access_type: "open",
  },
  // Official sources
  {
    id: "european-commission",
    name: "European Commission",
    kind: "rss",
    url: "https://ec.europa.eu/commission/presscorner/api/rss?language=en",
    access_type: "open",
  },
  {
    id: "council-eu",
    name: "Council of the EU",
    kind: "rss",
    url: "https://www.consilium.europa.eu/en/rss/pressreleases.ashx",
    access_type: "open",
  },
  {
    id: "who",
    name: "World Health Organization",
    kind: "rss",
    url: "https://www.who.int/rss-feeds/news-english.xml",
    access_type: "open",
  },
];
