import { describe, expect, it } from 'vitest'

import {
  applyIqamahOverrides,
  buildDaySchedule,
  getQiyamWindow,
  nextPrayerAfter,
} from './engine'

const CAIRO = { latitude: 30.0444, longitude: 31.2357 }
const HELSINKI = { latitude: 60.1699, longitude: 24.9384 }

const OPTIONS = {
  method: 'ummAlQura',
  highLatitudeRule: 'middleOfTheNight',
} as const

describe('buildDaySchedule', () => {
  const schedule = buildDaySchedule(CAIRO, new Date(2026, 7, 22), OPTIONS)

  it('orders the six daily entries chronologically', () => {
    const entries = [
      schedule.times.fajr,
      schedule.times.sunrise,
      schedule.times.dhuhr,
      schedule.times.asr,
      schedule.times.maghrib,
      schedule.times.isha,
    ]
    for (let i = 1; i < entries.length; i += 1) {
      expect(entries[i].getTime()).toBeGreaterThan(entries[i - 1].getTime())
    }
  })

  it('bounds each daytime window between its prayers', () => {
    const [fajr, dhuhr, asr, maghrib] = schedule.windows
    expect(fajr.start).toEqual(schedule.times.fajr)
    expect(fajr.end).toEqual(schedule.times.sunrise)
    expect(dhuhr.start).toEqual(schedule.times.dhuhr)
    expect(asr.end).toEqual(schedule.times.maghrib)
    expect(maghrib.start).toEqual(schedule.times.maghrib)
  })

  it('spans the isha window across midnight to tomorrow fajr', () => {
    const tomorrowFajr = buildDaySchedule(CAIRO, new Date(2026, 7, 23), OPTIONS).times.fajr
    const ishaWindow = schedule.windows[4]
    expect(ishaWindow.key).toBe('isha')
    expect(ishaWindow.start).toEqual(schedule.times.isha)
    expect(ishaWindow.end.getTime()).toBe(tomorrowFajr.getTime())
  })

  it('resolves times for extreme latitudes without crashing', () => {
    const helsinki = buildDaySchedule(
      HELSINKI,
      new Date(2026, 5, 21),
      { ...OPTIONS, highLatitudeRule: 'seventhOfTheNight' }
    )
    expect(helsinki.times.fajr).toBeInstanceOf(Date)
    expect(helsinki.windows).toHaveLength(5)
  })
})

describe('applyIqamahOverrides', () => {
  const base = buildDaySchedule(CAIRO, new Date(2026, 7, 22), OPTIONS)

  it('replaces only the overridden prayers with local-midnight math', () => {
    const merged = applyIqamahOverrides(base.times, { maghrib: 19 * 60 + 15 })
    expect(merged.maghrib.getHours()).toBe(19)
    expect(merged.maghrib.getMinutes()).toBe(15)
    expect(merged.fajr).toEqual(base.times.fajr)
    expect(merged.dhuhr).toEqual(base.times.dhuhr)
  })

  it('returns the original times untouched when there are no overrides', () => {
    expect(applyIqamahOverrides(base.times, null)).toEqual(base.times)
  })
})

describe('nextPrayerAfter', () => {
  const base = buildDaySchedule(CAIRO, new Date(2026, 7, 22), OPTIONS)
  const tomorrowFajr = new Date(2026, 7, 23, 4, 30)

  it('returns the first prayer after now', () => {
    const beforeDhuhr = new Date(base.times.dhuhr.getTime() - 60_000)
    expect(nextPrayerAfter(beforeDhuhr, base.times, tomorrowFajr).key).toBe('dhuhr')
  })

  it('wraps to tomorrow fajr after isha', () => {
    const lateNight = new Date(base.times.isha.getTime() + 3_600_000)
    const upcoming = nextPrayerAfter(lateNight, base.times, tomorrowFajr)
    expect(upcoming.key).toBe('fajr')
    expect(upcoming.at).toEqual(tomorrowFajr)
  })
})

describe('getQiyamWindow', () => {
  it('covers the last third of the night ending at fajr', () => {
    const qiyam = getQiyamWindow(CAIRO, new Date(2026, 7, 22), OPTIONS)
    const nightStart = qiyam.start
    void nightStart

    const schedule = buildDaySchedule(CAIRO, new Date(2026, 7, 22), OPTIONS)
    const maghrib = schedule.times.maghrib.getTime()
    const fajr = schedule.windows[4].end.getTime()
    const expectedStart = maghrib + ((fajr - maghrib) * 2) / 3

    expect(qiyam.start.getTime()).toBeCloseTo(expectedStart, -1)
    expect(qiyam.end.getTime()).toBe(fajr)
  })
})
