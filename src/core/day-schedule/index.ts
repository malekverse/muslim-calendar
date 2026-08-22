import { format } from 'date-fns'

import type { ExternalEvent } from '@/core/calendar-store'
import type { IqamahScheduleRow, LocationRow, RoutineRow } from '@/core/db/schema'
import type {
  DayPrayerTimes,
  EngineOptions,
  PrayerKey,
  UpcomingPrayer,
  WaqtWindow,
} from '@/core/prayer-engine'
import {
  applyIqamahOverrides,
  buildDaySchedule,
  buildWaqtWindows,
  nextPrayerAfter,
} from '@/core/prayer-engine'

const JAMAAT_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export interface ResolvedRoutineBlock {
  routine: RoutineRow
  start: Date
  end: Date
}

export interface HardBlock {
  id: string
  title: string
  start: Date
  end: Date
}

export interface DayScheduleInput {
  location: Pick<LocationRow, 'latitude' | 'longitude'> | null
  options: EngineOptions | null
  schedules: IqamahScheduleRow[]
  routines: RoutineRow[]
  externalEvents?: ExternalEvent[]
}

export interface DayScheduleView {
  times: DayPrayerTimes
  windows: WaqtWindow[]
  blocks: ResolvedRoutineBlock[]
  hardBlocks: HardBlock[]
  allDayTitles: string[]
  upcoming: UpcomingPrayer
  now: Date
}

function overridesOf(
  schedules: IqamahScheduleRow[],
  dayIso: string
): Partial<Record<(typeof JAMAAT_KEYS)[number], number>> | null {
  const applicable =
    schedules
      .filter((s) => s.effectiveFrom <= dayIso)
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0] ?? null
  if (!applicable) return null

  const overrides: Partial<Record<(typeof JAMAAT_KEYS)[number], number>> = {}
  let hasAny = false
  for (const key of JAMAAT_KEYS) {
    const minutes = applicable[key]
    if (minutes !== null && minutes !== undefined) {
      overrides[key] = minutes
      hasAny = true
    }
  }
  return hasAny ? overrides : null
}

/** Blocks placed on the timeline, honoring weekday recurrence (empty days = every day). */
export function resolveBlocks(
  routines: RoutineRow[],
  times: DayPrayerTimes,
  midnight: Date,
  weekday: number
): ResolvedRoutineBlock[] {
  return routines
    .filter((routine) => {
      const days = JSON.parse(routine.daysJson) as number[]
      return days.length === 0 || days.includes(weekday)
    })
    .map((routine) => {
      const prayer = routine.anchorPrayer as PrayerKey | null
      const anchor = prayer ? times[prayer] : null
      if (!anchor) return null
      const start = new Date(anchor.getTime() + routine.offsetMinutes * 60_000)
      return {
        routine,
        start,
        end: new Date(start.getTime() + routine.durationMinutes * 60_000),
      }
    })
    .filter((block): block is ResolvedRoutineBlock => block !== null)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function computeDayView(input: DayScheduleInput, now: Date): DayScheduleView | null {
  if (!input.location || !input.options) return null

  const dayIso = format(now, 'yyyy-MM-dd')
  const raw = buildDaySchedule(
    { latitude: input.location.latitude, longitude: input.location.longitude },
    now,
    input.options
  )

  const times = applyIqamahOverrides(raw.times, overridesOf(input.schedules, dayIso))
  const windows = buildWaqtWindows(times, raw.windows[4].end)
  const upcoming = nextPrayerAfter(now, times, windows[4].end)

  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const timed = (input.externalEvents ?? []).filter((event) => !event.isAllDay)
  const hardBlocks: HardBlock[] = timed
    .map((event) => ({
      id: event.id,
      title: event.title,
      start: event.start < midnight ? midnight : event.start,
      end: new Date(Math.min(event.end.getTime(), windows[4].end.getTime())),
    }))
    .filter((block) => block.end > block.start)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  const allDayTitles = (input.externalEvents ?? [])
    .filter((event) => event.isAllDay)
    .map((event) => event.title)

  return {
    times,
    windows,
    upcoming,
    now,
    blocks: resolveBlocks(input.routines, times, midnight, now.getDay()),
    hardBlocks,
    allDayTitles,
  }
}
