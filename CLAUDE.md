# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Relay: a personal, single-owner tool. A client writes one recommendation for the owner and
Relay gets it ready for every destination it belongs on (profile platforms, client posts,
review sites, the owner's own site and proposals). No platform lets a third party post on
someone's behalf, so this drafts, tracks and reminds. It never posts or sends anything.
Upwork is intentionally gone (it stopped accepting testimonial requests in 2026). Research and
sources per destination are in `BUILD_PLAN.md`.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck (run `npx next typegen` first on a fresh clone for PageProps)
```

No test suite is configured. Local data is a git-ignored libSQL file at `data/relay-v2.db`.

## Architecture

**Destinations** (`src/lib/destinations/registry.ts`) are the single source of truth: label,
group, max and target length, tone for the AI, the owner link it needs, client steps, owner
steps, and a `verified` flag for anything not confirmed from a primary source. Four groups:
- `profile` and `post`: AI adapted, the client edits and approves.
- `review`: the client's own words only. Review sites (Google, Trustpilot, Clutch) forbid
  pre-written or AI reviews, so never route these through the model.
- `owned`: assets for the owner. Generated with everything else but only shown to the owner
  when the client consented (`requests.consent_public`). Never shown on the client page.

**Data** goes through `src/lib/db/repository.ts` only. `src/lib/db/client.ts` owns the libSQL
connection (local file or Turso via `DATABASE_URL`) and creates tables on first use. Tables:
`settings` (single row), `requests`, `variants` (one per request and destination).

**Auth** (`src/lib/auth.ts`): one owner password (`OWNER_PASSWORD`), an HMAC cookie, and
`requireOwner()` at the top of every owner page and server action. No password in local dev
means open; no password in production means locked. The client page `/r/[slug]` is public.

**Routes:** `/dashboard`, `/new`, `/settings`, `/requests/[slug]` (owner), `/login`,
`/r/[slug]` (client). `/` redirects to the dashboard.

**Adaptation** (`src/lib/adaptation/adapt.ts`): one structured-output call for all adapted
destinations of a request. Length targets live in `.describe()`, not zod `.max()`, and are
enforced by trimming after generation (a `.max()` failure used to throw away the whole object).
Any AI failure falls back per destination to the client's own words trimmed to fit, labelled
`fallback`. AI is on when `OPENAI_API_KEY` is set (OpenAI only, via `@ai-sdk/openai`; default model `gpt-4.1-mini`,
override with `RELAY_AI_MODEL`).

**Cost guard:** public actions cap AI calls per link at one adaptation plus
`MAX_REGENERATIONS` (3). Edits, copies and consent changes never call the model. Also set a
monthly spend limit in the OpenAI dashboard.

**Icon system** (`src/components/icons/platform-icon.tsx`): one lookup (`PlatformIcon`) used
everywhere a destination needs a visual mark, so brand icons aren't hand-duplicated per call site.
Icons render in `currentColor` (state-driven via the parent's text-color class — muted at rest,
primary/foreground when selected/active), never a hardcoded brand hex. Marks come from
`react-icons`/`simple-icons` only where verified accurate; a platform without a confirmed
source mark (Contra, Clutch and others) degrades to its monogram badge rather than a guessed
logo. Add to `MARKS` the moment one is verified, don't hand-draw a brand logo from memory.

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
