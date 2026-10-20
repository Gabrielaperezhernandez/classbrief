# ClassBrief

ClassBrief helps IE students in policy, business and law courses follow the news their classes depend on, so they arrive prepared.

Students choose the topics their classes cover (for example "EU climate policy"). Their **My news** page then shows what's happening in each topic, with every story grouped across newspapers (The Guardian, The Economist, FT, WSJ, NYT, Le Monde, Der Spiegel, BBC, El País, plus the European Commission, the Council of the EU and the WHO: 12 sources in total), so they can see how each outlet covers it. Only headlines, short snippets and links are shown; see [SOURCES.md](SOURCES.md).

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

## How it works for a user

1. **`/`** — landing page: who it's for, what you get, one "Sign up free" button.
2. **`/signup`** — email + password only. No email confirmation: you land straight on `/app`.
3. **`/app`** — "What topics are you interested in?": type a topic (e.g. "EU climate policy") and click **Add topic**. Topics are saved in Supabase, linked to your account.
4. **`/news`** — My news: for each topic, recent stories grouped across newspapers ("Covered by 3 newspapers"), each with its headline, snippet and a link to the original. Stories published since your previous visit are marked **"New since your last visit"**, with a welcome-back line counting them.

## Data and security

- Visits to My news are stored in `public.news_visits` (user id + time, at most one per 30 minutes), also under Row Level Security; they power "New since your last visit" and let us count returning users.
- Topics live in the Supabase table `public.topics` (see [`supabase/schema.sql`](supabase/schema.sql)), never in the browser's storage.
- **Row Level Security** is on. Policies use `auth.uid() = user_id` for read, insert, update and delete, so each user only sees and changes their own topics. Logged-out visitors (the `anon` role) have no access at all.
- `/app` and `/news` redirect logged-out visitors to `/login` ([`src/proxy.ts`](src/proxy.ts)).
- Only the Supabase URL and the publishable key reach the browser. The Guardian key is server-only; no keys are committed.

## Grading contract checklist

| Requirement | Where |
|---|---|
| `signup-email`, `signup-password`, `signup-submit`, `login-email`, `login-password`, `login-submit` | [`src/components/AuthForm.tsx`](src/components/AuthForm.tsx) |
| `logout` on every page of a logged-in user | [`src/components/LogoutButton.tsx`](src/components/LogoutButton.tsx), shown in the header on every page |
| `core-input` (text), `core-submit`, `core-item` on `/app` | [`src/app/app/TopicManager.tsx`](src/app/app/TopicManager.tsx) |
| After sign-up and login, go to `/app` | [`src/components/AuthForm.tsx`](src/components/AuthForm.tsx) |
| Wrong password rejected | `supabase.auth.signInWithPassword`, shows "Wrong email or password" |

## How it was tested

| Check | Result |
|---|---|
| Sign up with a new email: lands on `/app`, no "check your email" | ✅ |
| Type only in `core-input`, click `core-submit`: the item appears in the list | ✅ |
| Reload the page: the item is still there (saved in Supabase) | ✅ |
| Log out, then log in with a wrong password: rejected | ✅ |
| Log in with the right password: the item is still there | ✅ |
| A second account does not see the first account's items | ✅ |
| Reading the `topics` table without logging in (direct API call with the public key) | ✅ refused: `permission denied for table topics` |
| Sign up with an email that already exists: "An account with this email already exists. Log in instead" | ✅ |
| Sign up with an empty form or a password under 6 characters: clear message, nothing is sent | ✅ |
| Phone width (375 px): no sideways scrolling on `/`, `/signup`, `/login`, `/app`, `/news`, `/privacy` | ✅ |
