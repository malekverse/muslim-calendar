import { ActivityIndicator, Text, View } from 'react-native'

import { colors } from './theme'

export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-base">
      <ActivityIndicator color={colors.accent} />
      <Text className="text-ink-faint mt-3 text-sm">{label}...</Text>
    </View>
  )
}
