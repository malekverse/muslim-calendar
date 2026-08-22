import { Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan'
import { addDays } from 'date-fns'

import type {
  Coordinates as CoordinatesShape,
  DayPrayerTimes,
  DaySchedule,
  EngineOptions,
  HighLatitudeRuleName,
  MadhabName,
  PrayerKey,
  QiyamWindow,
  WaqtWindow,
} from './types'
import { PRAYER_ORDER } from './types'

import { resolveParameters } from './methods'

const HIGH_LATITUDE_RULES = {
  middleOfTheNight: HighLatitudeRule.MiddleOfTheNight,
  seventhOfTheNight: HighLatitudeRule.SeventhOfTheNight,
  twilightAngle: HighLatitudeRule.TwilightAngle,
} satisfies Record<HighLatitudeRuleName, unknown>

const MADHABS = {
  shafi: Madhab.Shafi,
  hanafi: Madhab.Hanafi,
} satisfies Record<MadhabName, unknown>

function computeTimes(
  coordinates: CoordinatesShape,
  date: Date,
  options: EngineOptions
): DayPrayerTimes {
  const params = resolveParameters(options.method)
  params.highLatitudeRule = HIGH_LATITUDE_RULES[options.highLatitudeRule]
  if (options.madhab) params.madhab = MADHABS[options.madhab]

  const times = new PrayerTimes(new Coordinates(coordinates.latitude, coordinates.longitude), date, params)

  return {
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }
}

/** The five waqt containers for a day whose Fajr..Isha times are already known. */
export function buildWaqtWindows(times: DayPrayerTimes, tomorrowFajr: Date): WaqtWindow[] {
  return [
    { key: 'fajr', start: times.fajr, end: times.sunrise },
    { key: 'dhuhr', start: times.dhuhr, end: times.asr },
    { key: 'asr', start: times.asr, end: times.maghrib },
    { key: 'maghrib', start: times.maghrib, end: times.isha },
    { key: 'isha', start: times.isha, end: tomorrowFajr },
  ]
}

/** Full day schedule: prayer times plus the five waqt windows (Isha window crosses midnight). */
export function buildDaySchedule(
  coordinates: CoordinatesShape,
  date: Date,
  options: EngineOptions
): DaySchedule {
  const times = computeTimes(coordinates, date, options)
  const nextFajr = computeTimes(coordinates, addDays(date, 1), options).fajr
  return { date, times, windows: buildWaqtWindows(times, nextFajr) }
}

/**
 * Last third of the night between maghrib and the following fajr.
 * The night begins at maghrib per Islamic reckoning.
 */
export function getQiyamWindow(
  coordinates: CoordinatesShape,
  date: Date,
  options: EngineOptions
): QiyamWindow {
  const schedule = buildDaySchedule(coordinates, date, options)
  const start = schedule.times.maghrib
  const end = schedule.windows[4].end

  const nightDuration = end.getTime() - start.getTime()
  return { start: new Date(start.getTime() + (nightDuration * 2) / 3), end }
}

/** Replaces calculated times with masjid jamaah times (minutes from local midnight). */
export function applyIqamahOverrides(
  times: DayPrayerTimes,
  overrides: Partial<Record<'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha', number>> | null
): DayPrayerTimes {
  if (!overrides) return times
  const midnight = new Date(times.fajr)
  midnight.setHours(0, 0, 0, 0)

  const merged: DayPrayerTimes = { ...times }
  for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
    const minutes = overrides[key]
    if (minutes !== undefined && minutes !== null) {
      merged[key] = new Date(midnight.getTime() + minutes * 60_000)
    }
  }
  return merged
}

export interface UpcomingPrayer {
  key: PrayerKey
  at: Date
}

/** First prayer strictly after `now`; wraps to tomorrow's Fajr past Isha. */
export function nextPrayerAfter(now: Date, times: DayPrayerTimes, tomorrowFajr: Date): UpcomingPrayer {
  for (const key of PRAYER_ORDER) {
    if (times[key].getTime() > now.getTime()) return { key, at: times[key] }
  }
  return { key: 'fajr', at: tomorrowFajr }
}
