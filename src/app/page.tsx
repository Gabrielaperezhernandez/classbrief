// Public landing page: in 5 seconds a visitor should know what this is, who it's for, and what to click.
import Link from "next/link";

const OUTLETS = [
  "The Guardian",
  "The Economist",
  "Financial Times",
  "The Wall Street Journal",
  "The New York Times",
  "Le Monde",
  "Der Spiegel",
  "BBC News",
  "El País",
  "European Commission",
  "Council of the EU",
  "World Health Organization",
];

const STEPS = [
  {
    title: "Choose your topics",
    text: "Type what your classes cover, like “EU climate policy” or “housing in Spain”.",
  },
  {
    title: "Open your news page",
    text: "Every story is grouped across newspapers, so you read it once and see who covered it.",
  },
  {
    title: "Arrive prepared",
    text: "Know what happened this week before your professor brings it up in class.",
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-12 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">
            A news app for IE University students in policy, business and law
          </p>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-6xl">
            Know the news your professors will talk about
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A news page built from your class topics. Pick what your courses cover, and ClassBrief
            shows each story grouped across the FT, The Economist, the BBC and more, instead of checking
            ten sites.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-7 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-brand-dark"
            >
              Sign up free
            </Link>
            <a href="#example" className="text-sm font-medium text-brand underline underline-offset-2">
              See an example ↓
            </a>
          </div>
          <p className="mt-4 text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand underline underline-offset-2">
              Log in
            </Link>
          </p>
        </div>

        {/* Preview of a story card, so visitors see what they get. */}
        <figure id="example" aria-label="Example of a story on your news page" className="scroll-mt-20">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-[0_20px_50px_-20px_rgba(27,51,88,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Example · EU climate policy</p>
            <p className="mt-2 font-serif text-xl font-semibold leading-snug text-ink">
              EU ministers agree new 2040 emissions target
            </p>
            <p className="mt-2 inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
              Covered by 3 newspapers
            </p>
            <ul className="mt-4 space-y-3">
              {[
                ["Financial Times", "What the deal means for European industry"],
                ["Le Monde", "Paris and Berlin clash over the flexibility clause"],
                ["BBC News", "Climate groups say the target is not enough"],
              ].map(([outlet, headline]) => (
                <li key={outlet} className="border-l-2 border-brand/30 pl-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{outlet}</p>
                  <p className="font-serif text-[15px] text-ink">{headline}</p>
                </li>
              ))}
            </ul>
          </div>
          <figcaption className="mt-3 text-center text-xs text-muted">Illustrative example</figcaption>
        </figure>
      </section>

      {/* Sources */}
      <section aria-label="News sources" className="border-y border-line bg-card">
        <div className="mx-auto max-w-5xl px-4 py-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Headlines from 9 newspapers and 3 official sources
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-1 font-serif text-lg text-ink">
            {OUTLETS.map((o) => (
              <li key={o} className="whitespace-nowrap">
                {o}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-it-works" className="mx-auto max-w-5xl px-4 py-16">
        <h2 id="how-it-works" className="text-center font-serif text-3xl font-semibold text-ink">
          How it works
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-line bg-card p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-brand px-7 py-3.5 font-semibold text-white hover:bg-brand-dark"
          >
            Sign up free
          </Link>
          <p className="mt-3 text-xs text-muted">Email and password only. We only store your email and topics.</p>
        </div>
      </section>
    </div>
  );
}
