// /news: the student's news page. For each saved topic, recent stories grouped across
// newspapers, so they can see what's happening and how different outlets cover it.
// Logged-in users only (the proxy also redirects logged-out visitors to /login).
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/news";
import { getStoriesForTopic, type Story } from "@/lib/news/stories";

export const metadata = { title: "My news · ClassBrief" };

export default async function NewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: topics } = await supabase
    .from("topics")
    .select("id, title")
    .order("created_at", { ascending: false });

  if (!topics || topics.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink">My news</h1>
        <p className="mt-3 text-muted">Add a few topics first, and your news will appear here.</p>
        <Link
          href="/app"
          className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Choose my topics
        </Link>
      </div>
    );
  }

  // One topic failing never breaks the page: it just shows "no recent news".
  const sections = await Promise.all(
    topics.map(async (t) => ({
      topic: t,
      stories: await getStoriesForTopic(t.title).catch(() => [] as Story[]),
    })),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Masthead: today's date + title, like a newspaper front page. */}
      <header className="border-b-2 border-ink pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight text-ink">My news</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-muted">What&apos;s happening in your topics, and how each newspaper covers it.</p>
          <Link href="/app" className="text-sm font-medium text-brand underline underline-offset-2">
            Edit my topics
          </Link>
        </div>
      </header>

      {sections.map(({ topic, stories }) => (
        <section key={topic.id} aria-labelledby={`topic-${topic.id}`} className="mt-10">
          <h2
            id={`topic-${topic.id}`}
            className="flex items-baseline gap-3 font-serif text-2xl font-semibold text-ink"
          >
            <span className="h-5 w-1 shrink-0 self-center rounded bg-accent" aria-hidden="true" />
            {topic.title}
          </h2>
          {stories.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No recent news on this topic. Try a broader topic, like &ldquo;air pollution&rdquo;.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {stories.map((story) => (
                <StoryCard key={story.articles[0].url} story={story} />
              ))}
            </div>
          )}
        </section>
      ))}

      <p className="mt-12 text-xs text-muted">
        Stories are grouped automatically by matching headlines, so a group can occasionally mix two
        related stories. Headlines and short snippets link to the original articles;
        &ldquo;Subscription&rdquo; means the newspaper has a paywall. Updated about once an hour.
      </p>
    </div>
  );
}

function StoryCard({ story }: { story: Story }) {
  const [lead, ...others] = story.articles;
  const count = story.sources.length;

  return (
    <article className="rounded-xl border border-line bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={`rounded-full px-2.5 py-1 font-semibold ${count > 1 ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}
        >
          {count > 1 ? `Covered by ${count} newspapers` : "Covered by 1 newspaper"}
        </span>
        <span className="text-muted">{formatDate(story.latest)}</span>
      </div>

      {/* The lead article: its headline is the story's headline. */}
      <div className="mt-3">
        <SourceLabel article={lead} />
        <h3 className="mt-1 font-serif text-xl font-semibold leading-snug">
          <ArticleLink article={lead} className="text-ink" />
        </h3>
        {lead.snippet && <p className="mt-1.5 text-sm leading-relaxed text-muted">{lead.snippet}</p>}
      </div>

      {others.length > 0 && (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Also covered by</p>
          <ul className="mt-2 space-y-3">
            {others.map((a) => (
              <li key={a.url} className="border-l-2 border-brand/25 pl-3">
                <SourceLabel article={a} />
                <p className="mt-0.5 font-medium leading-snug">
                  <ArticleLink article={a} className="text-brand" />
                </p>
                {a.snippet && <p className="mt-1 text-sm text-muted">{a.snippet}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

// Newspaper name, plus a "Subscription" label for paywalled newspapers.
function SourceLabel({ article }: { article: Article }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
      {article.source}
      {article.accessType === "subscription" && (
        <span
          className="ml-2 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium normal-case tracking-normal text-amber-900"
          title="This newspaper needs a subscription to read the full article"
        >
          Subscription
        </span>
      )}
    </p>
  );
}

// Link to the original article (opens in a new tab).
function ArticleLink({ article, className }: { article: Article; className: string }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} underline-offset-2 hover:underline`}
    >
      {article.title}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function formatDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
}
