"use server";

import { z } from "zod";
import {
  getRequestBySlug,
  getSettings,
  markCopied,
  MAX_REGENERATIONS,
  saveRegeneratedVariant,
  saveSubmission,
  saveVariantEdit,
  setConsent as saveConsent,
  type RequestWithVariants,
} from "@/lib/db/repository";
import { adaptAll, fit, regenerateOne, type AdaptInput } from "@/lib/adaptation/adapt";
import { DESTINATIONS, isAdaptedGroup, isDestinationId } from "@/lib/destinations/registry";
import { toClientState, type ClientState } from "./state";

/**
 * Public actions behind the client link. Anyone with the slug can call them,
 * so every AI call is capped per request: one free adaptation, then at most
 * MAX_REGENERATIONS more (rewrites of the original or single-version redos).
 * Edits, copies and consent changes never call the AI.
 */

export type ActionResult = { ok: true; state: ClientState } | { ok: false; error: string };

const MIN_CHARS = 40;
const MAX_CHARS = 4000;

const textSchema = z
  .string()
  .trim()
  .min(MIN_CHARS, "Write at least a couple of sentences.")
  .max(MAX_CHARS, `Keep it under ${MAX_CHARS.toLocaleString()} characters.`);

// Blocks double submits from the same instance while an AI call is running.
const inFlight = new Set<string>();

async function adaptInput(request: RequestWithVariants, rawText: string): Promise<AdaptInput> {
  const settings = await getSettings();
  return {
    rawText,
    ownerName: settings?.owner_name ?? "the freelancer",
    ownerRole: settings?.owner_role,
    clientName: request.client_name,
    context: request.context,
  };
}

export async function submitRecommendation(slug: string, rawText: string, consentPublic: boolean): Promise<ActionResult> {
  const parsed = textSchema.safeParse(rawText);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check what you wrote." };

  const request = await getRequestBySlug(slug);
  if (!request) return { ok: false, error: "This link no longer works. Ask for a new one." };

  const isRewrite = Boolean(request.raw_text);
  if (isRewrite && request.regen_count >= MAX_REGENERATIONS) {
    return { ok: false, error: "You've used all the rewrites for this link. You can still edit each version by hand." };
  }
  if (inFlight.has(request.id)) return { ok: false, error: "Already working on it, one moment." };

  inFlight.add(request.id);
  try {
    const texts = await adaptAll(await adaptInput(request, parsed.data), request.destinations);
    await saveSubmission({
      requestId: request.id,
      rawText: parsed.data,
      consentPublic,
      texts,
      countsAsRegeneration: isRewrite,
    });
    const updated = await getRequestBySlug(slug);
    return { ok: true, state: toClientState(updated!) };
  } catch (err) {
    console.error("[submitRecommendation]", err);
    return { ok: false, error: "Something went wrong. Please try again." };
  } finally {
    inFlight.delete(request.id);
  }
}

export async function regenerateVersion(slug: string, destination: string): Promise<ActionResult> {
  if (!isDestinationId(destination) || !isAdaptedGroup(DESTINATIONS[destination].group)) {
    return { ok: false, error: "This one can't be regenerated." };
  }
  const request = await getRequestBySlug(slug);
  if (!request?.raw_text) return { ok: false, error: "Write your recommendation first." };
  if (request.regen_count >= MAX_REGENERATIONS) return { ok: false, error: "No new versions left. You can still edit it by hand." };
  const current = request.variants.find((v) => v.destination === destination);
  if (!current) return { ok: false, error: "This link doesn't include that platform." };
  if (inFlight.has(request.id)) return { ok: false, error: "Already working on it, one moment." };

  inFlight.add(request.id);
  try {
    const out = await regenerateOne(await adaptInput(request, request.raw_text), destination, current.text ?? "");
    await saveRegeneratedVariant({ requestId: request.id, destination, text: out.text, generatedBy: out.generatedBy });
    const updated = await getRequestBySlug(slug);
    return { ok: true, state: toClientState(updated!) };
  } finally {
    inFlight.delete(request.id);
  }
}

export async function saveEdit(slug: string, destination: string, text: string): Promise<{ ok: boolean }> {
  if (!isDestinationId(destination)) return { ok: false };
  const request = await getRequestBySlug(slug);
  if (!request?.raw_text || !request.destinations.includes(destination)) return { ok: false };
  const d = DESTINATIONS[destination];
  if (!isAdaptedGroup(d.group)) return { ok: false };
  await saveVariantEdit(request.id, destination, text.slice(0, d.maxChars + 500));
  return { ok: true };
}

export async function applyOriginalWords(slug: string, destination: string): Promise<ActionResult> {
  if (!isDestinationId(destination)) return { ok: false, error: "Unknown platform." };
  const request = await getRequestBySlug(slug);
  if (!request?.raw_text || !request.destinations.includes(destination)) return { ok: false, error: "Write your recommendation first." };
  await saveVariantEdit(request.id, destination, fit(request.raw_text, DESTINATIONS[destination].maxChars));
  const updated = await getRequestBySlug(slug);
  return { ok: true, state: toClientState(updated!) };
}

export async function setConsent(slug: string, consentPublic: boolean): Promise<{ ok: boolean }> {
  const request = await getRequestBySlug(slug);
  if (!request?.raw_text) return { ok: false };
  await saveConsent(request.id, consentPublic);
  return { ok: true };
}

export async function recordCopy(slug: string, destination: string) {
  if (!isDestinationId(destination)) return;
  const request = await getRequestBySlug(slug);
  if (request?.destinations.includes(destination)) await markCopied(request.id, destination);
}
