# Relay build plan

Scope as of 2 Oct 2026. Relay is a personal tool for one owner, not a product for other people yet. The self-tool build below is done on the `self-tool` branch. The multi-user plan is kept at the end for later.

Research date 2 Oct 2026. Raw findings with every source live in the session research folder (`relay-launch-research/results/*.json`). This file is the plan we build from.

## What changed after research

1. Upwork is gone. Upwork stopped accepting new testimonial requests in 2026 ([Upwork Help](https://support.upwork.com/hc/en-us/articles/1500002004322-About-testimonials-on-your-profile)). Only contract reviews remain and those need a real Upwork contract. Upwork is removed from the product.
2. Relay stops being "three platforms" and becomes a destination engine. Research found more than 20 places a client can leave a written recommendation or review. Only some accept a client who did not hire through that platform, and they fall into three groups that need different handling (below).
3. AI rewriting is not allowed everywhere. Google now bars asking for reviews "that include specific content" ([Google Business Profile](https://support.google.com/business/answer/3474122)), Trustpilot prohibits AI generated review content ([Trustpilot guidelines](https://legal.trustpilot.com/for-businesses/guidelines-for-businesses/1)), Clutch requires reviews be completed directly by the client, and the FTC fake review rule (in force Oct 2024) covers reviews that misrepresent the reviewer. So review sites get the client's own words and a neutral link, never adapted text.
4. Positioning. Senja, Testimonial.to, Shapo and TheyLuvIt all collect testimonials for your own website. None gets a recommendation onto LinkedIn, Contra, Malt and the rest. Line we build toward. "Your client writes it once. It lands on every profile that matters."

## Destination registry

Every destination is a row in `src/lib/destinations/registry.ts`. Each row has id, label, group, audience tags, target and max length, how the request starts, what the freelancer must set up, client instructions, freelancer checklist, and a `verified` flag for anything we have not confirmed with a primary source.

### Group A. Profile recommendations (AI adapted, client edits and approves)
Off platform clients allowed, plain text, client submits in their own name.

| Destination | How it starts | Length | Audience | Notes |
|---|---|---|---|---|
| LinkedIn recommendation | Freelancer sends request in LinkedIn, or client uses More then Recommend on the profile | 3,000 max (live form counter), target 600 to 1,200 | everyone | 1st degree connection required. Message title "Write [name] a recommendation". Deep link to the write form not possible, link the profile ([LinkedIn Help](https://www.linkedin.com/help/linkedin/answer/a546682)) |
| Contra review | Freelancer sends Profile > Reviews > Request a review | unpublished, target 300 to 550 | designers, devs | Renamed from recommendations. Client makes a free hiring account. Contra approves daily ([Contra Help](https://help.contra.com/en/articles/9322989-contra-recommendations)) |
| Malt recommendation | Freelancer email invite, single use link, Malt sends 3 reminders | unpublished | EU freelancers | Client creates light account ([Malt Help](https://help.malt.com/l/en/article/mo6fjwfdkt-how-do-i-get-recommended-on-malt)) |
| Twine testimonial | Freelancer email invite | unpublished | creatives | Unlimited requests ([Twine Help](https://help.twine.net/en/article/how-to-add-testimonials-1brotf7/)) |
| Codeur.com recommandation | Freelancer email invite, max 20 | unpublished | French market | |
| YunoJuno reference | Freelancer email invite to client work email | unpublished | UK creatives | Private by default |
| Fiverr Pro client recommendation | Freelancer request on Pro profile | 600 [unverified] | Fiverr Pro only, under 3 reviews | Business email domain, max 5 shown, 2 week review ([Fiverr Help](https://help.fiverr.com/hc/en-us/articles/29452732859153-Client-recommendations)) |
| LinkedIn Services page review | Freelancer invite inside LinkedIn | unpublished | LinkedIn service providers | Stars plus text, separate from recommendations [launch era info, unverified] |
| ProZ WWA | Shareable form | unpublished | translators | |

### Group B. Public review sites (client's own words only, no AI rewrite)
Relay shows the client their original text, the neutral link, and length guidance. No suggested content, no incentives, ask every client not only happy ones.

| Destination | Link | Audience | Notes |
|---|---|---|---|
| Clutch | Custom review link from free profile | studios, agencies | Long structured form, client must prove project |
| Google Business Profile | `search.google.com/local/writereview?placeid=` [format unverified] | freelancers who meet clients in person | Online only businesses do not qualify |
| Trustpilot | Business invite link, 50 invites a month free | studios with a domain | Neutral invitations only |
| Sortlist | Shareable link | agencies | |
| Bark, Thumbtack | Shareable profile review link | local service pros | Thumbtack caps off platform reviews |
| Facebook Page | `facebook.com/{page}/reviews` | freelancers with a Page | 25 char minimum |

### Group C. Posts and owner assets
Posts the client publishes from their own account (X, LinkedIn) are AI adapted and client approved. Owner assets are only shown to the owner when the client ticks public use consent. Website testimonial (short pull quote plus full paragraph), case study quote, proposal or deck quote (60 to 90 words), one line credential, client shoutout post for X (280) or LinkedIn (hook under 140 chars) that the client posts from their own account. Plus a follow up for designers. Once a review is live on Contra or LinkedIn, submit it to Dribbble's import at dribbble.com/submit-client-reviews [acceptance unverified].

### Not supported (documented so we stop re-researching)
Upwork (retired), Fiverr standard, Freelancer.com, PeoplePerHour, Guru, Workana, Braintrust, Behance, Dribbble native, 99designs, DesignCrowd, Truelancer, Preply (all only for clients who hired there). Toptal, Gun.io, Arc.dev, Wellfound, Working Not Working, Freelancermap, GitHub, X, Substack, Medium (no feature). Yelp (forbids asking). G2, Capterra (software only). Polywork, Read.cv, Superpeer, bento.me (shut down).

## Self-tool build (done on `self-tool`)

- Upwork removed everywhere. Destination registry with 22 destinations in four groups (profile, post, review, owned).
- AI fix. No zod `.max()`, lengths in `.describe()`, trim after. Per destination fallback to the client's own words. `instructions` instead of deprecated `system`, output token cap, 25s timeout.
- libSQL data layer (`@libsql/client`). Local file in dev, free Turso database in production. `better-sqlite3` removed.
- Single owner password (`OWNER_PASSWORD`) instead of accounts.
- Settings page for name, role, profile and review links, default destinations.
- New request with context note and grouped destination picker. Request page with a paste-ready invite message, every version, your steps per platform, "I sent the request" and "Mark live".
- Client page. Write once, optional consent, editable version per destination, "New version" (3 per link), "Use my exact words", copy tracking, review sites with own words and links, everything persists on reload.
- Cost guard. One adaptation plus 3 redos per link, edits never call the AI.

### Costs for a self tool
Vercel Hobby, Turso free and no email service, so $0 a month. AI is the only spend, a fraction of a cent per recommendation on OpenAI. Set a small monthly limit in the OpenAI dashboard, or run without a key and Relay trims the client's words instead of rewriting.

### Your setup
1. Create a free Turso database, copy its URL and token.
2. Import the repo on Vercel Hobby, set `OWNER_PASSWORD`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, optionally `OPENAI_API_KEY`.
3. Settings, fill in your profile links.
4. Optional. Send one Contra review request to a second email of yours to confirm the client form and the character limit.

## Later, if Relay becomes a product
Supabase with magic link accounts and RLS, Postgres rate limits plus BotID and a WAF rule, Resend for invites and day 3 and day 7 reminders with pg_cron and one click unsubscribe, privacy and terms pages. Email templates can be ported from reviewsup.io (MIT, keep the notice). reviews-kits (AGPL) for ideas only. Competitors (Senja, Testimonial.to, Shapo, TheyLuvIt) charge $9 to $59 a month and none gets recommendations onto LinkedIn or Contra.

## Open questions
Contra limit and edit rules. LinkedIn Services review details. Fiverr Pro 600 limit. Google review link format. Whether Turso archives idle free databases (check before relying on it, Neon is the fallback).
