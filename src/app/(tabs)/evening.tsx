import { View, Text } from 'react-native'

export default function EveningScreen() {
  return (
    <View className="flex-1 bg-base px-5 pt-16">
      <Text className="text-ink text-2xl font-semibold">Evening</Text>
      <Text className="text-ink-muted mt-4 leading-relaxed">
        The Islamic day begins at Maghrib. From tonight&apos;s Maghrib until Fajr, this screen holds
        your review of today and your plan for tomorrow — including the qiyam window.
      </Text>
    </View>
  )
}
