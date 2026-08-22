import { useState } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import * as Location from 'expo-location'

import { DEFAULT_HIGH_LATITUDE_RULE, DEFAULT_METHOD } from '@/core/config'
import type { LocationRow } from '@/core/db/schema'
import { Button } from '@/ui/Button'
import { Field, Input } from '@/ui/Input'
import { Sheet } from '@/ui/Sheet'

import { useSettingsStore } from '../model/settings-store'

interface LocationFormSheetProps {
  visible: boolean
  initial: LocationRow | null
  onClose: () => void
}

export function LocationFormSheet({ visible, initial, onClose }: LocationFormSheetProps) {
  const addLocation = useSettingsStore((s) => s.addLocation)
  const editLocation = useSettingsStore((s) => s.editLocation)

  const [label, setLabel] = useState(initial?.label ?? '')
  const [latitude, setLatitude] = useState(initial ? String(initial.latitude) : '')
  const [longitude, setLongitude] = useState(initial ? String(initial.longitude) : '')
  const [locating, setLocating] = useState(false)

  const validLabel = label.trim().length > 0
  const lat = Number(latitude)
  const lng = Number(longitude)
  const validCoords = Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lng) && Math.abs(lng) <= 180

  async function useCurrentLocation() {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Enable location access to detect your position.')
        return
      }
      const position = await Location.getCurrentPositionAsync({})
      setLatitude(position.coords.latitude.toFixed(5))
      setLongitude(position.coords.longitude.toFixed(5))
    } finally {
      setLocating(false)
    }
  }

  async function save() {
    if (!validLabel || !validCoords) return
    const payload = {
      label: label.trim(),
      latitude: lat,
      longitude: lng,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
    if (initial) {
      await editLocation(initial.id, payload)
    } else {
      await addLocation({
        ...payload,
        method: DEFAULT_METHOD,
        highLatitudeRule: DEFAULT_HIGH_LATITUDE_RULE,
        madhab: null,
      })
    }
    onClose()
  }

  return (
    <Sheet visible={visible} title={initial ? 'Edit location' : 'Add location'} onClose={onClose}>
      <Field label="Name">
        <Input value={label} onChangeText={setLabel} placeholder="Home, Work, Campus..." />
      </Field>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Field label="Latitude">
            <Input
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numbers-and-punctuation"
              placeholder="30.0444"
            />
          </Field>
        </View>
        <View className="flex-1">
          <Field label="Longitude">
            <Input
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numbers-and-punctuation"
              placeholder="31.2357"
            />
          </Field>
        </View>
      </View>
      <Pressable onPress={useCurrentLocation} disabled={locating} hitSlop={8} className="mb-4 self-start">
        <Text className="text-accent text-sm">{locating ? 'Locating...' : 'Use current location'}</Text>
      </Pressable>
      <Button label="Save location" disabled={!validLabel || !validCoords || locating} onPress={save} />
    </Sheet>
  )
}
