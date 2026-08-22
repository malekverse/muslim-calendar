import { Text, TextInput, View, type TextInputProps } from 'react-native'

const INPUT_CLASS =
  'w-full rounded-card border border-hairline bg-raised px-3 py-2.5 text-ink text-base'

export function Input(props: TextInputProps) {
  return <TextInput placeholderTextColor="#626B76" className={INPUT_CLASS} {...props} />
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-4">
      <Text className="text-ink-muted mb-1.5 text-xs font-medium uppercase tracking-wide">
        {label}
      </Text>
      {children}
    </View>
  )
}
