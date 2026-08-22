import * as Calendar from 'expo-calendar'

import type { DayScheduleInput } from '@/core/day-schedule'
import { computeDayView } from '@/core/day-schedule'

import { requestCalendarAccess } from './index'

export const AURACAL_CALENDAR_TITLE = 'AuraCal'

interface RoutineOccurrence {
  title: string
  start: Date
  end: Date
}

/** Concrete clock-time occurrences for every routine over the next `days` days. */
function projectOccurrences(input: DayScheduleInput, days: number): RoutineOccurrence[] {
  const occurrences: RoutineOccurrence[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const day = new Date()
    day.setDate(day.getDate() + offset)
    const view = computeDayView(input, day)
    if (!view) continue
    for (const block of view.blocks) {
      occurrences.push({ title: block.routine.name, start: block.start, end: block.end })
    }
  }
  return occurrences
}

/**
 * Mirrors anchored routines into an AuraCal-owned device calendar so they surface in
 * Google/Apple/Outlook through OS account sync. The calendar is rebuilt wholesale on each
 * run — prayer-anchored times drift daily, so static recurring events would lie.
 */
export async function syncRoutineCalendar(
  input: DayScheduleInput
): Promise<'synced' | 'no-access' | 'skipped'> {
  if (!input.location || !input.options || input.routines.length === 0) return 'skipped'
  if (!(await requestCalendarAccess())) return 'no-access'

  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
  for (const calendar of calendars) {
    if (calendar.title === AURACAL_CALENDAR_TITLE) {
      await calendar.delete()
    }
  }

  const auraCal = await Calendar.createCalendar({
    title: AURACAL_CALENDAR_TITLE,
    color: '#5FB3A3',
    entityType: Calendar.EntityTypes.EVENT,
  })

  for (const occurrence of projectOccurrences(input, 7)) {
    await auraCal.createEvent({
      title: occurrence.title,
      startDate: occurrence.start,
      endDate: occurrence.end,
      allDay: false,
      notes: 'Scheduled by AuraCal',
    })
  }

  return 'synced'
}
