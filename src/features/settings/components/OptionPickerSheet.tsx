import { Pressable, Text, View } from 'react-native'

import { Sheet } from '@/ui/Sheet'

interface OptionPickerProps<K extends string> {
  visible: boolean
  title: string
  options: { key: K; label: string }[]
  value: K | null
  onSelect: (key: K) => void
  onClose: () => void
}

export function OptionPickerSheet<K extends string>({
  visible,
  title,
  options,
  value,
  onSelect,
  onClose,
}: OptionPickerProps<K>) {
  return (
    <Sheet visible={visible} title={title} onClose={onClose}>
      <View className="mb-2">
        {options.map((option) => {
          const selected = option.key === value
          return (
            <Pressable
              key={option.key}
              onPress={() => {
                onSelect(option.key)
                onClose()
              }}
              className="mb-1 flex-row items-center justify-between rounded-card px-4 py-3"
              android_ripple={{ color: '#262C34' }}
            >
              <Text className={`text-base ${selected ? 'text-accent font-medium' : 'text-ink'}`}>
                {option.label}
              </Text>
              {selected && <View className="h-2 w-2 rounded-full bg-accent" />}
            </Pressable>
          )
        })}
      </View>
    </Sheet>
  )
}
