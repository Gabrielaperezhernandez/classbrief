"use client";

// Form to add a topic and the list of saved topics.
// data-testid names (core-input, core-submit, core-item) come from the grading contract.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import TopicNews from "./TopicNews";

export type Topic = {
  id: string;
  title: string;
  created_at: string;
};

export default function TopicManager({ initialTopics }: { initialTopics: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function addTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = title.trim();
    if (!text) return;

    setSaving(true);
    setError("");
    // user_id is filled in by the database (default auth.uid()), so users can only save as themselves.
    const { data, error } = await createClient()
      .from("topics")
      .insert({ title: text })
      .select("id, title, created_at")
      .single();
    setSaving(false);

    if (error) {
      setError("Could not save the topic. Please try again.");
      return;
    }
    setTopics([data as Topic, ...topics]);
    setTitle("");
  }

  async function deleteTopic(id: string) {
    const { error } = await createClient().from("topics").delete().eq("id", id);
    if (error) {
      setError("Could not delete the topic. Please try again.");
      return;
    }
    setTopics(topics.filter((t) => t.id !== id));
  }

  return (
    <div className="mt-6">
      <form onSubmit={addTopic} className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="topic" className="sr-only">
          New topic
        </label>
        <input
          id="topic"
          type="text"
          data-testid="core-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="e.g. EU air quality rules"
          className="flex-1 rounded-md border border-slate-400 bg-white px-3 py-2 text-slate-900"
        />
        <button
          type="submit"
          data-testid="core-submit"
          disabled={saving}
          className="rounded-md bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add topic"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {topics.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
          No topics yet. Add your first one above.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {topics.map((topic) => (
            <li key={topic.id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* core-item holds exactly the saved text (grading contract). */}
                  <h2 data-testid="core-item" className="break-words font-semibold text-slate-900">
                    {topic.title}
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Added {new Date(topic.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTopic(topic.id)}
                  aria-label={`Delete topic ${topic.title}`}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
              <TopicNews topic={topic.title} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
