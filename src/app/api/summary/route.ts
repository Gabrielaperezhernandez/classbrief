// POST /api/summary { topic } returns an AI summary of the current headlines for that topic.
// Logged-in users only, and at most DAILY_LIMIT requests per user per 24 hours (AI costs money).
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNewsForTopic } from "@/lib/news";
import { getSummary } from "@/lib/summary";

const DAILY_LIMIT = 10;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim();
  if (!topic || topic.length > 200) {
    return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI summaries are not set up yet." }, { status: 503 });
  }

  // Rate limit: count this user's requests in the last 24 hours (RLS only shows their own rows).
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (countError) {
    return NextResponse.json({ error: "Could not check your usage. Try again." }, { status: 500 });
  }
  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_LIMIT} AI summaries. Try again tomorrow.` },
      { status: 429 },
    );
  }

  const articles = await getNewsForTopic(topic);
  if (articles.length === 0) {
    return NextResponse.json({ error: "There are no recent headlines to summarise yet." }, { status: 404 });
  }

  // Log the request before calling the AI, so the limit also counts failed attempts.
  await supabase.from("ai_usage").insert({});

  try {
    const summary = await getSummary(topic, articles);
    if (!summary) {
      return NextResponse.json({ error: "The AI could not summarise these headlines." }, { status: 502 });
    }
    // Send the articles too, so citation numbers [1], [2]... match what the user sees.
    return NextResponse.json({ summary, articles });
  } catch {
    return NextResponse.json({ error: "The AI summary failed. Please try again later." }, { status: 502 });
  }
}
