import { useState } from 'react'
import { Text, View } from 'react-native'

import { PRAYER_LABELS } from '@/core/config'
import * as repo from '@/core/db/repos'
import type { PrayerKey } from '@/core/prayer-engine'
import { Button } from '@/ui/Button'
import { Field, Input } from '@/ui/Input'
import { Sheet } from '@/ui/Sheet'

import { useSettingsStore } from '../model/settings-store'

const JAMAAT_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type JamaatKey = (typeof JAMAAT_PRAYERS)[number]

function parseHmToMinutes(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return null
  return h * 60 + m
}

interface ScheduleFormSheetProps {
  visible: boolean
  onClose: () => void
}

export function ScheduleFormSheet({ visible, onClose }: ScheduleFormSheetProps) {
  const upsertSchedule = useSettingsStore((s) => s.upsertSchedule)

  const [masjidName, setMasjidName] = useState('')
  const [times, setTimes] = useState<Record<JamaatKey, string>>({
    fajr: '',
    dhuhr: '',
    asr: '',
    maghrib: '',
    isha: '',
  })
  const [invalid, setInvalid] = useState(false)

  const validName = masjidName.trim().length > 0
  const anyTimeEntered = Object.values(times).some((v) => v.trim().length > 0)
  const allValid = Object.values(times).every((v) => v.trim() === '' || parseHmToMinutes(v) !== null)

  async function save() {
    if (!validName || !anyTimeEntered || !allValid) {
      setInvalid(true)
      return
    }
    const overrides: Partial<Record<JamaatKey, number>> = {}
    for (const key of JAMAAT_PRAYERS) {
      const minutes = parseHmToMinutes(times[key])
      if (minutes !== null && minutes !== undefined) overrides[key] = minutes
    }

    await upsertSchedule({
      id: repo.newId(),
      masjidName: masjidName.trim(),
      effectiveFrom: new Date().toISOString().slice(0, 10),
      fajr: overrides.fajr ?? null,
      dhuhr: overrides.dhuhr ?? null,
      asr: overrides.asr ?? null,
      maghrib: overrides.maghrib ?? null,
      isha: overrides.isha ?? null,
    })

    setMasjidName('')
    setTimes({ fajr: '', dhuhr: '', asr: '', maghrib: '', isha: '' })
    setInvalid(false)
    onClose()
  }

  return (
    <Sheet visible={visible} title="Add iqamah schedule" onClose={onClose}>
      <Field label="Masjid name">
        <Input value={masjidName} onChangeText={setMasjidName} placeholder="e.g. Masjid An-Nour" />
      </Field>
      <View className="flex-row flex-wrap gap-3">
        {JAMAAT_PRAYERS.map((key: JamaatKey) => (
          <View key={key} className="grow basis-[30%]">
            <Field label={PRAYER_LABELS[key as PrayerKey]}>
              <Input
                value={times[key]}
                onChangeText={(text) => setTimes((prev) => ({ ...prev, [key]: text }))}
                placeholder="HH:mm"
                keyboardType="numbers-and-punctuation"
              />
            </Field>
          </View>
        ))}
      </View>
      <Text className="text-ink-faint mb-4 text-xs leading-relaxed">
        Leave a prayer blank to keep using the calculated time. Times are congregation (jamaah)
        start times in 24h format.
      </Text>
      {invalid && !allValid && (
        <Text className="text-danger mb-3 text-sm">Check the entered times (HH:mm).</Text>
      )}
      <Button
        label="Save schedule"
        disabled={!validName || !anyTimeEntered || !allValid}
        onPress={save}
      />
    </Sheet>
  )
}
