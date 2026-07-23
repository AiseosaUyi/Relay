# Launch checklist

Everything standing between this repo and a real, working production deployment. Grouped
in the order you'd actually tackle them — each phase mostly unblocks the next. Items marked
**DECISION** need a call from you before any code gets written; everything else is just work.

Current state: no git remote, no `.env*` files, no Vercel project linked, SQLite-only,
in-memory rate limiting, cookie-only identity. Nothing here is deployed anywhere yet.

---

## 0. Get the repo somewhere Vercel can see it

- [ ] Create a GitHub (or GitLab) repo and push `main` to it — there's currently no git
      remote configured at all, and Vercel's normal flow deploys from a git integration.
- [ ] **DECISION:** GitHub vs GitLab (whichever you already use elsewhere).

## 1. Database: swap SQLite for Supabase

This is the one true blocker — Vercel's serverless functions have an ephemeral filesystem,
so `data/relay.db` (`src/lib/db/client.ts`) gets wiped on every cold start in production.
The README and `CLAUDE.md` already name Supabase as the intended swap target.

- [ ] Create a Supabase project, grab the Postgres connection string.
- [ ] Port the schema in `src/lib/db/client.ts` (`freelancers`, `requests`, `variants`) to
      Postgres — types mostly carry over (`TEXT`, `INTEGER`), a couple of things don't:
      SQLite's `INTEGER NOT NULL DEFAULT 0` boolean pattern (`resurfacing_disabled`) should
      become a real `BOOLEAN` in Postgres if you're rewriting the schema anyway.
- [ ] Pick a Postgres client (`postgres`/`pg`, or the Supabase JS client, or an ORM like
      Drizzle if you want migrations management — no strong existing convention here since
      the current code is raw SQL via `better-sqlite3`).
- [ ] Rewrite `src/lib/db/client.ts` and every query in `src/lib/db/repository.ts` — the
      repository's function signatures are the contract; every call site
      (`src/app/**/actions.ts`, `src/app/**/page.tsx`) only imports from
      `repository.ts` and never touches the client directly, so this should be a contained
      swap, not a app-wide rewrite.
- [ ] Remove `better-sqlite3` and its `@types` package once the swap is done (it's a native
      module — no reason to ship it or make Vercel compile it).
- [ ] **DECISION:** raw SQL (matches current style) vs an ORM (more scaffolding, easier
      migrations going forward). No strong signal either way from the existing code.

## 2. Rate limiting: make it survive serverless

`src/app/r/[slug]/actions.ts` currently rate-limits with an in-memory `Map` — resets on
every cold start and doesn't share state across concurrent function instances, so it's not
a real guard once deployed.

- [ ] **DECISION:** Upstash Redis (Vercel Marketplace, purpose-built for this, adds a
      dependency) vs. a `rate_limits` table in the Supabase Postgres you're already
      standing up (no new service, one more table). Given you're already adding Postgres in
      step 1, the table option avoids a second piece of infrastructure — lean that way
      unless you expect rate-limit-checking volume high enough to want Redis's speed.
- [ ] Implement whichever, replacing `submissionAttempts`/`checkRateLimit` in
      `src/app/r/[slug]/actions.ts`.

## 3. AI Gateway (optional but the whole point of the "adapt" feature)

Without this, every deployment runs on the deterministic fallback adapter forever — honest
and functional, but not what the product is named for.

- [ ] `vercel link` this project once it exists on Vercel (needs step 0 + a Vercel project
      created — chicken/egg with step 4, do them together).
- [ ] Get an AI Gateway key. Per the README, once linked, prefer `vercel env pull` (OIDC)
      over a manually-rotated `AI_GATEWAY_API_KEY` — no manual key to leak or rotate.
- [ ] **DECISION:** ship without this on day one (fallback-only, honestly labeled) and turn
      it on later, or block launch on having it configured. Nothing in the code requires
      picking now — `adaptRecommendation()` in `src/lib/adaptation/adapt.ts` already
      branches cleanly on whether the key is set.

## 4. Vercel project setup

- [ ] Create the Vercel project, connect the git repo from step 0.
- [ ] Set environment variables in the Vercel dashboard: Supabase connection string(s),
      `AI_GATEWAY_API_KEY` if using the manual-key path from step 3.
- [ ] Confirm the build actually succeeds on Vercel once `better-sqlite3` is gone (it's the
      one dependency in `package.json` that needed native compilation — everything else is
      pure JS/TS and should build fine).
- [ ] **DECISION:** custom domain vs. the default `*.vercel.app` subdomain for initial
      launch.

## 5. Identity model — the one real product decision

Flagged repeatedly (`CLAUDE.md`, the QA pass) and still open: a freelancer is identified by
a single httpOnly cookie (`relay_freelancer_slug`, set in `src/app/new/actions.ts`) with no
login and no recovery path. Clearing cookies loses dashboard access permanently, for real
users, in production.

- [ ] **DECISION:** ship as-is for a first real-user test (acceptable if this is a small,
      low-stakes beta — the core loop doesn't strictly need accounts to prove itself) vs.
      add lightweight auth (e.g. magic-link email, which would also finally give a use for
      the currently-unused `client_email` field... though that's the *client's* email, not
      the freelancer's — a freelancer login needs its own email capture, not currently
      collected anywhere in `src/app/new/new-request-form.tsx`).
- [ ] If adding auth: pick a provider (Supabase Auth is the obvious choice since Supabase is
      already in the stack from step 1) and scope how much of the flow changes.
- [ ] While touching the cookie regardless: `cookieStore.set` in `src/app/new/actions.ts`
      doesn't set `secure: true`. Add it for production — currently harmless on `sameSite:
      "lax"` over HTTPS in modern browsers, but it should be explicit, not implicit.

## 6. Pre-launch smoke test

- [ ] Re-run the same sweep from the earlier QA pass, but against the deployed Vercel URL
      with real Supabase behind it: onboarding → new request → copy link → client
      recommendation flow → dashboard stats update → 404 handling.
- [ ] Specifically re-verify the rate limiter and copy-to-clipboard fixes under real network
      latency (both were fixed against local dev; Postgres round-trip time changes the
      rate-limiter's timing characteristics even though the logic is the same).
- [ ] Check cookie behavior end-to-end on the real domain (not just localhost).

## Not blocking launch, but worth deciding consciously

- `client_email` is captured on every request but nothing reads it — either wire up actual
  email notifications (needs an email provider: Resend, Postmark, etc. — new dependency,
  new scope) or leave it collected-but-unused for v1 and say so explicitly rather than by
  accident.
- No error/monitoring tooling (Sentry or similar) — fine to skip for a first small launch,
  worth adding once there's real traffic to worry about.
