# Recommendation Relay

Write a recommendation once. We adapt it for LinkedIn, Upwork, and Contra — the only three
freelance/design platforms that actually have a client-recommendation feature (verified during
design; Fiverr, Behance, Dribbble, 99designs, and Toptal don't).

No platform lets a third party post a recommendation on someone's behalf — the client always
writes and submits it themselves, on that platform, logged in as themselves. This tool doesn't
try to get around that. It's a drafting + tracking assistant: the client writes their
recommendation once here, gets it adapted per platform (length/tone), and knows exactly what to
paste in when each platform's own native request lands in their inbox.

See the full design doc and build plan at
`~/.gstack/projects/Recommend/aiseosauyi-idahor-main-design-20260723-001122.md`.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:3000`, falls back to the next free
port if that's taken).

- `/` — landing page
- `/new` — freelancer sets up (first visit) or adds a new client request
- `/dashboard/[slug]` — freelancer's request list, reached automatically after `/new`
- `/r/[slug]` — the link you send your client; they write their recommendation here

No account or API key is required to try the core loop. Data persists locally in a
git-ignored SQLite file at `data/relay.db` — delete that file (or the whole `data/` folder) to
reset to a clean state.

## Enabling real AI adaptation

Without any configuration, recommendation text is adapted with a simple deterministic
formatter (trims to each platform's character limit on a sentence boundary) — the app is fully
usable this way, and every adapted variant is labeled "Adapted with simple formatting" so it's
honest about which mode produced it.

To turn on real AI-adapted variants (tone-aware, not just length-trimmed), set an environment
variable before starting the dev server:

```bash
AI_GATEWAY_API_KEY=your_key npm run dev
```

Get a key from the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway). Once this repo is
linked to a Vercel project (`vercel link`), prefer `vercel env pull` (OIDC) over a manually
rotated key.

## What's not built yet

Per the design doc's incremental build plan, this repo currently covers the write-once/adapt
core loop and freelancer request tracking (data model Next Steps 1–5). Not yet built: reminder
scheduling/resurfacing, the quote library, and conversion tracking (Next Steps 6–10) — these are
explicitly gated on validating that the core loop gets real use first, and need real
transactional email infrastructure this environment doesn't have configured.

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui (`base-nova`, on `@base-ui/react`) ·
Vercel AI SDK (with a no-AI fallback) · SQLite for local dev persistence (swap for Supabase in
production — the whole data layer goes through `src/lib/db/repository.ts`).
