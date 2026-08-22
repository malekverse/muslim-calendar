import * as Calendar from 'expo-calendar'

export interface CalendarSource {
  id: string
  title: string
  color: string | null
}

export interface ExternalEvent {
  id: string
  title: string
  start: Date
  end: Date
  isAllDay: boolean
}

export async function hasCalendarAccess(): Promise<boolean> {
  const response = await Calendar.getCalendarPermissions()
  return response.granted
}

export async function requestCalendarAccess(): Promise<boolean> {
  const response = await Calendar.requestCalendarPermissions()
  return response.granted
}

/** All EVENT-entity calendars on the device (iCloud, Gmail, Outlook, local...). */
export async function listSources(): Promise<CalendarSource[]> {
  const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT)
  return calendars.map((calendar) => ({
    id: calendar.id,
    title: calendar.title || 'Untitled calendar',
    color: calendar.color ?? null,
  }))
}

/** Fixed clock-time events overlapping [start, end) from the selected sources. */
export async function listEventsForRange(
  sourceIds: string[],
  start: Date,
  end: Date
): Promise<ExternalEvent[]> {
  if (sourceIds.length === 0) return []
  const events = await Calendar.listEvents(sourceIds, start, end)
  return events.map((event) => ({
    id: event.id,
    title: event.title ?? '(untitled event)',
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    isAllDay: event.allDay,
  }))
}

export { syncRoutineCalendar, AURACAL_CALENDAR_TITLE } from './sync'
