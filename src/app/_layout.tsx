import { useEffect } from 'react'
import { DarkTheme, Stack, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { navColors } from '@/ui/theme'
import { useSettingsStore } from '@/features/settings/model/settings-store'
import { useRoutinesStore } from '@/features/day-view/model/routines-store'

import '../global.css'

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, ...navColors } }

export default function RootLayout() {
  useEffect(() => {
    void useSettingsStore.getState().init().then(() => useRoutinesStore.getState().load())
  }, [])

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  )
}
