import { Modal, Pressable, Text, View } from 'react-native'

interface SheetProps {
  visible: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}

export function Sheet({ visible, title, onClose, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="rounded-sheet border-hairline bg-surface px-5 pb-10 pt-5"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-ink text-lg font-semibold">{title}</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text className="text-ink-faint text-sm">Done</Text>
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
