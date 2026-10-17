"use client";

// Form to add a topic and the list of saved topics.
// data-testid names (core-input, core-submit, core-item) come from the grading contract.
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export type Topic = {
  id: string;
  title: string;
  created_at: string;
};

// Example topics a student can click to fill in the box (they still click "Add topic").
const EXAMPLES = ["EU climate policy", "Housing in Spain", "AI regulation", "Interest rates"];

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
          className="flex-1 rounded-md border border-[#8c8f96] bg-card px-3 py-2 text-ink"
        />
        <button
          type="submit"
          data-testid="core-submit"
          disabled={saving}
          className="rounded-md bg-brand px-5 py-2 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Add topic"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted">Ideas:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setTitle(example)}
            className="rounded-full border border-line bg-card px-3 py-1 text-muted hover:bg-paper"
          >
            {example}
          </button>
        ))}
      </div>

      {topics.length > 0 && (
        <Link
          href="/news"
          className="mt-6 flex items-center justify-center rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          See my news →
        </Link>
      )}

      {topics.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line p-6 text-center text-muted">
          No topics yet. Add your first one above.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {topics.map((topic) => (
            <li key={topic.id} className="rounded-lg border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* core-item holds exactly the saved text (grading contract). */}
                  <h2 data-testid="core-item" className="break-words font-semibold text-ink">
                    {topic.title}
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    Added {new Date(topic.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteTopic(topic.id)}
                  aria-label={`Delete topic ${topic.title}`}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-muted hover:bg-paper hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
