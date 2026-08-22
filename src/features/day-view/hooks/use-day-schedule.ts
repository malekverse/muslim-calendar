import { useEffect, useMemo, useState } from 'react'

import { computeDayView, type DayScheduleInput, type DayScheduleView } from '@/core/day-schedule'

export * from '@/core/day-schedule'

/** Ticking clock shared by countdowns and the now-marker. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

export function useDaySchedule(input: DayScheduleInput): DayScheduleView | null {
  const now = useNow()
  const { location, options, schedules, routines, externalEvents } = input
  return useMemo(
    () => computeDayView({ location, options, schedules, routines, externalEvents }, now),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      location?.latitude,
      location?.longitude,
      options,
      schedules,
      routines,
      externalEvents,
      now,
    ]
  )
}
