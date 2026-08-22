import { View, Text } from 'react-native'

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-base px-5 pt-16">
      <Text className="text-ink text-2xl font-semibold">Settings</Text>
      <Text className="text-ink-muted mt-4 leading-relaxed">
        Location, calculation method, masjid iqamah schedules and the Hijri offset are configured
        here. Configuration arrives with milestone M1.
      </Text>
    </View>
  )
}
