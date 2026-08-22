import { Coordinates, HighLatitudeRule, Madhab, PrayerTimes } from 'adhan'
import { addDays } from 'date-fns'

import type {
  Coordinates as CoordinatesShape,
  DayPrayerTimes,
  DaySchedule,
  EngineOptions,
  HighLatitudeRuleName,
  MadhabName,
  QiyamWindow,
  WaqtWindow,
} from './types'

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

/** Full day schedule: prayer times plus the five waqt windows (Isha window crosses midnight). */
export function buildDaySchedule(
  coordinates: CoordinatesShape,
  date: Date,
  options: EngineOptions
): DaySchedule {
  const times = computeTimes(coordinates, date, options)
  const nextFajr = computeTimes(coordinates, addDays(date, 1), options).fajr

  const windows: WaqtWindow[] = [
    { key: 'fajr', start: times.fajr, end: times.sunrise },
    { key: 'dhuhr', start: times.dhuhr, end: times.asr },
    { key: 'asr', start: times.asr, end: times.maghrib },
    { key: 'maghrib', start: times.maghrib, end: times.isha },
    { key: 'isha', start: times.isha, end: nextFajr },
  ]

  return { date, times, windows }
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
