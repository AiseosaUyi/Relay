"use server";

import { z } from "zod";
import {
  getRequestBySlug,
  listVariantsForRequest,
  saveRawText,
  saveVariantText,
  markVariantCopied,
} from "@/lib/db/repository";
import { adaptRecommendation } from "@/lib/adaptation/adapt";
import type { Platform } from "@/lib/adaptation/platforms";

// Public, unauthenticated action — anyone with the request slug can call
// this, and it triggers a (possibly paid) AI call. Basic per-slug rate
// limit as a minimum guard, per the design doc's abuse/rate-limiting note.
// In-memory only (fine for a single-process dev deployment); a real
// deployment behind Supabase should move this to a persisted counter.
const submissionAttempts = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(slug: string) {
  const now = Date.now();
  const attempts = (submissionAttempts.get(slug) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (attempts.length >= RATE_LIMIT_MAX) {
    return false;
  }
  attempts.push(now);
  submissionAttempts.set(slug, attempts);
  return true;
}

const submitSchema = z.object({
  slug: z.string().min(1),
  text: z.string().trim().min(20, "A recommendation needs at least a couple of sentences."),
});

export type SubmitResult =
  | { ok: true; variants: { platform: Platform; text: string; generatedBy: "ai" | "fallback" }[] }
  | { ok: false; error: string };

export async function submitRecommendation(
  slug: string,
  rawText: string
): Promise<SubmitResult> {
  const parsed = submitSchema.safeParse({ slug, text: rawText });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (!checkRateLimit(slug)) {
    return { ok: false, error: "Too many attempts — please wait a minute and try again." };
  }

  const request = getRequestBySlug(slug);
  if (!request) {
    return { ok: false, error: "This request no longer exists." };
  }

  const platforms = JSON.parse(request.platforms) as Platform[];

  try {
    const variants = await adaptRecommendation(parsed.data.text, platforms);

    saveRawText(request.id, parsed.data.text);
    const dbVariants = listVariantsForRequest(request.id);
    for (const variant of variants) {
      const dbVariant = dbVariants.find((v) => v.platform === variant.platform);
      if (dbVariant) {
        saveVariantText(dbVariant.id, variant.text, variant.generatedBy);
      }
    }

    return { ok: true, variants };
  } catch (err) {
    console.error("[submitRecommendation] failed:", err);
    return {
      ok: false,
      error: "Something went wrong generating your recommendations. Please try again.",
    };
  }
}

export async function recordCopy(slug: string, platform: Platform) {
  const request = getRequestBySlug(slug);
  if (!request) return;
  const variant = listVariantsForRequest(request.id).find((v) => v.platform === platform);
  if (variant) markVariantCopied(variant.id);
}
