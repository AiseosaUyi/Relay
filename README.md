# Relay

A personal tool for collecting client recommendations. You send a client one link. They write
their recommendation once, and Relay gets it ready for every place it belongs: LinkedIn, Contra,
Malt and other profile platforms, posts from their own account, review sites like Clutch or
Google, and quotes for your own site and proposals.

Nothing is ever posted for anyone. Every platform makes the client submit it themselves, so
Relay drafts, tracks and reminds. Upwork was dropped in Oct 2026 when it stopped accepting new
testimonial requests. The research behind every destination is in `BUILD_PLAN.md`.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `OWNER_PASSWORD` set, local dev skips the login. Data lives
in `data/relay-v2.db` (git-ignored). Delete it to start over.

## How it works

1. **Settings** (first run). Your name, the profile and review links clients need, and the
   destinations new requests start with.
2. **New request.** Client name, optional email and context, which destinations apply. You get a
   link plus a message you can paste into WhatsApp or email. Relay never sends anything.
3. **Client page** (`/r/[slug]`). The client writes once, optionally lets you quote them, and
   gets an editable version per destination with step by step instructions. They can redo
   versions up to 3 times per link, or switch any version back to their exact words.
4. **Request page.** What they wrote, every version, your part on each platform, and buttons to
   mark "I sent the platform request" and "Live".

### Destination groups

| Group | Text | Who sees it |
|---|---|---|
| Profile recommendations (LinkedIn, Contra, Malt, Twine, Codeur, YunoJuno, Fiverr Pro, LinkedIn Services, ProZ) | AI adapted, client edits | Client |
| Posts from the client's account (X, LinkedIn) | AI adapted, client edits | Client |
| Review sites (Clutch, Google, Trustpilot, Sortlist, Bark, Thumbtack, Facebook) | The client's own words, never AI. These sites forbid pre-written reviews | Client |
| Your own assets (website testimonial, case study quote, proposal quote, one-liner) | AI adapted | You, only if the client consented |

## AI adaptation

Set `AI_GATEWAY_API_KEY` (Vercel AI Gateway) to turn it on. Default model is
`anthropic/claude-haiku-4.5`, about $0.005 to $0.01 per recommendation. Without a key, Relay
trims the client's own words to fit each limit and labels them as not AI adapted.

## Deploy for free

1. **Database.** Create a free Turso database, then set `DATABASE_URL` (libsql://...) and
   `DATABASE_AUTH_TOKEN`. Tables are created on first request.
2. **Vercel.** Import this repo on the Hobby plan. Set `OWNER_PASSWORD`, the two database
   variables and, optionally, `AI_GATEWAY_API_KEY`.
3. **AI budget.** In the AI Gateway dashboard, add $5 of credit and a monthly budget so a leaked
   link can never cost more than that.

See `.env.example` for every variable.

## Stack

Next.js 16 (App Router, server actions) · TypeScript · Tailwind v4 · shadcn/ui on Base UI ·
Vercel AI SDK v7 · libSQL (`@libsql/client`, local file or Turso).
