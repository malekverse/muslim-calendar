import { useEffect, useMemo } from 'react'
import { DarkTheme, Stack, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { computeDayView } from '@/core/day-schedule'
import { getQiyamWindow } from '@/core/prayer-engine'
import { navColors } from '@/ui/theme'
import { useSettingsStore } from '@/features/settings/model/settings-store'
import { useRoutinesStore } from '@/features/day-view/model/routines-store'
import { useActiveLocation, useEngineOptions } from '@/features/settings/hooks/use-engine-options'
import { jamaatRows, refreshNotifications } from '@/features/evening-ritual/notify'

import '../global.css'

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, ...navColors } }

export default function RootLayout() {
  const hydrated = useSettingsStore((s) => s.hydrated)
  const location = useActiveLocation()
  const options = useEngineOptions()
  const schedules = useSettingsStore((s) => s.schedules)
  const routines = useRoutinesStore((s) => s.routines)
  const prayerReminders = useSettingsStore((s) => s.prayerReminders)
  const qiyamAlarm = useSettingsStore((s) => s.qiyamAlarm)

  useEffect(() => {
    void useSettingsStore.getState().init().then(() => useRoutinesStore.getState().load())
  }, [])

  const dayKey = new Date().toDateString()

  const view = useMemo(
    () => computeDayView({ location, options, schedules, routines }, new Date()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      location?.latitude,
      location?.longitude,
      options,
      schedules,
      routines,
      dayKey,
    ]
  )

  // Rebuild local notifications on app open, preference change, or time drift.
  useEffect(() => {
    if (!hydrated || !view || !location || !options) return
    void refreshNotifications({
      prayers: jamaatRows(view.times),
      qiyam: getQiyamWindow(location, view.now, options),
      prayerReminders,
      qiyamAlarm,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, prayerReminders, qiyamAlarm, view?.times.fajr.getTime()])

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  )
}
