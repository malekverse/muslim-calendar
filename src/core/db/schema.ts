import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import type {
  HighLatitudeRuleName,
  MadhabName,
  MethodKey,
  PrayerKey,
} from '@/core/prayer-engine'

export type RoutineCategory = 'worship' | 'work' | 'gym' | 'family' | 'custom'
export type CompletionStatus = 'done' | 'missed' | 'skipped'

export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  timezone: text('timezone').notNull(),
  method: text('method').$type<MethodKey>().notNull(),
  highLatitudeRule: text('high_latitude_rule').$type<HighLatitudeRuleName>().notNull(),
  madhab: text('madhab').$type<MadhabName>(),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
})

export const iqamahSchedules = sqliteTable('iqamah_schedules', {
  id: text('id').primaryKey(),
  masjidName: text('masjid_name').notNull(),
  effectiveFrom: text('effective_from').notNull(),
  fajr: integer('fajr'),
  dhuhr: integer('dhuhr'),
  asr: integer('asr'),
  maghrib: integer('maghrib'),
  isha: integer('isha'),
})

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').$type<RoutineCategory>().notNull().default('custom'),
  anchorKind: text('anchor_kind').$type<'prayer' | 'iqamah'>().notNull(),
  anchorPrayer: text('anchor_prayer').$type<PrayerKey>(),
  anchorScheduleId: text('anchor_schedule_id').$type<string>(),
  offsetMinutes: integer('offset_minutes').notNull().default(0),
  durationMinutes: integer('duration_minutes').notNull().default(30),
  daysJson: text('days_json').notNull().default('[]'),
})

export const completions = sqliteTable('completions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  refType: text('ref_type').$type<'routine' | 'prayer'>().notNull(),
  refId: text('ref_id').notNull(),
  status: text('status').$type<CompletionStatus>().notNull(),
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

export type LocationRow = typeof locations.$inferSelect
export type NewLocationRow = typeof locations.$inferInsert
export type IqamahScheduleRow = typeof iqamahSchedules.$inferSelect
export type NewIqamahScheduleRow = typeof iqamahSchedules.$inferInsert
export type RoutineRow = typeof routines.$inferSelect
export type NewRoutineRow = typeof routines.$inferInsert
