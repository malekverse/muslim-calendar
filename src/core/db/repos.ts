import { asc, eq } from 'drizzle-orm'
import * as Crypto from 'expo-crypto'

import { db } from './client'
import {
  iqamahSchedules,
  locations,
  routines,
  settings,
  type IqamahScheduleRow,
  type LocationRow,
  type NewLocationRow,
  type NewRoutineRow,
  type RoutineRow,
} from './schema'

export function newId(): string {
  return Crypto.randomUUID()
}

export const listLocations = (): Promise<LocationRow[]> => db.select().from(locations).orderBy(asc(locations.label))

export async function getLocation(id: string): Promise<LocationRow | undefined> {
  return db.select().from(locations).where(eq(locations.id, id)).get()
}

export async function insertLocation(row: NewLocationRow): Promise<void> {
  await db.insert(locations).values(row)
}

export async function updateLocation(id: string, patch: Partial<NewLocationRow>): Promise<void> {
  await db.update(locations).set(patch).where(eq(locations.id, id))
}

export async function deleteLocation(id: string): Promise<void> {
  await db.delete(locations).where(eq(locations.id, id))
}

export async function setActiveLocation(id: string): Promise<void> {
  await db.update(locations).set({ isDefault: false }).where(eq(locations.isDefault, true))
  await db.update(locations).set({ isDefault: true }).where(eq(locations.id, id))
}

export const listSchedules = (): Promise<IqamahScheduleRow[]> =>
  db.select().from(iqamahSchedules).orderBy(asc(iqamahSchedules.masjidName))

export async function upsertSchedule(row: IqamahScheduleRow): Promise<void> {
  await db.insert(iqamahSchedules).values(row).onConflictDoUpdate({ target: iqamahSchedules.id, set: row })
}

export async function deleteSchedule(id: string): Promise<void> {
  await db.delete(iqamahSchedules).where(eq(iqamahSchedules.id, id))
}

export const listRoutines = (): Promise<RoutineRow[]> => db.select().from(routines)

export async function insertRoutine(row: NewRoutineRow): Promise<void> {
  await db.insert(routines).values(row)
}

export async function updateRoutine(id: string, patch: Partial<NewRoutineRow>): Promise<void> {
  await db.update(routines).set(patch).where(eq(routines.id, id))
}

export async function deleteRoutine(id: string): Promise<void> {
  await db.delete(routines).where(eq(routines.id, id))
}

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const row = await db.select().from(settings).where(eq(settings.key, key)).get()
  return row ? (JSON.parse(row.value) as T) : undefined
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value: JSON.stringify(value) })
    .onConflictDoUpdate({ target: settings.key, set: { value: JSON.stringify(value) } })
}
