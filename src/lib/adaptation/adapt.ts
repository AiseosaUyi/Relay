import { generateText, Output } from "ai";
import { z } from "zod";
import { PLATFORMS, type Platform } from "./platforms";

export type AdaptedVariant = {
  platform: Platform;
  text: string;
  generatedBy: "ai" | "fallback";
};

/**
 * Adapts a client's single recommendation into per-platform versions.
 *
 * Uses the Vercel AI Gateway when AI_GATEWAY_API_KEY is configured. When it
 * isn't (true for a fresh clone of this repo — no credentials are wired up
 * yet), falls back to a deterministic, rule-based adapter so the core loop
 * is still fully demoable without any external account. Both paths return
 * the same shape, so the UI doesn't need to know which one ran — it just
 * shows `generatedBy` as a small badge so it's honest about which mode
 * produced the text.
 *
 * AI_GATEWAY_API_KEY is a manually-rotated key; once this repo is linked to
 * a Vercel project (`vercel link`), prefer OIDC via `vercel env pull` for
 * automatic token management instead. Not done here since no Vercel project
 * is linked yet in this environment.
 */
export async function adaptRecommendation(
  rawText: string,
  platforms: Platform[]
): Promise<AdaptedVariant[]> {
  if (process.env.AI_GATEWAY_API_KEY) {
    try {
      return await adaptWithAI(rawText, platforms);
    } catch (err) {
      console.error("[adaptation] AI Gateway call failed, using fallback adapter:", err);
      return adaptWithFallback(rawText, platforms);
    }
  }
  return adaptWithFallback(rawText, platforms);
}

async function adaptWithAI(rawText: string, platforms: Platform[]): Promise<AdaptedVariant[]> {
  const schemaShape: Record<string, z.ZodString> = {};
  for (const platform of platforms) {
    schemaShape[platform] = z
      .string()
      .max(PLATFORMS[platform].charLimit)
      .describe(PLATFORMS[platform].tone);
  }

  const { output } = await generateText({
    model: "anthropic/claude-haiku-4.5",
    output: Output.object({ schema: z.object(schemaShape) }),
    system:
      "You adapt a single client-written recommendation into platform-specific versions for a freelancer's profile. Preserve the client's genuine voice, specific details, and meaning — don't invent facts, examples, or praise that isn't implied by the original text. Only adjust length and tone to fit each platform's norms.",
    prompt: `Original recommendation, written once by the client:\n\n"""${rawText}"""\n\nAdapt it for: ${platforms
      .map((p) => `${PLATFORMS[p].label} (max ${PLATFORMS[p].charLimit} chars — ${PLATFORMS[p].tone})`)
      .join("; ")}.`,
  });

  return platforms.map((platform) => ({
    platform,
    text: (output as Record<string, string>)[platform],
    generatedBy: "ai" as const,
  }));
}

/**
 * Deterministic, no-AI fallback: normalizes whitespace and truncates to
 * each platform's character limit on a sentence boundary where possible.
 * It does not rewrite tone (that needs a model) — it guarantees every
 * platform gets a valid, submittable version of what the client wrote.
 */
function adaptWithFallback(rawText: string, platforms: Platform[]): AdaptedVariant[] {
  const normalized = rawText.trim().replace(/\s+/g, " ");

  return platforms.map((platform) => {
    const limit = PLATFORMS[platform].charLimit;
    const text = truncateOnSentence(normalized, limit);
    return { platform, text, generatedBy: "fallback" as const };
  });
}

function truncateOnSentence(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const slice = text.slice(0, limit - 1);
  const lastSentenceEnd = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (lastSentenceEnd > limit * 0.5) {
    return slice.slice(0, lastSentenceEnd + 1);
  }
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 0 ? lastSpace : slice.length)}…`;
}
