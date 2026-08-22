import type {
  HighLatitudeRuleName,
  MadhabName,
  MethodKey,
  PrayerKey,
} from '@/core/prayer-engine'
import type { RoutineCategory } from '@/core/db/schema'

export const DEFAULT_METHOD: MethodKey = 'muslimWorldLeague'
export const DEFAULT_HIGH_LATITUDE_RULE: HighLatitudeRuleName = 'middleOfTheNight'

export const METHOD_OPTIONS: { key: MethodKey; label: string }[] = [
  { key: 'muslimWorldLeague', label: 'Muslim World League' },
  { key: 'ummAlQura', label: 'Umm al-Qura (Makkah)' },
  { key: 'egyptian', label: 'Egyptian General Authority' },
  { key: 'karachi', label: 'University of Karachi' },
  { key: 'northAmerica', label: 'ISNA (North America)' },
  { key: 'moonsightingCommittee', label: 'Moonsighting Committee' },
  { key: 'dubai', label: 'Dubai' },
  { key: 'kuwait', label: 'Kuwait' },
  { key: 'qatar', label: 'Qatar' },
  { key: 'singapore', label: 'Singapore' },
  { key: 'turkey', label: 'Turkey (Diyanet)' },
  { key: 'tehran', label: 'Tehran' },
]

export const HIGH_LATITUDE_OPTIONS: { key: HighLatitudeRuleName; label: string }[] = [
  { key: 'middleOfTheNight', label: 'Middle of the night' },
  { key: 'seventhOfTheNight', label: 'Seventh of the night' },
  { key: 'twilightAngle', label: 'Twilight angle' },
]

export const MADHAB_OPTIONS: { key: MadhabName; label: string }[] = [
  { key: 'shafi', label: 'Standard (Shafi\u02BBi and majority)' },
  { key: 'hanafi', label: 'Hanafi' },
]

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
}

export const WAQT_WINDOW_ORDER: readonly PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']

export const WAQT_ARABIC: Record<PrayerKey, string> = {
  fajr: '\u0641\u062C\u0631',
  sunrise: '\u0627\u0644\u0634\u0631\u0648\u0642',
  dhuhr: '\u0627\u0644\u0638\u0647\u0631',
  asr: '\u0627\u0644\u0639\u0635\u0631',
  maghrib: '\u0627\u0644\u0645\u063A\u0631\u0628',
  isha: '\u0627\u0644\u0639\u0634\u0627\u0621',
}

export const CATEGORY_OPTIONS: { key: RoutineCategory; label: string }[] = [
  { key: 'worship', label: 'Worship' },
  { key: 'work', label: 'Work' },
  { key: 'gym', label: 'Gym' },
  { key: 'family', label: 'Family' },
  { key: 'custom', label: 'Custom' },
]
