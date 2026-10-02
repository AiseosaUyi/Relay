/**
 * Single source of truth for every place a recommendation can end up.
 *
 * Groups decide how text is produced and who sees it:
 * - "profile": a recommendation the client submits on the freelancer's profile
 *   (LinkedIn, Contra, Malt...). AI adapts it, the client edits and approves.
 * - "post": a public post the client publishes from their own account. AI
 *   adapts it, the client edits and approves.
 * - "review": a public review site (Clutch, Google, Trustpilot...). These
 *   platforms forbid pre-written or AI-written reviews, so the client gets
 *   their own original words, a link and neutral instructions. Never AI.
 * - "owned": assets the freelancer uses on their own site, proposals and
 *   case studies. Only generated when the client consents to public use.
 *   Shown to the freelancer, not the client.
 *
 * Research notes (Oct 2026) live in BUILD_PLAN.md. Anything we could not
 * confirm from a primary source is marked `verified: false` so the UI can be
 * honest about it.
 */

export type DestinationGroup = "profile" | "post" | "review" | "owned";

export const DESTINATION_IDS = [
  "linkedin",
  "contra",
  "malt",
  "twine",
  "codeur",
  "yunojuno",
  "fiverr_pro",
  "linkedin_services",
  "proz",
  "x_post",
  "linkedin_post",
  "clutch",
  "google",
  "trustpilot",
  "sortlist",
  "bark",
  "thumbtack",
  "facebook",
  "site_quote",
  "case_study",
  "proposal_quote",
  "one_liner",
] as const;

export type DestinationId = (typeof DESTINATION_IDS)[number];

/** Keys of links/handles the owner saves once in Settings. */
export const LINK_KEYS = [
  "linkedin",
  "contra",
  "malt",
  "twine",
  "codeur",
  "fiverr",
  "proz",
  "clutch",
  "google",
  "trustpilot",
  "sortlist",
  "bark",
  "thumbtack",
  "facebook",
  "x",
] as const;

export type LinkKey = (typeof LINK_KEYS)[number];
export type OwnerLinks = Partial<Record<LinkKey, string>>;

export type LinkField = {
  key: LinkKey;
  label: string;
  placeholder: string;
  help?: string;
};

export type StepContext = {
  ownerName: string;
  link?: string;
};

export type Destination = {
  id: DestinationId;
  label: string;
  group: DestinationGroup;
  /** Who this is useful for, shown when picking destinations. */
  audience: string;
  /** Hard ceiling. Text is trimmed to fit. */
  maxChars: number;
  /** Sweet spot the AI aims for. */
  target: [number, number];
  /** Short tag for the icon fallback. */
  monogram: string;
  /** False when the flow or limit could not be confirmed from a primary source. */
  verified: boolean;
  /** Tone and format guidance for the AI. Not used for "review". */
  tone?: string;
  /** Link the owner saves in Settings that the client needs. */
  link?: LinkKey;
  /** What the client does, in order. */
  clientSteps: (ctx: StepContext) => string[];
  /** What the owner has to do on the platform first, if anything. */
  ownerSteps?: (ctx: StepContext) => string[];
  /** Extra caveat for the client or owner. */
  note?: string;
};

