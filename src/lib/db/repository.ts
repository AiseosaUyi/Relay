import { nanoid } from "nanoid";
import { db } from "./client";
import { PLATFORMS, type Platform } from "@/lib/adaptation/platforms";

export type Freelancer = {
  id: string;
  slug: string;
  name: string;
  created_at: string;
};

export type VariantStatus =
  | "pending"
  | "adapted"
  | "request_sent"
  | "reminder_scheduled"
  | "submitted";

export type Variant = {
  id: string;
  request_id: string;
  platform: Platform;
  text: string | null;
  char_limit: number;
  status: VariantStatus;
  generated_by: "ai" | "fallback" | null;
  client_copied_at: string | null;
  submitted_at: string | null;
  resurfacing_disabled: number;
  created_at: string;
};

export type RecommendationRequest = {
  id: string;
  freelancer_id: string;
  slug: string;
  client_name: string;
  client_email: string | null;
  platforms: string; // JSON-encoded Platform[]
  raw_text: string | null;
  created_at: string;
};

function slugId() {
  // 12-char, URL-safe. Regeneration-on-collision is handled by the unique
  // constraint + retry in createFreelancer/createRequest below.
  return nanoid(12);
}

export function createFreelancer(name: string): Freelancer {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugId();
    try {
      const id = nanoid();
      const created_at = new Date().toISOString();
      db.prepare(
        `INSERT INTO freelancers (id, slug, name, created_at) VALUES (?, ?, ?, ?)`
      ).run(id, slug, name, created_at);
      return { id, slug, name, created_at };
    } catch (err) {
      if (attempt === 4) throw err;
      // unique constraint collision on slug — retry with a fresh one
    }
  }
  throw new Error("Failed to create freelancer after retries");
}

export function getFreelancerBySlug(slug: string): Freelancer | undefined {
  return db
    .prepare(`SELECT * FROM freelancers WHERE slug = ?`)
    .get(slug) as Freelancer | undefined;
}

export function getFreelancerById(id: string): Freelancer | undefined {
  return db.prepare(`SELECT * FROM freelancers WHERE id = ?`).get(id) as Freelancer | undefined;
}

export function createRequest(input: {
  freelancerId: string;
  clientName: string;
  clientEmail: string | null;
  platforms: Platform[];
}): RecommendationRequest {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = slugId();
    try {
      const id = nanoid();
      const created_at = new Date().toISOString();
      const platformsJson = JSON.stringify(input.platforms);
      db.prepare(
        `INSERT INTO requests (id, freelancer_id, slug, client_name, client_email, platforms, raw_text, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`
      ).run(id, input.freelancerId, slug, input.clientName, input.clientEmail, platformsJson, created_at);

      const insertVariant = db.prepare(
        `INSERT INTO variants (id, request_id, platform, text, char_limit, status, generated_by, created_at)
         VALUES (?, ?, ?, NULL, ?, 'pending', NULL, ?)`
      );
      for (const platform of input.platforms) {
        insertVariant.run(nanoid(), id, platform, PLATFORMS[platform].charLimit, created_at);
      }

      return {
        id,
        freelancer_id: input.freelancerId,
        slug,
        client_name: input.clientName,
        client_email: input.clientEmail,
        platforms: platformsJson,
        raw_text: null,
        created_at,
      };
    } catch (err) {
      if (attempt === 4) throw err;
    }
  }
  throw new Error("Failed to create request after retries");
}

export function getRequestBySlug(slug: string): RecommendationRequest | undefined {
  return db
    .prepare(`SELECT * FROM requests WHERE slug = ?`)
    .get(slug) as RecommendationRequest | undefined;
}

export function getRequestById(id: string): RecommendationRequest | undefined {
  return db.prepare(`SELECT * FROM requests WHERE id = ?`).get(id) as
    | RecommendationRequest
    | undefined;
}

export function listVariantsForRequest(requestId: string): Variant[] {
  return db
    .prepare(`SELECT * FROM variants WHERE request_id = ? ORDER BY platform`)
    .all(requestId) as Variant[];
}

export function saveRawText(requestId: string, rawText: string) {
  db.prepare(`UPDATE requests SET raw_text = ? WHERE id = ?`).run(rawText, requestId);
}

export function saveVariantText(
  variantId: string,
  text: string,
  generatedBy: "ai" | "fallback"
) {
  db.prepare(
    `UPDATE variants SET text = ?, status = 'adapted', generated_by = ? WHERE id = ?`
  ).run(text, generatedBy, variantId);
}

export function markVariantCopied(variantId: string) {
  db.prepare(`UPDATE variants SET client_copied_at = ? WHERE id = ?`).run(
    new Date().toISOString(),
    variantId
  );
}

export function markVariantSubmitted(variantId: string) {
  const variant = db.prepare(`SELECT * FROM variants WHERE id = ?`).get(variantId) as
    | Variant
    | undefined;
  if (!variant) return;
  const resurfacingDisabled = variant.platform === "upwork" ? 1 : variant.resurfacing_disabled;
  db.prepare(
    `UPDATE variants SET status = 'submitted', submitted_at = ?, resurfacing_disabled = ? WHERE id = ?`
  ).run(new Date().toISOString(), resurfacingDisabled, variantId);
}

export function listRequestsForFreelancer(
  freelancerId: string
): (RecommendationRequest & { variants: Variant[] })[] {
  const requests = db
    .prepare(`SELECT * FROM requests WHERE freelancer_id = ? ORDER BY created_at DESC`)
    .all(freelancerId) as RecommendationRequest[];
  return requests.map((request) => ({
    ...request,
    variants: listVariantsForRequest(request.id),
  }));
}
