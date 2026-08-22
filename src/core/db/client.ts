import { drizzle } from 'drizzle-orm/expo-sqlite'
import { openDatabaseSync } from 'expo-sqlite'

import * as schema from './schema'

const BOOTSTRAP_SQL = `
CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  timezone TEXT NOT NULL,
  method TEXT NOT NULL,
  high_latitude_rule TEXT NOT NULL,
  madhab TEXT,
  is_default INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS iqamah_schedules (
  id TEXT PRIMARY KEY NOT NULL,
  masjid_name TEXT NOT NULL,
  effective_from TEXT NOT NULL,
  fajr INTEGER,
  dhuhr INTEGER,
  asr INTEGER,
  maghrib INTEGER,
  isha INTEGER
);
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'custom',
  anchor_kind TEXT NOT NULL,
  anchor_prayer TEXT,
  anchor_schedule_id TEXT,
  offset_minutes INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  days_json TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS completions (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  ref_type TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`

const sqlite = openDatabaseSync('auracal.db')

let readyPromise: Promise<void> | null = null

/** Idempotent bootstrap; safe to call repeatedly. Resolves once the schema exists. */
export function initDatabase(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await sqlite.execAsync(BOOTSTRAP_SQL)
    })()
  }
  return readyPromise
}

export const db = drizzle(sqlite, { schema })
