// /news: the student's news page. For each saved topic, recent stories grouped across
// newspapers, so they can see what's happening and how different outlets cover it.
// Logged-in users only (the proxy also redirects logged-out visitors to /login).
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
        <h1 className="text-2xl font-bold text-slate-900">My news</h1>
        <p className="mt-3 text-slate-700">Add a few topics first, and your news will appear here.</p>
        <Link
          href="/app"
          className="mt-6 inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
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
      <h1 className="text-2xl font-bold text-slate-900">My news</h1>
      <p className="mt-1 text-slate-700">
        What&apos;s happening in your topics, and how different newspapers cover each story.
      </p>
      <p className="mt-2 text-sm">
        <Link href="/app" className="font-medium text-blue-800 underline">
          Edit my topics
        </Link>
      </p>

      {sections.map(({ topic, stories }) => (
        <section key={topic.id} aria-labelledby={`topic-${topic.id}`} className="mt-10">
          <h2 id={`topic-${topic.id}`} className="border-b border-slate-200 pb-2 text-xl font-semibold text-slate-900">
            {topic.title}
          </h2>
          {stories.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">
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

      <p className="mt-12 text-xs text-slate-600">
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
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="font-semibold leading-snug text-slate-900">{lead.title}</h3>
      <p className="mt-1 text-xs font-medium text-slate-600">
        {count > 1
          ? `Covered by ${count} newspapers: ${story.sources.join(", ")}`
          : `Only covered by ${story.sources[0]} so far`}
        {" · "}
        {formatDate(story.latest)}
      </p>

      <ul className="mt-3 space-y-3">
        {[lead, ...others].map((a) => (
          <li key={a.url} className="border-l-2 border-slate-200 pl-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              {a.source}
              {a.accessType === "subscription" && (
                <span
                  className="ml-2 rounded border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium normal-case tracking-normal text-amber-900"
                  title="This newspaper needs a subscription to read the full article"
                >
                  Subscription
                </span>
              )}
            </p>
            <a
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 block font-medium text-blue-800 underline-offset-2 hover:underline"
            >
              {a.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {a.snippet && <p className="mt-1 text-sm text-slate-700">{a.snippet}</p>}
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatDate(iso: string): string {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "";
}
