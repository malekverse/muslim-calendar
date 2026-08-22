import { useCallback, useEffect, useMemo, useState } from 'react'
import { addDays } from 'date-fns'

import { PRAYER_LABELS } from '@/core/config'
import * as repo from '@/core/db/repos'
import type {
  DayPrayerTimes,
  EngineOptions,
  PrayerKey,
} from '@/core/prayer-engine'
import { buildDaySchedule, getQiyamWindow } from '@/core/prayer-engine'

const JAMAAT_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export interface RitualPrayerRow {
  key: PrayerKey
  time: Date
}

export interface RitualBlockRow {
  routineId: string
  name: string
  start: Date
}

export type CompletionStatus = 'done' | 'missed' | 'skipped'
export type CompletionMap = Record<string, CompletionStatus>

export const completionKey = (refType: 'prayer' | 'routine', refId: string): string =>
  `${refType}:${refId}`

function toRows(times: DayPrayerTimes): RitualPrayerRow[] {
  return JAMAAT_KEYS.map((key) => ({ key, time: times[key] }))
}

/** Ticking clock for the ritual screen. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])
  return now
}

export interface RitualData {
  now: Date
  prayers: RitualPrayerRow[]
  blocks: RitualBlockRow[]
  qiyam: { start: Date; end: Date } | null
  tomorrow: RitualPrayerRow[]
  completions: CompletionMap
}

export function useRitual(input: {
  coordinates: { latitude: number; longitude: number } | null
  options: EngineOptions | null
  blocks: { routineId: string; name: string; start: Date }[] | null
}): RitualData & {
  setCompletion: (
    refType: 'prayer' | 'routine',
    refId: string,
    status: 'done' | 'missed' | null
  ) => Promise<void>
} {
  const { coordinates, options, blocks } = input
  const now = useNow()
  const dayIso = useMemo(
    () => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    [now]
  )

  const [completions, setCompletions] = useState<CompletionMap>({})

  useEffect(() => {
    let cancelled = false
    void repo.listCompletionsByDate(dayIso).then((rows) => {
      if (cancelled) return
      const map: CompletionMap = {}
      for (const row of rows) map[completionKey(row.refType, row.refId)] = row.status
      setCompletions(map)
    })
    return () => {
      cancelled = true
    }
  }, [dayIso])

  const computed = useMemo(() => {
    if (!coordinates || !options) return null
    const today = buildDaySchedule(coordinates, now, options)
    const qiyam = getQiyamWindow(coordinates, now, options)
    const tomorrowTimes = buildDaySchedule(coordinates, addDays(now, 1), options).times
    return {
      prayers: toRows(today.times),
      qiyam,
      tomorrow: toRows(tomorrowTimes),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates?.latitude, coordinates?.longitude, options, dayIso])

  const setCompletion = useCallback(
    async (refType: 'prayer' | 'routine', refId: string, status: 'done' | 'missed' | null) => {
      const key = completionKey(refType, refId)
      if (status === null) {
        await repo.clearCompletion({ date: dayIso, refType, refId })
        setCompletions((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      } else {
        await repo.setCompletion({ date: dayIso, refType, refId }, status)
        setCompletions((prev) => ({ ...prev, [key]: status }))
      }
    },
    [dayIso]
  )

  const safeBlocks: RitualBlockRow[] = useMemo(
    () => (blocks ?? []).map((b) => ({ routineId: b.routineId, name: b.name, start: b.start })),
    [blocks]
  )

  return {
    now,
    prayers: computed?.prayers ?? [],
    blocks: safeBlocks,
    qiyam: computed?.qiyam ?? null,
    tomorrow: computed?.tomorrow ?? [],
    completions,
    setCompletion,
  }
}

export function labelFor(key: PrayerKey): string {
  return PRAYER_LABELS[key]
}
