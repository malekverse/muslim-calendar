import { Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { format } from 'date-fns'

import { PRAYER_LABELS } from '@/core/config'
import type { PrayerKey } from '@/core/prayer-engine'

import { colors } from '@/ui/theme'

import type {
  CompletionMap,
  CompletionStatus,
  RitualBlockRow,
  RitualPrayerRow,
} from '../hooks/use-ritual'

interface RitualViewProps {
  now: Date
  prayers: RitualPrayerRow[]
  blocks: RitualBlockRow[]
  qiyam: { start: Date; end: Date } | null
  tomorrow: RitualPrayerRow[]
  completions: CompletionMap
  onSetCompletion: (
    refType: 'prayer' | 'routine',
    refId: string,
    status: 'done' | 'missed' | null
  ) => void
  prayerReminders: boolean
  qiyamAlarm: boolean
  onTogglePrayerReminders: (value: boolean) => void
  onToggleQiyamAlarm: (value: boolean) => void
}

function StatusButtons({
  status,
  onPress,
}: {
  status: CompletionStatus | undefined
  onPress: (next: 'done' | 'missed' | null) => void
}) {
  return (
    <View className="flex-row gap-1.5">
      <Pressable
        onPress={() => onPress(status === 'done' ? null : 'done')}
        className={`h-8 w-8 items-center justify-center rounded-full border ${
          status === 'done' ? 'border-accent bg-accent/15' : 'border-hairline'
        }`}
      >
        <Text className={status === 'done' ? 'text-accent' : 'text-ink-faint'}>✓</Text>
      </Pressable>
      <Pressable
        onPress={() => onPress(status === 'missed' ? null : 'missed')}
        className={`h-8 w-8 items-center justify-center rounded-full border ${
          status === 'missed' ? 'border-danger bg-danger/15' : 'border-hairline'
        }`}
      >
        <Text className={status === 'missed' ? 'text-danger' : 'text-ink-faint'}>✗</Text>
      </Pressable>
    </View>
  )
}

function ReviewRow({
  title,
  time,
  status,
  onSetStatus,
}: {
  title: string
  time: Date
  status: CompletionStatus | undefined
  onSetStatus: (next: 'done' | 'missed' | null) => void
}) {
  return (
    <View className="border-hairline bg-surface flex-row items-center justify-between rounded-card border px-4 py-3">
      <View>
        <Text className="text-ink">{title}</Text>
        <Text className="text-ink-faint mt-0.5 text-xs tabular-nums">{format(time, 'HH:mm')}</Text>
      </View>
      <StatusButtons status={status} onPress={onSetStatus} />
    </View>
  )
}

function ToggleRow({
  label,
  caption,
  value,
  onChange,
}: {
  label: string
  caption?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <View className="border-hairline bg-surface rounded-card border px-4 py-3.5">
      <View className="flex-row items-center justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-ink">{label}</Text>
          {caption && <Text className="text-ink-faint mt-0.5 text-xs">{caption}</Text>}
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.hairline, true: colors.accent }}
          thumbColor={colors.ink}
        />
      </View>
    </View>
  )
}

export function RitualView(props: RitualViewProps) {
  const maghrib = props.prayers.find((p) => p.key === ('maghrib' as PrayerKey))

  return (
    <ScrollView className="flex-1 bg-base" contentContainerClassName="px-5 pb-16 pt-14">
      <Text className="text-ink-muted text-sm">{format(props.now, 'EEEE, MMMM d')}</Text>
      <Text className="text-ink text-3xl font-semibold">Evening</Text>

      {maghrib && (
        <Text className="text-ink-muted mt-2 leading-relaxed">
          Tonight begins at Maghrib ({format(maghrib.time, 'HH:mm')}). Review today, then look at
          tomorrow.
        </Text>
      )}

      <Text className="text-ink-faint mb-2 mt-8 text-xs font-semibold uppercase tracking-widest">
        Review today
      </Text>
      <View className="gap-2">
        {props.prayers.map((prayer) => (
          <ReviewRow
            key={prayer.key}
            title={PRAYER_LABELS[prayer.key]}
            time={prayer.time}
            status={props.completions[`prayer:${prayer.key}`]}
            onSetStatus={(next) => props.onSetCompletion('prayer', prayer.key, next)}
          />
        ))}
        {props.blocks.map((block) => (
          <ReviewRow
            key={block.routineId}
            title={block.name}
            time={block.start}
            status={props.completions[`routine:${block.routineId}`]}
            onSetStatus={(next) => props.onSetCompletion('routine', block.routineId, next)}
          />
        ))}
      </View>

      <Text className="text-ink-faint mb-2 mt-8 text-xs font-semibold uppercase tracking-widest">
        Qiyam tonight
      </Text>
      {props.qiyam ? (
        <ToggleRow
          label={`Last third · ${format(props.qiyam.start, 'HH:mm')} – ${format(props.qiyam.end, 'HH:mm')}`}
          caption="Wake me when the window opens"
          value={props.qiyamAlarm}
          onChange={(v) => props.onToggleQiyamAlarm(v)}
        />
      ) : (
        <Text className="text-ink-muted text-sm">Set a location to compute the qiyam window.</Text>
      )}

      <Text className="text-ink-faint mb-2 mt-8 text-xs font-semibold uppercase tracking-widest">
        Tomorrow
      </Text>
      <View className="border-hairline bg-surface rounded-card border px-4 py-3">
        {props.tomorrow.map((prayer) => (
          <View key={prayer.key} className="flex-row items-center justify-between py-1.5">
            <Text className="text-ink">{PRAYER_LABELS[prayer.key]}</Text>
            <Text className="text-ink-muted tabular-nums">{format(prayer.time, 'HH:mm')}</Text>
          </View>
        ))}
        <Text className="text-ink-faint mt-2 text-xs leading-relaxed">
          Your anchored routines shift with these times automatically.
        </Text>
      </View>

      <Text className="text-ink-faint mb-2 mt-8 text-xs font-semibold uppercase tracking-widest">
        Reminders
      </Text>
      <ToggleRow
        label="Prayer reminders"
        caption="Rebuilt for the rest of today each time you open AuraCal"
        value={props.prayerReminders}
        onChange={(v) => props.onTogglePrayerReminders(v)}
      />
    </ScrollView>
  )
}
