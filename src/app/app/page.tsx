// /app: the main feature, only for logged-in users.
// Loads this user's saved topics from Supabase (Row Level Security only returns their own rows).
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopicManager, { type Topic } from "./TopicManager";

export const metadata = { title: "My topics · ClassBrief" };

export default async function AppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Second safety check (the proxy already redirects logged-out visitors).
  if (!user) redirect("/login");

  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">My topics</h1>
      <p className="mt-1 text-slate-700">
        Add the topics your classes cover. You&apos;ll see the latest news for each one here.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          Could not load your topics. Please refresh the page.
        </p>
      )}
      <TopicManager initialTopics={(topics ?? []) as Topic[]} />
    </div>
  );
}
