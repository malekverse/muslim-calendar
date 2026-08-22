import { View, Text } from 'react-native'
import { format } from 'date-fns'

function hijriDate(date: Date): string {
  return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export default function TodayScreen() {
  const now = new Date()
  return (
    <View className="flex-1 bg-base px-5 pt-16">
      <Text className="text-ink-muted text-sm">{format(now, 'EEEE, MMMM d')}</Text>
      <Text className="text-ink mt-1 text-2xl font-semibold">
        {hijriDate(now)}
      </Text>
      <View className="mt-8 rounded-card border border-hairline bg-surface p-4">
        <Text className="text-ink text-base">No location set yet.</Text>
        <Text className="text-ink-muted mt-1 text-sm">
          Prayer times and the waqt grid appear once a location is configured in Settings.
        </Text>
      </View>
    </View>
  )
}
