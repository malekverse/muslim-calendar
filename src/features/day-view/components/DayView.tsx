import { useState } from 'react'
import { Text, View } from 'react-native'
import { format, intervalToDuration } from 'date-fns'

import { formatHijri } from '@/core/hijri'
import type { RoutineRow } from '@/core/db/schema'

import { WaqtGrid } from './WaqtGrid'
import { RoutineEditorSheet } from './RoutineEditorSheet'
import { Button } from '@/ui/Button'
import type { DayScheduleView } from '../hooks/use-day-schedule'

interface DayViewProps {
  view: DayScheduleView
  hijriOffsetDays: number
  schedules: { id: string; masjidName: string }[]
}

function countdown(target: Date, now: Date): string {
  const { hours = 0, minutes = 0 } = intervalToDuration({ start: now, end: target })
  if (hours === 0 && minutes === 0) return 'now'
  if (hours === 0) return `${minutes}m`
  return `${hours}h ${minutes}m`
}

export function DayView({ view, hijriOffsetDays, schedules }: DayViewProps) {
  const [editingRoutine, setEditingRoutine] = useState<RoutineRow | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)

  function openNew() {
    setEditingRoutine(null)
    setEditorOpen(true)
  }

  function openEdit(routine: RoutineRow) {
    setEditingRoutine(routine)
    setEditorOpen(true)
  }

  return (
    <View className="flex-1 bg-base px-5 pb-4 pt-14">
      <Text className="text-ink-muted text-sm">{format(view.now, 'EEEE, MMMM d')}</Text>
      <View className="mt-1 flex-row items-baseline justify-between">
        <Text className="text-ink text-3xl font-semibold" style={{ writingDirection: 'rtl' }}>
          {formatHijri(view.now, hijriOffsetDays)}
        </Text>
      </View>
      <View className="border-hairline bg-surface mt-4 flex-row items-center justify-between rounded-card border px-4 py-3">
        <Text className="text-ink-muted text-sm">
          Next · <Text className="text-ink font-medium">{view.upcoming.key}</Text>
        </Text>
        <View className="flex-row items-center gap-3">
          <Text className="text-accent tabular-nums">{countdown(view.upcoming.at, view.now)}</Text>
          <Text className="text-ink-faint text-sm tabular-nums">
            {format(view.upcoming.at, 'HH:mm')}
          </Text>
        </View>
      </View>

      <WaqtGrid view={view} onEditRoutine={openEdit} />

      <Button label="Add routine" variant="secondary" className="mt-3" onPress={openNew} />

      <RoutineEditorSheet
        key={editingRoutine?.id ?? 'new-routine'}
        visible={editorOpen}
        initial={editingRoutine}
        onClose={() => setEditorOpen(false)}
        schedules={schedules}
      />
    </View>
  )
}
