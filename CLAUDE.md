# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Recommendation Relay ("Relay"): a client writes one recommendation for a freelancer, and the
app adapts it (length + tone) for LinkedIn, Upwork, and Contra — the only three
freelance/design platforms with a client-recommendation feature. No platform lets a third
party post on someone's behalf, so this is a drafting + tracking assistant, not an
auto-poster: the client still submits it themselves on each platform; this tool just gives
them a pre-written, correctly-sized version to paste in when that platform's native request
arrives.

## Commands

```bash
npm run dev      # start dev server (localhost:3000, falls back to next free port)
npm run build    # production build
npm run lint     # eslint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # typecheck (no separate script defined)
```

No test suite is configured in this repo.

To enable real AI-adapted variants (tone-aware, not just length-trimmed), set
`AI_GATEWAY_API_KEY` before starting the dev server (get a key from the Vercel AI Gateway).
Without it, the app runs fully on a deterministic fallback adapter — this is the default state
for a fresh clone, and it's a normal, demoable mode, not a broken one.

Local data persists in a git-ignored SQLite file at `data/relay.db`. Delete `data/` to reset
to a clean state.

## Architecture

**Core data flow:** `freelancer` (1) → `requests` (many, one per client) → `variants` (many,
one row per platform per request). A request is created with a fixed set of platforms; each
gets its own variant row (`pending` until the client submits text, then `adapted`). See
`src/lib/db/client.ts` for the schema.

**Routes and what happens in each:**
- `/` — marketing/landing page.
- `/new` — freelancer onboarding (first visit, captures a name) or adds a new client request to
  an existing freelancer. On submit, sets an httpOnly cookie and redirects to the dashboard.
- `/dashboard/[slug]` — freelancer's request list, reached via the cookie or the URL slug
  directly (no login).
- `/r/[slug]` — the link sent to the client. They write one recommendation; submitting it
  triggers adaptation and shows per-platform tabs with copy-ready text and instructions for
  when to paste it in.

**Identity has no auth layer.** A freelancer is identified purely by an httpOnly cookie
(`relay_freelancer_slug`) mapping to their `freelancer.slug`. There's no login, no email
verification, and no account-recovery path — clearing cookies loses dashboard access
permanently. This is a known, deliberate gap (not an oversight to silently "fix"); changing it
is a product decision, not a UI fix.

**Adaptation core loop** (`src/lib/adaptation/adapt.ts`): `adaptRecommendation()` branches on
whether `AI_GATEWAY_API_KEY` is set. AI path uses the Vercel AI Gateway
(`anthropic/claude-haiku-4.5` via the `ai` SDK) with a per-platform Zod schema built from
`src/lib/adaptation/platforms.ts`. The fallback path is a deterministic sentence-boundary
truncation to each platform's char limit — no tone rewriting. Both paths return the identical
`AdaptedVariant[]` shape, and every variant carries `generatedBy: "ai" | "fallback"` so the UI
can honestly label which mode produced it (never claim AI when it wasn't used).

**`src/lib/adaptation/platforms.ts` is the single source of truth** for platform metadata
(label, char limit, tone description, per-platform instruction copy) — it drives both the AI
prompt construction and every platform-facing UI element. Contra's char limit is an
unverified/best-guess value (flagged in-file); don't treat it as confirmed.

**Data layer boundary:** every DB call goes through `src/lib/db/repository.ts`.
`src/lib/db/client.ts` is the only file that owns the actual connection (SQLite via
`better-sqlite3`, dev-only) — it's the documented swap point for Supabase in production. Don't
call `better-sqlite3` directly from route/component code; add a repository function instead.

**Icon system** (`src/components/icons/platform-icon.tsx`): one lookup (`PlatformIcon`) used
everywhere a platform needs a visual mark, so brand icons aren't hand-duplicated per call site.
Icons render in `currentColor` (state-driven via the parent's text-color class — muted at rest,
primary/foreground when selected/active), never a hardcoded brand hex. Marks come from
`react-icons`/`simple-icons` only where verified accurate; a platform without a confirmed
source mark (currently Contra) degrades to a quiet wordmark badge rather than a guessed logo —
extend the registry with a real `{ kind: "mark", Icon }` entry the moment one is verified,
don't hand-draw a brand logo from memory.

**Never call `navigator.clipboard.writeText` directly.** Use `copyToClipboard()` from
`src/lib/utils.ts` for any copy-to-clipboard button. The raw Clipboard API can hang
indefinitely with no rejection (observed under automated/CDP-driven clicks, and plausible in
other constrained contexts) — `copyToClipboard` races it against a timeout and falls back to
`execCommand`, so it always resolves and the UI can show a real success/error state instead of
silently doing nothing.

**UI primitives are Base UI, not Radix.** `components.json` uses shadcn's `base-nova` style on
`@base-ui/react` — components like `button.tsx`/`badge.tsx` use Base UI's `useRender`/
`mergeProps`/`data-slot` patterns, not the Radix `Slot`/`asChild` API most shadcn examples
assume. Match that pattern when adding new UI primitives.

**Tailwind v4, no config file.** There's no `tailwind.config.ts`; all tokens (colors,
radius scale, fonts) are defined as CSS custom properties in `src/app/globals.css` under
`:root` / `.dark` / `@theme inline`. Add new design tokens there, not in a JS config.

**Theme is pinned to light.** `ThemeProvider` in `src/app/layout.tsx` uses
`forcedTheme="light"` — dark-mode CSS variables still exist in `globals.css` (`.dark { ... }`)
but are intentionally not served; there's no theme toggle anywhere. Don't add `dark:` variants
to new components — light is the only supported experience right now.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
