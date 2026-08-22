import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { router } from 'expo-router'

import { RitualView } from '@/features/evening-ritual/components/RitualView'
import { useRitual } from '@/features/evening-ritual/hooks/use-ritual'
import { refreshNotifications } from '@/features/evening-ritual/notify'
import { useDaySchedule } from '@/features/day-view/hooks/use-day-schedule'
import { useRoutinesStore } from '@/features/day-view/model/routines-store'
import { useActiveLocation, useEngineOptions } from '@/features/settings/hooks/use-engine-options'
import { useSettingsStore } from '@/features/settings/model/settings-store'
import { Button } from '@/ui/Button'
import { Loading } from '@/ui/Loading'

export default function EveningScreen() {
  const hydrated = useSettingsStore((s) => s.hydrated)
  const routinesLoaded = useRoutinesStore((s) => s.loaded)

  const location = useActiveLocation()
  const options = useEngineOptions()
  const schedules = useSettingsStore((s) => s.schedules)
  const routines = useRoutinesStore((s) => s.routines)
  const prayerReminders = useSettingsStore((s) => s.prayerReminders)
  const qiyamAlarm = useSettingsStore((s) => s.qiyamAlarm)

  const view = useDaySchedule({ location, options, schedules, routines })

  const ritual = useRitual({
    coordinates: location ? { latitude: location.latitude, longitude: location.longitude } : null,
    options,
    blocks:
      view?.blocks.map((b) => ({
        routineId: b.routine.id,
        name: b.routine.name,
        start: b.start,
      })) ?? null,
  })

  useEffect(() => {
    if (!hydrated || !location) return
    void refreshNotifications({
      prayers: ritual.prayers,
      qiyam: ritual.qiyam,
      prayerReminders,
      qiyamAlarm,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, prayerReminders, qiyamAlarm, view?.upcoming.at.getTime()])

  if (!hydrated || !routinesLoaded) return <Loading />

  if (!view) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-8">
        <Text className="text-ink mb-2 text-center text-xl font-semibold">
          The evening needs a place
        </Text>
        <Text className="text-ink-muted mb-6 text-center leading-relaxed">
          Set your location so AuraCal knows when Maghrib begins tonight.
        </Text>
        <Button label="Open Settings" onPress={() => router.push('/(tabs)/settings')} />
      </View>
    )
  }

  return (
    <RitualView
      now={ritual.now}
      prayers={ritual.prayers}
      blocks={ritual.blocks}
      qiyam={ritual.qiyam}
      tomorrow={ritual.tomorrow}
      completions={ritual.completions}
      onSetCompletion={(refType, refId, status) =>
        void ritual.setCompletion(refType, refId, status)
      }
      prayerReminders={prayerReminders}
      qiyamAlarm={qiyamAlarm}
      onTogglePrayerReminders={(v) => void useSettingsStore.getState().setPrayerReminders(v)}
      onToggleQiyamAlarm={(v) => void useSettingsStore.getState().setQiyamAlarm(v)}
    />
  )
}
