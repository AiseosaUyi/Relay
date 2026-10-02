import "server-only";
import { createClient, type Client } from "@libsql/client";
import fs from "node:fs";
import path from "node:path";

/**
 * One libSQL client for local dev and production.
 * - Local: DATABASE_URL unset, uses file:data/relay-v2.db (git-ignored).
 * - Production: DATABASE_URL=libsql://<db>.turso.io plus DATABASE_AUTH_TOKEN.
 *
 * Every query goes through src/lib/db/repository.ts. Swap this file if the
 * database ever changes.
 */

const DEFAULT_URL = "file:data/relay-v2.db";

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    owner_name TEXT NOT NULL,
    owner_role TEXT,
    links TEXT NOT NULL DEFAULT '{}',
    default_destinations TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT,
    context TEXT,
    destinations TEXT NOT NULL,
    raw_text TEXT,
    consent_public INTEGER NOT NULL DEFAULT 0,
    consent_at TEXT,
    consent_version TEXT,
    regen_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    submitted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    destination TEXT NOT NULL,
    text TEXT,
    generated_text TEXT,
    generated_by TEXT,
    edited INTEGER NOT NULL DEFAULT 0,
    copied_at TEXT,
    request_sent_at TEXT,
    live_at TEXT,
    live_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (request_id, destination)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_variants_request ON variants(request_id)`,
];

function createConnection(): Client {
  const url = process.env.DATABASE_URL || DEFAULT_URL;
  if (url.startsWith("file:")) {
    const file = path.join(/* turbopackIgnore: true */ process.cwd(), url.slice("file:".length));
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  return createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
}

const globalForDb = globalThis as unknown as { __relayDb?: Client; __relaySchema?: Promise<void> };

const client = globalForDb.__relayDb ?? createConnection();
if (process.env.NODE_ENV !== "production") globalForDb.__relayDb = client;

function ensureSchema() {
  globalForDb.__relaySchema ??= client
    .batch(
      SCHEMA.map((sql) => ({ sql, args: [] })),
      "write"
    )
    .then(() => undefined)
    .catch((err) => {
      globalForDb.__relaySchema = undefined;
      throw err;
    });
  return globalForDb.__relaySchema;
}

/** Returns the client after making sure tables exist. */
export async function getDb(): Promise<Client> {
  await ensureSchema();
  return client;
}
