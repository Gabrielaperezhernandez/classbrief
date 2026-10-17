// GET /api/news?topic=... returns recent headlines for one topic.
// Only logged-in users can call it, so strangers can't use up our Guardian API quota.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNewsForTopic } from "@/lib/news";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const topic = (request.nextUrl.searchParams.get("topic") ?? "").trim();
  if (!topic || topic.length > 200) {
    return NextResponse.json({ error: "Invalid topic." }, { status: 400 });
  }

  try {
    const articles = await getNewsForTopic(topic);
    return NextResponse.json({ articles });
  } catch {
    // Never break the page: an empty list just shows "No recent news yet".
    return NextResponse.json({ articles: [] });
  }
}
