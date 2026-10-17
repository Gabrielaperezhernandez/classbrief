// Public privacy page (GDPR): what we collect, why, where it is stored and the user's rights.
import Link from "next/link";

export const metadata = { title: "Privacy · ClassBrief" };

const REPO_URL = "https://github.com/Gabrielaperezhernandez/classbrief";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-slate-800">
      <h1 className="text-2xl font-bold text-slate-900">Privacy</h1>
      <p className="mt-2 text-sm text-slate-600">Last updated: 17 October 2026</p>

      <p className="mt-6">
        ClassBrief is an independent student project built for an EdTech course at IE University. It
        is not an official IE University service. We collect as little personal data as possible.
      </p>

      <Section title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Your email address and password</strong>, to create your account and log you in.
            Passwords are stored encrypted (hashed) by our login provider; nobody can read them.
          </li>
          <li>
            <strong>The topics you save</strong> (for example &ldquo;EU air quality rules&rdquo;) and when you
            saved them.
          </li>
        </ul>
        <p className="mt-2">
          We don&apos;t ask for your name, student ID, grades or any other personal details, and we
          don&apos;t use analytics or advertising trackers.
        </p>
      </Section>

      <Section title="Why we use it">
        <p>
          Only to run the service: to log you in and to show you news for the topics you saved. We
          never sell your data or use it for marketing.
        </p>
      </Section>

      <Section title="Who else is involved">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Supabase</strong> stores your account and topics in a data centre in Europe (London).
          </li>
          <li>
            <strong>Vercel</strong> hosts the website; our server code runs in Frankfurt (EU).
          </li>
          <li>
            <strong>News sources</strong>: to find headlines, the text of your topic (never your email)
            is sent as a search to the Guardian Open Platform. We also read public news feeds from
            other newspapers (e.g. The Economist, the FT, the BBC), the European Commission, the
            Council of the EU and the WHO; your topics are never sent to them.
          </li>
        </ul>
      </Section>

      <Section title="Cookies">
        <p>
          We only use the cookies needed to keep you logged in. There are no tracking or advertising
          cookies.
        </p>
      </Section>

      <Section title="AI-generated content">
        <p>
          Any summary written by AI is clearly labelled as AI-generated. Headlines and snippets always
          link to the original articles.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Your topics stay until you delete them (use &ldquo;Delete&rdquo; on any topic). Your account stays
          until you ask us to delete it. This project may be shut down after the course ends, and all
          data will then be deleted.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under the GDPR you can ask to see, correct or delete your data, or to delete your account.
          To do so, open a request on our{" "}
          <a href={`${REPO_URL}/issues`} className="font-medium text-blue-800 underline" target="_blank" rel="noopener noreferrer">
            project page on GitHub
          </a>{" "}
          (don&apos;t post your email publicly; just say you want to be contacted) and we will reply
          within 30 days. You can also complain to the Spanish data protection authority (AEPD).
        </p>
      </Section>

      <p className="mt-10">
        <Link href="/" className="font-medium text-blue-800 underline">
          Back to ClassBrief
        </Link>
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
