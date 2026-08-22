import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'

import { CATEGORY_OPTIONS, PRAYER_LABELS } from '@/core/config'
import type { NewRoutineRow, RoutineRow } from '@/core/db/schema'
import type { PrayerKey } from '@/core/prayer-engine'
import { Button } from '@/ui/Button'
import { Field, Input } from '@/ui/Input'
import { Sheet } from '@/ui/Sheet'

import { useRoutinesStore } from '../model/routines-store'

const PRAYER_ANCHORS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
const JAMAAT_ANCHORS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface ChipRowProps {
  options: { key: string; label: string }[]
  value: string | null
  onChange: (key: string) => void
}

function ChipRow({ options, value, onChange }: ChipRowProps) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.key === value
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`rounded-full border px-3 py-1.5 ${
              selected ? 'border-accent bg-accent/15' : 'border-hairline bg-raised'
            }`}
          >
            <Text className={`text-xs ${selected ? 'text-accent font-medium' : 'text-ink-muted'}`}>
              {option.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

function Stepper({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step: number
  suffix: string
}) {
  return (
    <View className="flex-row items-center gap-4">
      <Pressable
        disabled={value <= min}
        onPress={() => onChange(value - step)}
        className="border-hairline bg-raised h-9 w-9 items-center justify-center rounded-full border"
      >
        <Text className="text-ink text-xl">−</Text>
      </Pressable>
      <Text className="text-ink w-20 text-center tabular-nums">
        {value > 0 && suffix === 'min after' ? '+' : ''}
        {value} {suffix === 'min after' ? 'min' : value === 1 ? 'min' : 'mins'}
      </Text>
      <Pressable
        disabled={value >= max}
        onPress={() => onChange(value + step)}
        className="border-hairline bg-raised h-9 w-9 items-center justify-center rounded-full border"
      >
        <Text className="text-ink text-xl">+</Text>
      </Pressable>
    </View>
  )
}

interface RoutineEditorProps {
  visible: boolean
  initial: RoutineRow | null
  schedules: { id: string; masjidName: string }[]
  onClose: () => void
}

export function RoutineEditorSheet({ visible, initial, schedules, onClose }: RoutineEditorProps) {
  const addRoutine = useRoutinesStore((s) => s.add)
  const editRoutine = useRoutinesStore((s) => s.edit)
  const removeRoutine = useRoutinesStore((s) => s.remove)

  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<string>(initial?.category ?? 'custom')
  const [anchorKind, setAnchorKind] = useState<'prayer' | 'iqamah'>(initial?.anchorKind ?? 'prayer')
  const [anchorPrayer, setAnchorPrayer] = useState<PrayerKey>(initial?.anchorPrayer ?? 'fajr')
  const [scheduleId, setScheduleId] = useState<string | null>(initial?.anchorScheduleId ?? null)
  const [offset, setOffset] = useState(initial?.offsetMinutes ?? 0)
  const [duration, setDuration] = useState(initial?.durationMinutes ?? 30)
  const [days, setDays] = useState<number[]>(() =>
    initial ? (JSON.parse(initial.daysJson) as number[]) : []
  )

  const valid =
    name.trim().length > 0 &&
    (anchorKind === 'prayer' || (scheduleId !== null && schedules.length > 0))

  async function save() {
    if (!valid) return
    const payload: Omit<NewRoutineRow, 'id'> = {
      name: name.trim(),
      category: category as NewRoutineRow['category'],
      anchorKind,
      anchorPrayer,
      anchorScheduleId: anchorKind === 'iqamah' ? scheduleId : null,
      offsetMinutes: offset,
      durationMinutes: duration,
      daysJson: JSON.stringify(days),
    }
    if (initial) await editRoutine(initial.id, payload)
    else await addRoutine(payload)
    onClose()
  }

  function confirmDelete() {
    if (!initial) return
    Alert.alert('Delete routine', `"${initial.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void removeRoutine(initial.id)
          onClose()
        },
      },
    ])
  }

  const anchorOptions =
    anchorKind === 'prayer'
      ? PRAYER_ANCHORS.map((key) => ({ key, label: PRAYER_LABELS[key] }))
      : JAMAAT_ANCHORS.map((key) => ({ key, label: PRAYER_LABELS[key as PrayerKey] }))

  return (
    <Sheet visible={visible} title={initial ? 'Edit routine' : 'New routine'} onClose={onClose}>
      <Field label="Name">
        <Input value={name} onChangeText={setName} placeholder="Quran, deep work, gym..." />
      </Field>

      <Field label="Category">
        <ChipRow
          options={CATEGORY_OPTIONS.map((c) => ({ key: c.key, label: c.label }))}
          value={category}
          onChange={setCategory}
        />
      </Field>

      <Field label="Anchored to">
        <ChipRow
          options={[
            { key: 'prayer', label: 'Calculated time' },
            { key: 'iqamah', label: 'Masjid jamaah' },
          ]}
          value={anchorKind}
          onChange={(key) => setAnchorKind(key as 'prayer' | 'iqamah')}
        />
      </Field>

      <Field label="Anchor">
        <ChipRow
          options={anchorOptions}
          value={anchorPrayer}
          onChange={(key) => setAnchorPrayer(key as PrayerKey)}
        />
      </Field>

      {anchorKind === 'iqamah' && (
        <Field label="Masjid">
          {schedules.length === 0 ? (
            <Text className="text-danger text-sm">
              No iqamah schedule yet — add one in Settings first.
            </Text>
          ) : (
            <ChipRow
              options={schedules.map((s) => ({ key: s.id, label: s.masjidName }))}
              value={scheduleId}
              onChange={setScheduleId}
            />
          )}
        </Field>
      )}

      <Field label="Starts">
        <Stepper value={offset} onChange={setOffset} min={-180} max={180} step={5} suffix="min after" />
      </Field>
      <Field label="Duration">
        <Stepper value={duration} onChange={setDuration} min={5} max={240} step={5} suffix="mins" />
      </Field>

      <Field label="Days (none = every day)">
        <View className="flex-row gap-1.5">
          {DAY_LABELS.map((label, index) => {
            const selected = days.includes(index)
            return (
              <Pressable
                key={`${label}-${index}`}
                onPress={() =>
                  setDays((prev) =>
                    prev.includes(index) ? prev.filter((d) => d !== index) : [...prev, index]
                  )
                }
                className={`h-9 flex-1 items-center justify-center rounded-lg border ${
                  selected ? 'border-accent bg-accent/15' : 'border-hairline bg-raised'
                }`}
              >
                <Text className={`text-xs ${selected ? 'text-accent font-medium' : 'text-ink-muted'}`}>
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </Field>

      <View className="mt-2 flex-row gap-3">
        {initial && <Button label="Delete" variant="danger" onPress={confirmDelete} />}
        <Button label={initial ? 'Save changes' : 'Add routine'} disabled={!valid} onPress={save} className="flex-1" />
      </View>
    </Sheet>
  )
}
