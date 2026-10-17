// Public landing page: in 5 seconds a visitor should know what this is, who it's for, and what to click.
import Link from "next/link";

const steps = [
  {
    title: "Save your class topics",
    text: "Type the topics your professors keep mentioning, like “EU air quality rules”.",
  },
  {
    title: "See the latest news on each",
    text: "Recent headlines from open news sources, grouped under each topic, with links to the originals.",
  },
  {
    title: "Arrive at class prepared",
    text: "Know what happened this week before your professor brings it up.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <section className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-800">
          For IE students in policy, business and law courses
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          Know the news your professors will talk about
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-700">
          Save the topics your classes cover and follow the latest news on each, in one place, instead
          of checking ten news sites.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-lg bg-blue-700 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-800"
        >
          Sign up free
        </Link>
        <p className="mt-3 text-sm text-slate-600">
          Email and password only. Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-800 underline">
            Log in
          </Link>
        </p>
      </section>

      <section aria-labelledby="how-it-works" className="mt-16">
        <h2 id="how-it-works" className="text-center text-xl font-semibold text-slate-900">
          How it works
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-lg border border-slate-200 bg-white p-5">
              <span className="text-sm font-bold text-blue-800">Step {i + 1}</span>
              <h3 className="mt-1 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
