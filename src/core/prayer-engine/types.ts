import type { MethodKey } from './methods'

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export type HighLatitudeRuleName = 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle'

export type MadhabName = 'shafi' | 'hanafi'

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface EngineOptions {
  method: MethodKey
  highLatitudeRule: HighLatitudeRuleName
  madhab?: MadhabName
}

export interface DayPrayerTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export interface WaqtWindow {
  key: PrayerKey
  start: Date
  end: Date
}

/** The five waqt containers of one day, in prayer order. The Isha window spans midnight. */
export interface DaySchedule {
  date: Date
  times: DayPrayerTimes
  windows: WaqtWindow[]
}

export interface QiyamWindow {
  /** Start of the last third of the night. */
  start: Date
  /** Fajr of the following morning. */
  end: Date
}

export const PRAYER_ORDER: readonly PrayerKey[] = [
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
] as const
