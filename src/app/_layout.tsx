import { DarkTheme, Stack, ThemeProvider } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

import { navColors } from '@/ui/theme'

import '../global.css'

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, ...navColors } }

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  )
}
