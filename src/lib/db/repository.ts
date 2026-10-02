import "server-only";
import { nanoid } from "nanoid";
import type { Row } from "@libsql/client";
import { getDb } from "./client";
import {
  parseDestinations,
  type DestinationId,
  type OwnerLinks,
} from "@/lib/destinations/registry";
import type { GeneratedBy } from "@/lib/adaptation/adapt";

export type Settings = {
  owner_name: string;
  owner_role: string | null;
  links: OwnerLinks;
  default_destinations: DestinationId[];
};

export type RecommendationRequest = {
  id: string;
  slug: string;
  client_name: string;
  client_email: string | null;
  context: string | null;
  destinations: DestinationId[];
  raw_text: string | null;
  consent_public: boolean;
  consent_at: string | null;
  regen_count: number;
  created_at: string;
  submitted_at: string | null;
};

export type Variant = {
  id: string;
  request_id: string;
  destination: DestinationId;
  text: string | null;
  generated_text: string | null;
  generated_by: GeneratedBy | null;
  edited: boolean;
  copied_at: string | null;
  request_sent_at: string | null;
  live_at: string | null;
  live_url: string | null;
};

export type RequestWithVariants = RecommendationRequest & { variants: Variant[] };

export const MAX_REGENERATIONS = 3;
export const CONSENT_VERSION = "2026-10-v1";

const now = () => new Date().toISOString();

function str(v: unknown): string | null {
  return v === null || v === undefined ? null : String(v);
}

function safeJson<T>(value: unknown, fallback: T): T {
  try {
    return value ? (JSON.parse(String(value)) as T) : fallback;
  } catch {
    return fallback;
  }
}

function toRequest(row: Row): RecommendationRequest {
  return {
    id: String(row.id),
    slug: String(row.slug),
    client_name: String(row.client_name),
    client_email: str(row.client_email),
    context: str(row.context),
    destinations: parseDestinations(str(row.destinations)),
    raw_text: str(row.raw_text),
    consent_public: Number(row.consent_public) === 1,
    consent_at: str(row.consent_at),
    regen_count: Number(row.regen_count ?? 0),
    created_at: String(row.created_at),
    submitted_at: str(row.submitted_at),
  };
}

function toVariant(row: Row): Variant {
  return {
    id: String(row.id),
    request_id: String(row.request_id),
    destination: String(row.destination) as DestinationId,
    text: str(row.text),
    generated_text: str(row.generated_text),
    generated_by: str(row.generated_by) as GeneratedBy | null,
    edited: Number(row.edited) === 1,
    copied_at: str(row.copied_at),
    request_sent_at: str(row.request_sent_at),
    live_at: str(row.live_at),
    live_url: str(row.live_url),
  };
}

// ── Settings ──────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings | null> {
  const db = await getDb();
  const { rows } = await db.execute(`SELECT * FROM settings WHERE id = 1`);
  const row = rows[0];
  if (!row) return null;
  return {
    owner_name: String(row.owner_name),
    owner_role: str(row.owner_role),
    links: safeJson<OwnerLinks>(row.links, {}),
    default_destinations: parseDestinations(str(row.default_destinations)),
  };
}

