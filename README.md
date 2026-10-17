# ClassBrief

ClassBrief helps IE students in policy, business and law courses follow the news their classes depend on, so they arrive prepared.

Students save the topics their professors keep mentioning (for example "EU air quality rules") and see the latest news on each one in a single place.

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
