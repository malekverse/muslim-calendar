import { useEffect, useState } from 'react'

import {
  hasCalendarAccess,
  listEventsForRange,
  type ExternalEvent,
} from '@/core/calendar-store'

const DAY_MS = 86_400_000

/** Reads today's events from the enabled device calendars; empty when access or selection is missing. */
export function useExternalEvents(enabledCalendarIds: string[], now: Date): ExternalEvent[] {
  const [events, setEvents] = useState<ExternalEvent[]>([])
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (enabledCalendarIds.length === 0) {
        if (!cancelled) setEvents([])
        return
      }
      try {
        if (!(await hasCalendarAccess())) return
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const fetched = await listEventsForRange(
          enabledCalendarIds,
          dayStart,
          new Date(dayStart.getTime() + DAY_MS)
        )
        if (!cancelled) setEvents(fetched)
      } catch {
        // Calendar providers can fail transiently; the grid simply shows routines.
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledCalendarIds.join(','), dayKey])

  return events
}
