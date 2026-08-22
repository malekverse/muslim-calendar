import { router } from 'expo-router'
import { Text, View } from 'react-native'

import type { ExternalEvent } from '@/core/calendar-store'
import type { EngineOptions } from '@/core/prayer-engine'
import type { IqamahScheduleRow, LocationRow, RoutineRow } from '@/core/db/schema'
import { DayView } from '@/features/day-view/components/DayView'
import { useDaySchedule } from '@/features/day-view/hooks/use-day-schedule'
import { useExternalEvents } from '@/features/day-view/hooks/use-external-events'
import { useRoutinesStore } from '@/features/day-view/model/routines-store'
import { useActiveLocation, useEngineOptions } from '@/features/settings/hooks/use-engine-options'
import { useSettingsStore } from '@/features/settings/model/settings-store'
import { Button } from '@/ui/Button'
import { Loading } from '@/ui/Loading'

interface Wiring {
  location: Pick<LocationRow, 'latitude' | 'longitude'> | null
  options: EngineOptions | null
  schedules: IqamahScheduleRow[]
  routines: RoutineRow[]
  externalEvents?: ExternalEvent[]
}

export default function TodayScreen() {
  const hydrated = useSettingsStore((s) => s.hydrated)
  const routinesLoaded = useRoutinesStore((s) => s.loaded)

  const location = useActiveLocation()
  const options = useEngineOptions()
  const schedules = useSettingsStore((s) => s.schedules)
  const hijriOffsetDays = useSettingsStore((s) => s.hijriOffsetDays)
  const enabledCalendarIds = useSettingsStore((s) => s.enabledCalendarIds)
  const routines = useRoutinesStore((s) => s.routines)

  const externalEvents = useExternalEvents(enabledCalendarIds, new Date())

  const view = useDaySchedule({
    location,
    options,
    schedules,
    routines,
    externalEvents,
  } satisfies Wiring)

  if (!hydrated || !routinesLoaded) return <Loading />

  if (!view) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-8">
        <Text className="text-ink mb-2 text-center text-xl font-semibold">
          Set your location to begin
        </Text>
        <Text className="text-ink-muted mb-6 text-center leading-relaxed">
          AuraCal computes prayer times on your device and organizes your day around them.
        </Text>
        <Button label="Open Settings" onPress={() => router.push('/(tabs)/settings')} />
      </View>
    )
  }

  return <DayView view={view} hijriOffsetDays={hijriOffsetDays} schedules={schedules.map((s) => ({ id: s.id, masjidName: s.masjidName }))} />
}
