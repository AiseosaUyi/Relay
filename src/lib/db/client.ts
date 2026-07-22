import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Local, zero-config persistence for dev. Swap this file for a Supabase
// client when ready for production — every call site goes through
// `src/lib/db/repository.ts`, so this is the only file that changes.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "relay.db");

function createConnection() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS freelancers (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      freelancer_id TEXT NOT NULL REFERENCES freelancers(id),
      slug TEXT UNIQUE NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT,
      platforms TEXT NOT NULL,
      raw_text TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES requests(id),
      platform TEXT NOT NULL,
      text TEXT,
      char_limit INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      generated_by TEXT,
      client_copied_at TEXT,
      submitted_at TEXT,
      resurfacing_disabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_freelancer ON requests(freelancer_id);
    CREATE INDEX IF NOT EXISTS idx_variants_request ON variants(request_id);
  `);
  return db;
}

// Reuse the connection across hot-reloads in dev (Next.js re-evaluates
// modules on every request in some modes) via a global singleton.
const globalForDb = globalThis as unknown as { __relayDb?: Database.Database };

export const db = globalForDb.__relayDb ?? createConnection();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__relayDb = db;
}