export async function saveSettings(input: Settings) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO settings (id, owner_name, owner_role, links, default_destinations, updated_at)
          VALUES (1, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET owner_name = excluded.owner_name, owner_role = excluded.owner_role,
            links = excluded.links, default_destinations = excluded.default_destinations, updated_at = excluded.updated_at`,
    args: [
      input.owner_name,
      input.owner_role,
      JSON.stringify(input.links),
      JSON.stringify(input.default_destinations),
      now(),
    ],
  });
}

// ── Requests ──────────────────────────────────────────────────────────────

export async function createRequest(input: {
  clientName: string;
  clientEmail: string | null;
  context: string | null;
  destinations: DestinationId[];
}): Promise<RecommendationRequest> {
  const db = await getDb();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = nanoid();
    const slug = nanoid(12);
    const created_at = now();
    try {
      await db.batch(
        [
          {
            sql: `INSERT INTO requests (id, slug, client_name, client_email, context, destinations, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [id, slug, input.clientName, input.clientEmail, input.context, JSON.stringify(input.destinations), created_at],
          },
          ...input.destinations.map((destination) => ({
            sql: `INSERT INTO variants (id, request_id, destination, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
            args: [nanoid(), id, destination, created_at, created_at],
          })),
        ],
        "write"
      );
      return {
        id,
        slug,
        client_name: input.clientName,
        client_email: input.clientEmail,
        context: input.context,
        destinations: input.destinations,
        raw_text: null,
        consent_public: false,
        consent_at: null,
        regen_count: 0,
        created_at,
        submitted_at: null,
      };
    } catch (err) {
      // Unique slug collision is the only expected failure. Retry with a new one.
      if (attempt === 4) throw err;
    }
  }
  throw new Error("Failed to create request");
}

export async function getRequestBySlug(slug: string): Promise<RequestWithVariants | null> {
  const db = await getDb();
  const { rows } = await db.execute({ sql: `SELECT * FROM requests WHERE slug = ?`, args: [slug] });
  if (!rows[0]) return null;
  const request = toRequest(rows[0]);
  return { ...request, variants: await listVariants(request.id) };
}

export async function listRequests(): Promise<RequestWithVariants[]> {
  const db = await getDb();
  const [requests, variants] = await Promise.all([
    db.execute(`SELECT * FROM requests ORDER BY created_at DESC`),
    db.execute(`SELECT * FROM variants`),
  ]);
  const byRequest = new Map<string, Variant[]>();
  for (const row of variants.rows) {
    const v = toVariant(row);
    byRequest.set(v.request_id, [...(byRequest.get(v.request_id) ?? []), v]);
  }
  return requests.rows.map((row) => {
    const r = toRequest(row);
    return { ...r, variants: sortVariants(r.destinations, byRequest.get(r.id) ?? []) };
  });
}

async function listVariants(requestId: string): Promise<Variant[]> {
  const db = await getDb();
  const [{ rows }, req] = await Promise.all([
    db.execute({ sql: `SELECT * FROM variants WHERE request_id = ?`, args: [requestId] }),
    db.execute({ sql: `SELECT destinations FROM requests WHERE id = ?`, args: [requestId] }),
  ]);
  return sortVariants(parseDestinations(str(req.rows[0]?.destinations)), rows.map(toVariant));
}

function sortVariants(order: DestinationId[], variants: Variant[]) {
  return [...variants].sort((a, b) => order.indexOf(a.destination) - order.indexOf(b.destination));
}

export async function deleteRequest(id: string) {
  const db = await getDb();
  await db.batch(
    [
      { sql: `DELETE FROM variants WHERE request_id = ?`, args: [id] },
      { sql: `DELETE FROM requests WHERE id = ?`, args: [id] },
    ],
    "write"
  );
}

/** Saves the client's original text, consent and every generated version. */
export async function saveSubmission(input: {
  requestId: string;
  rawText: string;
  consentPublic: boolean;
  texts: { destination: DestinationId; text: string; generatedBy: GeneratedBy }[];
  countsAsRegeneration: boolean;
}) {
  const db = await getDb();
  const at = now();
  await db.batch(
    [
      {
        sql: `UPDATE requests SET raw_text = ?, consent_public = ?, consent_at = ?, consent_version = ?,
                submitted_at = COALESCE(submitted_at, ?), regen_count = regen_count + ? WHERE id = ?`,
        args: [
          input.rawText,
          input.consentPublic ? 1 : 0,
          input.consentPublic ? at : null,
          input.consentPublic ? CONSENT_VERSION : null,
          at,
          input.countsAsRegeneration ? 1 : 0,
          input.requestId,
        ],
      },
      ...input.texts.map((t) => ({
        sql: `UPDATE variants SET text = ?, generated_text = ?, generated_by = ?, edited = 0, updated_at = ?
              WHERE request_id = ? AND destination = ?`,
        args: [t.text, t.text, t.generatedBy, at, input.requestId, t.destination],
      })),
    ],
    "write"
  );
}

export async function saveRegeneratedVariant(input: {
  requestId: string;
  destination: DestinationId;
  text: string;
  generatedBy: GeneratedBy;
}) {
  const db = await getDb();
  const at = now();
  await db.batch(
    [
      {
        sql: `UPDATE variants SET text = ?, generated_text = ?, generated_by = ?, edited = 0, updated_at = ?
              WHERE request_id = ? AND destination = ?`,
        args: [input.text, input.text, input.generatedBy, at, input.requestId, input.destination],
      },
      { sql: `UPDATE requests SET regen_count = regen_count + 1 WHERE id = ?`, args: [input.requestId] },
    ],
    "write"
  );
}

export async function saveVariantEdit(requestId: string, destination: DestinationId, text: string) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE variants SET text = ?, edited = CASE WHEN ? = generated_text THEN 0 ELSE 1 END, updated_at = ?
          WHERE request_id = ? AND destination = ?`,
    args: [text, text, now(), requestId, destination],
  });
}

export async function markCopied(requestId: string, destination: DestinationId) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE variants SET copied_at = COALESCE(copied_at, ?) WHERE request_id = ? AND destination = ?`,
    args: [now(), requestId, destination],
  });
}

export async function setRequestSent(requestId: string, destination: DestinationId, sent: boolean) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE variants SET request_sent_at = ? WHERE request_id = ? AND destination = ?`,
    args: [sent ? now() : null, requestId, destination],
  });
}

export async function setLive(requestId: string, destination: DestinationId, live: boolean, url: string | null) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE variants SET live_at = ?, live_url = ? WHERE request_id = ? AND destination = ?`,
    args: [live ? now() : null, live ? url : null, requestId, destination],
  });
}

export async function setConsent(requestId: string, consentPublic: boolean) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE requests SET consent_public = ?, consent_at = ?, consent_version = ? WHERE id = ?`,
    args: [consentPublic ? 1 : 0, consentPublic ? now() : null, consentPublic ? CONSENT_VERSION : null, requestId],
  });
}