export const LINK_FIELDS: Record<LinkKey, LinkField> = {
  linkedin: {
    key: "linkedin",
    label: "LinkedIn profile URL",
    placeholder: "https://www.linkedin.com/in/your-handle",
  },
  contra: {
    key: "contra",
    label: "Contra profile URL",
    placeholder: "https://contra.com/your-handle",
  },
  malt: { key: "malt", label: "Malt profile URL", placeholder: "https://www.malt.com/profile/..." },
  twine: { key: "twine", label: "Twine profile URL", placeholder: "https://www.twine.net/..." },
  codeur: { key: "codeur", label: "Codeur.com profile URL", placeholder: "https://www.codeur.com/-..." },
  fiverr: { key: "fiverr", label: "Fiverr profile URL", placeholder: "https://www.fiverr.com/..." },
  proz: {
    key: "proz",
    label: "ProZ feedback request link",
    placeholder: "https://www.proz.com/translator-feedback/...",
  },
  clutch: {
    key: "clutch",
    label: "Clutch review link",
    placeholder: "https://clutch.co/review/...",
    help: "From your Clutch dashboard, the custom review link.",
  },
  google: {
    key: "google",
    label: "Google review link",
    placeholder: "https://g.page/r/.../review",
    help: "From your Business Profile, Ask for reviews, copy link. Only for businesses that meet clients in person.",
  },
  trustpilot: {
    key: "trustpilot",
    label: "Trustpilot review link",
    placeholder: "https://www.trustpilot.com/evaluate/yourdomain.com",
  },
  sortlist: { key: "sortlist", label: "Sortlist review link", placeholder: "https://www.sortlist.com/..." },
  bark: { key: "bark", label: "Bark profile link", placeholder: "https://www.bark.com/en/company/..." },
  thumbtack: {
    key: "thumbtack",
    label: "Thumbtack review link",
    placeholder: "https://www.thumbtack.com/...",
    help: "Profile, Reviews, Copy shareable link.",
  },
  facebook: {
    key: "facebook",
    label: "Facebook Page URL",
    placeholder: "https://www.facebook.com/yourpage",
  },
  x: { key: "x", label: "X handle", placeholder: "@yourhandle" },
};

const keepOwnWords =
  "These sites don't allow pre-written reviews, so this is exactly what you wrote. Change it however you like when you post it.";

