export type Platform = "linkedin" | "upwork" | "contra";

export type PlatformConfig = {
  id: Platform;
  label: string;
  monogram: string;
  /**
   * Character limits below are best-available approximations, not confirmed
   * platform documentation (per the design doc's open question — Contra in
   * particular is unverified). Treated as safe, conservative ceilings so
   * generated text is never rejected as too long; revisit once confirmed.
   */
  charLimit: number;
  tone: string;
  instruction: (freelancerName: string) => string;
};

export const PLATFORMS: Record<Platform, PlatformConfig> = {
  linkedin: {
    id: "linkedin",
    label: "LinkedIn",
    monogram: "Li",
    charLimit: 3000,
    tone:
      "Warm and relationship-focused. LinkedIn recommendations read like a professional reference — mention how you worked together and what kind of collaborator they were, not just the deliverable.",
    instruction: (name) =>
      `You'll get a message from ${name} on LinkedIn asking you to write a recommendation. When it arrives, paste this in.`,
  },
  upwork: {
    id: "upwork",
    label: "Upwork",
    monogram: "Up",
    charLimit: 1500,
    tone:
      "Results and outcome-focused. Upwork testimonials are read by prospective clients scanning for proof of delivery — lead with the concrete result, keep it tight.",
    instruction: (name) =>
      `You'll get an email from Upwork (sent on ${name}'s behalf) with a form to fill in. Paste this into it.`,
  },
  contra: {
    id: "contra",
    label: "Contra",
    monogram: "Co",
    // Contra's exact limit is unverified (design doc confidence flag) —
    // using a conservative middle ground between LinkedIn and Upwork.
    charLimit: 1200,
    tone:
      "Portfolio and craft-focused. Contra profiles are visual and project-driven — reference the specific work or project where it fits naturally.",
    instruction: (name) =>
      `You'll get a prompt from Contra (triggered by ${name}) asking for a recommendation. Paste this in when it shows up.`,
  },
};

export const PLATFORM_LIST = Object.values(PLATFORMS);
