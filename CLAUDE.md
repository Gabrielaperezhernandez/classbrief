## Grading contract — EdTech Challenge (never remove or break this)
An automated bot grades this app on its public Vercel URL, acting like a stranger.

### Pages
- `/` public landing page (no login needed): what the app does, who it is for, and one button to sign up.
- `/signup` sign-up with email + password. `/login` login with email + password.
- `/app` the main feature, only for logged-in users.
- After sign-up and after login, send the user to `/app`.
- No email confirmation, no CAPTCHA, no "Google only" login, no mandatory onboarding before `/app`.

### data-testid attributes (exact names, do not translate)
- Sign-up form: `signup-email`, `signup-password`, `signup-submit`
- Login form: `login-email`, `login-password`, `login-submit`
- `logout`: the logout button, visible on every page of a logged-in user
- On `/app`:
  - `core-input`: a TEXT field of the main feature (type="text" or a textarea, e.g. the title or description, never a number or date picker). The bot types a short text like "QA-7F3K2A grading bot test"
  - `core-submit`: the button that saves it
  - `core-item`: EVERY saved item in the list, showing the text typed in `core-input`
- Typing only in `core-input` and clicking `core-submit` must save a new item. Any other field needs a valid default value.

### Data and security
- Use Supabase Auth (email + password) and save all data in Supabase tables, never only in the browser (no localStorage for user data).
- Row Level Security ON for every table, with policies based on `auth.uid()`. Nobody can read anything without logging in.
- Only the Supabase URL and the publishable (anon) key may reach the browser. Never put the secret/service_role key or any AI API key in the frontend or in GitHub.
- Keep keys in `.env.local` (listed in `.gitignore`) and in Vercel environment variables.

---

# Project brief: ClassBrief (EdTech MVP)

"ClassBrief" is a working name; it can change.

## About me

- University student (IE University, Madrid), not a professional developer. I'm learning as I go: explain what you do in plain language, keep steps small, and tell me exactly what to click or run when something needs me.
- On a Mac, using Chrome. Node.js and Git are installed; the GitHub CLI (`gh`) is not.

## The assignment

EdTech class, "Async #1: build your solution to be launched". **Due 22 October 2026.** Individual work.

Hand in: the live app at `https://<name>.vercel.app`, a **public** GitHub repo, and the Step 9 summary in Socratista (Name, One-liner, Who it's for, Problem and frequency, Main feature, Data shared between users: no, Real users so far).

Grading: real problem and value proposition 20%, understandable in 5 seconds 20% (an AI looks only at the landing page), real sign-up 30% (bot), does something real 30% (bot). The bot follows the grading contract above. The brief's Step 8 needs at least 5 real people to sign up.

## The problem

Professors often refer to recent news in class (e.g. air-quality regulation in an environmental policy course) and assume students know it. Students face news spread over many outlets, too much to process, and waste time reading the same story several times.

## The product (scope for the deadline)

- **Who it's for:** IE students in policy, business and law courses where professors expect them to follow the news.
- **Main feature (the contract's core item):** on `/app` ("What topics are you interested in?", where students land right after sign-up) the student types a topic their class covers and saves it.
- **My news (`/news`):** for each topic, recent stories grouped across newspapers (no AI: grouped by shared distinctive words in headline + snippet), showing "Covered by N newspapers" and each outlet's headline, snippet and link, with a "Subscription" label for paywalled papers. Code: `src/lib/news/` (`index.ts` fetches, `stories.ts` groups, `sources.ts` lists the 13 sources).
- **Data: private.** Each user only sees their own topics.
- **Later, only if the core is solid:** professor course feeds with join codes, story grouping across outlets, chatbot per story, paid publisher sources.

## Legal and data rules (keep these)

- **Open sources only:** RSS feeds (store only headline, snippet, date, URL; never scrape full article pages), the Guardian Open Platform API, EU and government press releases, agencies such as the EEA and WHO. Document each source and its terms in `SOURCES.md`.
- Every source has an `access_type` field (`open | licensed | subscription`) so paid sources can plug in later.
- Show headlines, short snippets and links plus our own synthesis, never reproductions of articles (EU press publishers' right).
- GDPR: minimal student data, a short privacy page, EU Supabase region.
- Label AI-generated content as AI-generated. Avoid claiming "objectivity" and avoid political bias labels.
- AI endpoints cost money: rate-limit them, keep the Anthropic key server-side only, and set a spend limit in the Anthropic Console.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres, Auth, Row Level Security), EU region
- Claude API (Anthropic) for summaries, server-side only
- Vercel for hosting (free plan: one daily cron, plus a protected manual refresh route)

## Links

- Live app: https://classbrief-one.vercel.app (Vercel project `classbrief`, auto-deploys on every push to `main`)
- Repo (public): https://github.com/Gabrielaperezhernandez/classbrief
- Supabase project ref: `kbcnsnmhyeijgkskpzya` (eu-west-2). Site URL and redirect URLs point at the live app and localhost:3000.
- Push with the GitHub CLI at `~/bin/gh` (already signed in).

## Plan

1. **Day 1 (17 Oct):** contract pages (`/`, `/signup`, `/login`, `/app`), `topics` table with RLS, public GitHub repo, Vercel deploy, Step 7 checklist on the live link.
2. **Day 2:** news ingestion (Guardian API + RSS), headlines under each topic, `SOURCES.md`.
3. **Day 3:** AI summary per topic (server-side, rate-limited, labelled). **Dropped (17 Oct):** IE blocks Anthropic accounts on student.ie.edu and I chose not to pay with a personal account; the news page compares coverage without AI instead. The earlier AI summary code (route, prompt, rate limit) is in Git history at commit `d336497`; the `ai_usage` table still exists in Supabase, unused.
4. **Day 4:** landing page polish, phone layout, privacy page, accessibility; real users (Step 8) and fixes.
5. **Day 5:** final checks on the live link, security review, Step 9 summary.

## Validation surveys (Google Forms)

- Student survey: https://docs.google.com/forms/d/e/1FAIpQLSdfTBbluKA8EoTjQlyw7x8bjH1Ta42eTXwkuBpfFm0y0WYiHg/viewform
- Professor survey: https://docs.google.com/forms/d/e/1FAIpQLSemAShD-HhxvrrjeiRTH5H_ausC6Q-ChBgK3oMeoPFrOWUEfg/viewform

## How to work with me

- Show me the plan before big changes. One feature at a time; commit after each working step.
- After each step, tell me how to check it works.
- If something needs me (an account, a key in `.env.local`, a browser approval), stop and give exact instructions. Never ask me to paste keys into the chat.
- Keep code simple and commented.
- The repo is public: before every push, check that no keys are in the code or Git history.