export const DESTINATIONS: Record<DestinationId, Destination> = {
  // ── Profile recommendations ────────────────────────────────────────────
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    group: "profile",
    audience: "Everyone",
    maxChars: 3000,
    target: [500, 1200],
    monogram: "in",
    verified: true,
    link: "linkedin",
    tone:
      "LinkedIn recommendation, written by the client in first person (I, we) about the freelancer, who is referred to by name or with the pronoun the client used. Never mention the client by name. Open with how they worked together, then what the freelancer did. Warm and professional, no hashtags, no emojis.",
    clientSteps: ({ ownerName, link }) => [
      `Watch for a LinkedIn message titled "Write ${ownerName} a recommendation" and paste this in.`,
      link
        ? `Or go to ${ownerName}'s profile now (${link}), click More, then Recommend, and paste it there.`
        : `Or open ${ownerName}'s profile, click More, then Recommend, and paste it there.`,
      "You need to be connected on LinkedIn for either option.",
    ],
    ownerSteps: () => [
      "Make sure you're a 1st-degree connection.",
      "On their profile, More, Request a recommendation. Pick the relationship and your position at the time.",
      "When it arrives, Add to profile.",
    ],
  },
  contra: {
    id: "contra",
    label: "Contra",
    group: "profile",
    audience: "Designers, developers, creatives",
    maxChars: 1200,
    target: [300, 550],
    monogram: "Co",
    verified: false,
    link: "contra",
    tone:
      "Contra review. Short and specific, first person from the client. Reference the project or the craft. Two to four sentences.",
    clientSteps: ({ ownerName }) => [
      `Watch for an email from Contra asking you to review ${ownerName}.`,
      "If you don't have a Contra account, it'll ask you to create a free one.",
      "Pick a star rating and paste this in.",
    ],
    ownerSteps: () => [
      "Profile, Reviews, Request a review. Use the same email you saved for this client.",
    ],
    note: "Contra checks every review before it shows on the profile. Its character limit isn't published.",
  },
  malt: {
    id: "malt",
    label: "Malt",
    group: "profile",
    audience: "Freelancers in Europe",
    maxChars: 1500,
    target: [300, 700],
    monogram: "Ma",
    verified: false,
    link: "malt",
    tone: "Malt recommendation. First person from the client, specific about the mission and the result. Professional.",
    clientSteps: ({ ownerName }) => [
      `Watch for an email from Malt on behalf of ${ownerName}. The link in it only works once.`,
      "Fill in your company and job title, then paste this into the comment.",
    ],
    ownerSteps: () => [
      "Dashboard, Advertise yourself, Recommendations. Send the request to this client's email.",
    ],
  },
  twine: {
    id: "twine",
    label: "Twine",
    group: "profile",
    audience: "Creatives",
    maxChars: 1500,
    target: [250, 600],
    monogram: "Tw",
    verified: false,
    link: "twine",
    tone: "Twine testimonial. First person from the client, about the creative work and the collaboration.",
    clientSteps: ({ ownerName }) => [
      `Watch for an email from Twine asking for a testimonial for ${ownerName}, then paste this in.`,
    ],
    ownerSteps: () => ["Profile, Testimonials, Manage, Add new testimonial. Enter this client's name and email."],
  },
  codeur: {
    id: "codeur",
    label: "Codeur.com",
    group: "profile",
    audience: "French market",
    maxChars: 1500,
    target: [250, 600],
    monogram: "Cd",
    verified: false,
    link: "codeur",
    tone: "Codeur.com recommandation. First person from the client. Keep the client's language. If the original is in French, write in French.",
    clientSteps: ({ ownerName }) => [
      `Watch for an email from Codeur.com asking you to recommend ${ownerName}, then paste this in.`,
    ],
    ownerSteps: () => ["Profil, Recommandations, Demander une recommandation. Up to 20 requests."],
  },
  yunojuno: {
    id: "yunojuno",
    label: "YunoJuno",
    group: "profile",
    audience: "UK creative freelancers",
    maxChars: 1500,
    target: [250, 600],
    monogram: "YJ",
    verified: false,
    tone: "YunoJuno reference. First person from the client, factual and professional, like a work reference.",
    clientSteps: ({ ownerName }) => [
      `Watch for a reference request from YunoJuno about ${ownerName}, sent to your work email, then paste this in.`,
    ],
    ownerSteps: () => ["Work History, Validate. Use the client's work email."],
    note: "References are private by default, the freelancer chooses whether to publish them.",
  },
  fiverr_pro: {
    id: "fiverr_pro",
    label: "Fiverr Pro",
    group: "profile",
    audience: "Fiverr Pro sellers with under 3 reviews",
    maxChars: 600,
    target: [200, 500],
    monogram: "Fv",
    verified: false,
    link: "fiverr",
    tone: "Fiverr Pro client recommendation. First person from the client, outcome first, concise.",
    clientSteps: ({ ownerName }) => [
      `Watch for an email from Fiverr asking you to recommend ${ownerName}, then paste this in.`,
      "Fiverr needs a business email address, not Gmail or similar.",
    ],
    ownerSteps: () => ["Pro profile, Recommendations. Fiverr reviews each one, up to 2 weeks."],
    note: "The 600 character limit is from Fiverr's form and isn't confirmed for the text itself.",
  },
  linkedin_services: {
    id: "linkedin_services",
    label: "LinkedIn Services review",
    group: "profile",
    audience: "People with a LinkedIn Services page",
    maxChars: 1500,
    target: [200, 600],
    monogram: "inS",
    verified: false,
    link: "linkedin",
    tone: "Review of a service provider. First person from the client, about the service and the result. Short.",
    clientSteps: ({ ownerName }) => [
      `Watch for a LinkedIn invite to review ${ownerName}'s services. Pick a star rating and paste this in.`,
    ],
    ownerSteps: () => ["Services page, Request reviews. Separate from recommendations."],
  },
  proz: {
    id: "proz",
    label: "ProZ.com",
    group: "profile",
    audience: "Translators",
    maxChars: 1500,
    target: [200, 500],
    monogram: "Pz",
    verified: false,
    link: "proz",
    tone: "ProZ Willingness to Work Again comment. First person from the client, about quality and reliability of the translation work.",
    clientSteps: ({ ownerName, link }) => [
      link
        ? `Open ${ownerName}'s ProZ feedback form (${link}) and paste this into the comment.`
        : `Open the ProZ feedback link ${ownerName} sends you and paste this into the comment.`,
    ],
  },

  // ── Posts from the client's own account ───────────────────────────────
  x_post: {
    id: "x_post",
    label: "X post",
    group: "post",
    audience: "Clients active on X",
    maxChars: 260,
    target: [120, 240],
    monogram: "X",
    verified: true,
    link: "x",
    tone: "A short public shoutout post from the client's own X account. First person, specific, no hashtags. Leave room for the freelancer's handle, which will be added after.",
    clientSteps: ({ ownerName, link }) => [
      `Post this from your account${link ? ` and tag ${link}` : ` and tag ${ownerName}`}.`,
    ],
  },
  linkedin_post: {
    id: "linkedin_post",
    label: "LinkedIn post",
    group: "post",
    audience: "Clients active on LinkedIn",
    maxChars: 3000,
    target: [300, 900],
    monogram: "inP",
    verified: true,
    tone: "A public LinkedIn post from the client's own account giving a shoutout. First person. The first line must work on its own as a hook under 140 characters. Short paragraphs, no hashtags, no emojis.",
    clientSteps: ({ ownerName }) => [
      `Post this from your LinkedIn and tag ${ownerName} with @ so it shows on their notifications.`,
    ],
  },

  // ── Review sites, own words only ──────────────────────────────────────
  clutch: {
    id: "clutch",
    label: "Clutch",
    group: "review",
    audience: "Studios and agencies",
    maxChars: 5000,
    target: [0, 0],
    monogram: "Cl",
    verified: true,
    link: "clutch",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open Clutch's review form for ${ownerName}: ${link}` : `Open the Clutch link ${ownerName} sends you.`,
      "Sign in with LinkedIn, Google or your work email. Clutch asks for proof of the project.",
      "The form asks several questions. Use what you wrote as a starting point.",
    ],
    note: keepOwnWords,
  },
  google: {
    id: "google",
    label: "Google",
    group: "review",
    audience: "Businesses that meet clients in person",
    maxChars: 4000,
    target: [0, 0],
    monogram: "G",
    verified: true,
    link: "google",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open ${ownerName}'s Google review page: ${link}` : `Open the Google review link ${ownerName} sends you.`,
      "You'll need to be signed in to a Google account.",
    ],
    note: keepOwnWords,
  },
  trustpilot: {
    id: "trustpilot",
    label: "Trustpilot",
    group: "review",
    audience: "Studios with their own domain",
    maxChars: 4000,
    target: [0, 0],
    monogram: "Tp",
    verified: true,
    link: "trustpilot",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open ${ownerName}'s Trustpilot page: ${link}` : `Open the Trustpilot link ${ownerName} sends you.`,
    ],
    note: keepOwnWords,
  },
  sortlist: {
    id: "sortlist",
    label: "Sortlist",
    group: "review",
    audience: "Agencies",
    maxChars: 4000,
    target: [0, 0],
    monogram: "So",
    verified: false,
    link: "sortlist",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open the Sortlist review page: ${link}` : `Open the Sortlist link ${ownerName} sends you.`,
      "Sortlist will ask you to confirm by email.",
    ],
    note: keepOwnWords,
  },
  bark: {
    id: "bark",
    label: "Bark",
    group: "review",
    audience: "Local service pros",
    maxChars: 4000,
    target: [0, 0],
    monogram: "Bk",
    verified: false,
    link: "bark",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open ${ownerName}'s Bark profile and leave a review: ${link}` : `Open the Bark link ${ownerName} sends you.`,
    ],
    note: keepOwnWords,
  },
  thumbtack: {
    id: "thumbtack",
    label: "Thumbtack",
    group: "review",
    audience: "Local service pros in the US",
    maxChars: 4000,
    target: [0, 0],
    monogram: "Th",
    verified: false,
    link: "thumbtack",
    clientSteps: ({ ownerName, link }) => [
      link ? `Open ${ownerName}'s Thumbtack review link: ${link}` : `Open the Thumbtack link ${ownerName} sends you.`,
    ],
    note: keepOwnWords,
  },
  facebook: {
    id: "facebook",
    label: "Facebook",
    group: "review",
    audience: "Freelancers with a Facebook Page",
    maxChars: 4000,
    target: [0, 0],
    monogram: "f",
    verified: false,
    link: "facebook",
    clientSteps: ({ ownerName, link }) => [
      link
        ? `Open ${link.replace(/\/$/, "")}/reviews, choose Yes to recommend, and add your words.`
        : `Open ${ownerName}'s Facebook Page, Reviews, choose Yes to recommend, and add your words.`,
    ],
    note: keepOwnWords,
  },

  // ── Owner assets, only with consent ───────────────────────────────────
  site_quote: {
    id: "site_quote",
    label: "Website testimonial",
    group: "owned",
    audience: "Your portfolio site",
    maxChars: 600,
    target: [150, 450],
    monogram: "Wb",
    verified: true,
    tone: "Website testimonial. One tight paragraph in the client's own voice, using only their words lightly trimmed.",
    clientSteps: () => [],
  },
  case_study: {
    id: "case_study",
    label: "Case study pull quote",
    group: "owned",
    audience: "Case studies",
    maxChars: 220,
    target: [60, 200],
    monogram: "Cs",
    verified: true,
    tone: "A single pull quote for a case study. One or two sentences, lifted from the client's words, the most specific and vivid part.",
    clientSteps: () => [],
  },
  proposal_quote: {
    id: "proposal_quote",
    label: "Proposal or deck quote",
    group: "owned",
    audience: "Proposals and pitch decks",
    maxChars: 500,
    target: [200, 450],
    monogram: "Pr",
    verified: true,
    tone: "A quote for a proposal or pitch deck, 40 to 80 words, outcome first, in the client's voice.",
    clientSteps: () => [],
  },
  one_liner: {
    id: "one_liner",
    label: "One-liner",
    group: "owned",
    audience: "Bios, email signature, social headers",
    maxChars: 120,
    target: [40, 110],
    monogram: "1L",
    verified: true,
    tone: "A single short line in the client's voice, under 110 characters, suitable for a bio or email signature.",
    clientSteps: () => [],
  },
};

