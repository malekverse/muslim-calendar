import { describe, expect, it } from 'vitest'

import type { RoutineRow } from '@/core/db/schema'

import { computeDayView, resolveBlocks } from './index'

const CAIRO = { latitude: 30.0444, longitude: 31.2357 }
const OPTIONS = {
  method: 'ummAlQura',
  highLatitudeRule: 'middleOfTheNight',
} as const

const NOON = new Date(2026, 7, 22, 12, 0)

function routine(overrides: Partial<RoutineRow>): RoutineRow {
  return {
    id: 'r1',
    name: 'Quran',
    category: 'worship',
    anchorKind: 'prayer',
    anchorPrayer: 'fajr',
    anchorScheduleId: null,
    offsetMinutes: 0,
    durationMinutes: 30,
    daysJson: '[]',
    ...overrides,
  }
}

describe('resolveBlocks', () => {
  it('places a block at anchor plus offset and computes its end', () => {
    const times = computeDayView(
      { location: CAIRO, options: OPTIONS, schedules: [], routines: [] },
      NOON
    )!
    const midnight = new Date(NOON.getFullYear(), NOON.getMonth(), NOON.getDate())
    const blocks = resolveBlocks([routine({ offsetMinutes: 45 })], times.times, midnight, NOON.getDay())

    const fajr = times.times.fajr
    expect(blocks[0].start.getTime()).toBe(fajr.getTime() + 45 * 60_000)
    expect(blocks[0].end.getTime()).toBe(fajr.getTime() + 75 * 60_000)
  })

  it('filters by weekday recurrence; empty list means every day', () => {
    const times = computeDayView(
      { location: CAIRO, options: OPTIONS, schedules: [], routines: [] },
      NOON
    )!
    const midnight = new Date(NOON.getFullYear(), NOON.getMonth(), NOON.getDate())
    const saturdayOnly = resolveBlocks(
      [routine({ id: 'sat', daysJson: '[6]' })],
      times.times,
      midnight,
      6
    )
    expect(saturdayOnly).toHaveLength(1)

    const monday = resolveBlocks([routine({ id: 'sat', daysJson: '[6]' })], times.times, midnight, 1)
    expect(monday).toHaveLength(0)

    const everyDay = resolveBlocks([routine({})], times.times, midnight, 3)
    expect(everyDay).toHaveLength(1)
  })
})

describe('computeDayView', () => {
  const input = {
    location: CAIRO,
    options: OPTIONS,
    schedules: [],
    routines: [routine({ name: 'Deep work', anchorPrayer: 'fajr' })],
  }

  it('returns null without a location or options', () => {
    expect(computeDayView({ ...input, location: null }, NOON)).toBeNull()
    expect(computeDayView({ ...input, options: null }, NOON)).toBeNull()
  })

  it('sorts hard blocks and separates all-day events', () => {
    const view = computeDayView(
      {
        ...input,
        externalEvents: [
          { id: 'e2', title: 'Late meeting', start: new Date(2026, 7, 22, 18, 0), end: new Date(2026, 7, 22, 19, 0), isAllDay: false },
          { id: 'e1', title: 'Standup', start: new Date(2026, 7, 22, 9, 0), end: new Date(2026, 7, 22, 9, 15), isAllDay: false },
          { id: 'e3', title: 'Eid prep', start: new Date(2026, 7, 22, 0, 0), end: new Date(2026, 7, 23, 0, 0), isAllDay: true },
        ],
      },
      NOON
    )!

    expect(view.hardBlocks.map((b) => b.id)).toEqual(['e1', 'e2'])
    expect(view.allDayTitles).toEqual(['Eid prep'])
  })

  it('clamps events that started before today to midnight', () => {
    const view = computeDayView(
      {
        ...input,
        externalEvents: [
          { id: 'overnight', title: 'Travel night', start: new Date(2026, 7, 21, 23, 0), end: new Date(2026, 7, 22, 5, 0), isAllDay: false },
        ],
      },
      NOON
    )!

    const midnight = new Date(2026, 7, 22, 0, 0)
    expect(view.hardBlocks[0].start.getTime()).toBe(midnight.getTime())
    expect(view.hardBlocks[0].end.getTime()).toBe(new Date(2026, 7, 22, 5, 0).getTime())
  })

  it('applies the latest valid iqamah schedule before falling back to calculation', () => {
    const withSchedule = computeDayView(
      {
        ...input,
        schedules: [
          { id: 'old', masjidName: 'A', effectiveFrom: '2026-08-01', fajr: 4 * 60 + 40, dhuhr: null, asr: null, maghrib: null, isha: null },
          { id: 'newer-but-future', masjidName: 'B', effectiveFrom: '2026-09-01', fajr: 5 * 60, dhuhr: null, asr: null, maghrib: null, isha: null },
        ],
      },
      NOON
    )!

    expect(withSchedule.times.fajr.getHours()).toBe(4)
    expect(withSchedule.times.fajr.getMinutes()).toBe(40)
    // Non-overridden prayers remain calculated.
    expect(withSchedule.times.dhuhr).toEqual(
      computeDayView({ ...input, schedules: [] }, NOON)!.times.dhuhr
    )
  })
})
