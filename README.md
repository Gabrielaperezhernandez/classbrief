# ClassBrief

ClassBrief helps IE students in policy, business and law courses follow the news their classes depend on, so they arrive prepared.

Students choose the topics their classes cover (for example "EU climate policy"). Their **My news** page then shows what's happening in each topic, with every story grouped across newspapers (The Guardian, The Economist, FT, WSJ, NYT, Le Monde, Der Spiegel, BBC, El País, plus EU and WHO sources), so they can see how each outlet covers it. Only headlines, short snippets and links are shown; see [SOURCES.md](SOURCES.md).

## Tech

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (email + password auth, Postgres with Row Level Security), EU region
- Hosted on Vercel

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase Project URL and publishable key.
3. In Supabase, run `supabase/schema.sql` in the SQL Editor.
4. `npm run dev` and open http://localhost:3000

## Privacy

Each user only sees their own topics (Row Level Security). Only the Supabase URL and publishable key reach the browser; no secret keys are stored in this repository.