export const DESTINATION_LIST = DESTINATION_IDS.map((id) => DESTINATIONS[id]);

export const GROUP_META: Record<DestinationGroup, { title: string; description: string }> = {
  profile: {
    title: "Profile recommendations",
    description: "Adapted per platform. The client edits and submits on each platform.",
  },
  post: {
    title: "Posts from the client's account",
    description: "Public shoutouts the client posts themselves.",
  },
  review: {
    title: "Review sites",
    description: "These sites forbid pre-written reviews, so the client gets their own words and a link.",
  },
  owned: {
    title: "For your own site and proposals",
    description: "Only shown to you if the client agrees you can quote them.",
  },
};

export const GROUP_ORDER: DestinationGroup[] = ["profile", "post", "review", "owned"];

export const DEFAULT_DESTINATIONS: DestinationId[] = [
  "linkedin",
  "contra",
  "site_quote",
  "case_study",
  "proposal_quote",
  "one_liner",
];

export function isDestinationId(value: string): value is DestinationId {
  return (DESTINATION_IDS as readonly string[]).includes(value);
}

export function parseDestinations(json: string | null | undefined): DestinationId[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v): v is DestinationId => typeof v === "string" && isDestinationId(v)) : [];
  } catch {
    return [];
  }
}

/** Groups whose text comes from AI (or the deterministic fallback). */
export function isAdaptedGroup(group: DestinationGroup) {
  return group !== "review";
}

/** Groups the client sees on their page. */
export function isClientFacing(group: DestinationGroup) {
  return group !== "owned";
}
