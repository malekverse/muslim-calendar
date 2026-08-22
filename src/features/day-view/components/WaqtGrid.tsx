import { Pressable, Text, View } from 'react-native'
import { format, isWithinInterval } from 'date-fns'

import { PRAYER_LABELS, WAQT_ARABIC } from '@/core/config'
import type { RoutineRow } from '@/core/db/schema'

import type { DayScheduleView } from '../hooks/use-day-schedule'

const GRID_BASE_HEIGHT = 560
const MIN_WINDOW_HEIGHT = 72

function minutesBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 60_000))
}

interface WaqtGridProps {
  view: DayScheduleView
  onEditRoutine: (routine: RoutineRow) => void
}

export function WaqtGrid({ view, onEditRoutine }: WaqtGridProps) {
  const totalMinutes = minutesBetween(view.windows[0].start, view.windows[4].end)

  return (
    <View className="gap-2">
      {view.windows.map((window) => {
        const duration = minutesBetween(window.start, window.end)
        const height = Math.max(
          MIN_WINDOW_HEIGHT,
          Math.round((duration / totalMinutes) * GRID_BASE_HEIGHT)
        )
        const isNow = isWithinInterval(view.now, { start: window.start, end: window.end })
        const blocks = view.blocks.filter((b) => b.start >= window.start && b.start < window.end)
        const elapsed = Math.min(
          100,
          Math.max(0, ((view.now.getTime() - window.start.getTime()) / (duration * 60_000)) * 100)
        )

        return (
          <View
            key={window.key}
            style={{ height }}
            className={`relative overflow-hidden rounded-card border bg-surface px-3 py-2.5 ${
              isNow ? 'border-accent/70' : 'border-hairline'
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-ink text-sm font-medium">{PRAYER_LABELS[window.key]}</Text>
                <Text className="text-ink-faint mt-0.5 text-xs tabular-nums">
                  {format(window.start, 'HH:mm')} – {format(window.end, 'HH:mm')}
                </Text>
              </View>
              <Text className="text-accent text-lg" style={{ writingDirection: 'rtl' }}>
                {WAQT_ARABIC[window.key]}
              </Text>
            </View>

            <View className="mt-2 gap-1.5">
              {blocks.map(({ routine, start }) => (
                <Pressable
                  key={routine.id}
                  onPress={() => onEditRoutine(routine)}
                  className="bg-raised flex-row items-center justify-between rounded-xl border border-hairline px-2.5 py-1.5"
                  android_ripple={{ color: '#262C34' }}
                >
                  <Text className="text-ink text-xs" numberOfLines={1}>
                    {routine.name}
                  </Text>
                  <Text className="text-ink-muted text-xs tabular-nums">
                    {format(start, 'HH:mm')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {isNow && (
              <View pointerEvents="none" className="absolute inset-x-0" style={{ top: `${elapsed}%` }}>
                <View className="h-0.5 w-full bg-accent" />
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}
