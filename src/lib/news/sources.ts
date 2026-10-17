// The news sources ClassBrief reads. Details and terms of use are in SOURCES.md.
// access_type lets paid sources (licensed / subscription) plug in later.

export type AccessType = "open" | "licensed" | "subscription";

export type Source = {
  id: string;
  name: string;
  kind: "guardian" | "rss";
  url: string; // API endpoint or RSS feed
  access_type: AccessType;
};

export const SOURCES: Source[] = [
  {
    id: "guardian",
    name: "The Guardian",
    kind: "guardian",
    url: "https://content.guardianapis.com/search",
    access_type: "open",
  },
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
