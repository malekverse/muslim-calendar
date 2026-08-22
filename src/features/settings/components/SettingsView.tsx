import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Switch, Text, View } from 'react-native'

import {
  hasCalendarAccess,
  listSources,
  requestCalendarAccess,
  type CalendarSource,
} from '@/core/calendar-store'

import {
  HIGH_LATITUDE_OPTIONS,
  MADHAB_OPTIONS,
  METHOD_OPTIONS,
  PRAYER_LABELS,
} from '@/core/config'
import type { HighLatitudeRuleName, MadhabName, MethodKey } from '@/core/prayer-engine'
import { formatHijri } from '@/core/hijri'
import { Button } from '@/ui/Button'
import { colors } from '@/ui/theme'

import { LocationFormSheet } from './LocationFormSheet'
import { OptionPickerSheet } from './OptionPickerSheet'
import { ScheduleFormSheet } from './ScheduleFormSheet'
import { useSettingsStore } from '../model/settings-store'

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-ink-faint mb-2 mt-8 text-xs font-semibold uppercase tracking-widest">
      {children}
    </Text>
  )
}

interface SettingRowProps {
  label: string
  value: string
  onPress: () => void
}

function SettingRow({ label, value, onPress }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="border-hairline bg-surface flex-row items-center justify-between rounded-card border px-4 py-3.5"
      android_ripple={{ color: '#262C34' }}
    >
      <Text className="text-ink">{label}</Text>
      <Text className="text-ink-muted text-sm">{value}</Text>
    </Pressable>
  )
}

export function SettingsView() {
  const {
    locations,
    schedules,
    activeLocationId,
    hijriOffsetDays,
    prayerReminders,
    qiyamAlarm,
    enabledCalendarIds,
    writebackEnabled,
    activateLocation,
    removeLocation,
    removeSchedule,
    setHijriOffset,
    setPrayerReminders,
    setQiyamAlarm,
    toggleCalendarSource,
    setWritebackEnabled,
  } = useSettingsStore()

  const [calendarAccess, setCalendarAccess] = useState<boolean | null>(null)
  const [deviceCalendars, setDeviceCalendars] = useState<CalendarSource[]>([])

  useEffect(() => {
    void (async () => {
      const granted = await hasCalendarAccess()
      setCalendarAccess(granted)
      if (granted) setDeviceCalendars(await listSources())
    })()
  }, [])

  async function grantCalendar() {
    if (await requestCalendarAccess()) {
      setCalendarAccess(true)
      setDeviceCalendars(await listSources())
    }
  }

  const [locationSheetOpen, setLocationSheetOpen] = useState(false)
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null)
  const [scheduleSheetOpen, setScheduleSheetOpen] = useState(false)
  const [picker, setPicker] = useState<'method' | 'highLat' | 'madhab' | null>(null)
  const [pickerTargetId, setPickerTargetId] = useState<string | null>(null)

  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? null

  function openAdd() {
    setEditingLocationId(null)
    setLocationSheetOpen(true)
  }

  function openEdit(id: string) {
    setEditingLocationId(id)
    setLocationSheetOpen(true)
  }

  function confirmDeleteLocation(id: string, label: string) {
    Alert.alert('Remove location', `Delete "${label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void removeLocation(id) },
    ])
  }

  const editingLocation = locations.find((l) => l.id === editingLocationId) ?? null

  async function applyMethod(key: MethodKey) {
    if (pickerTargetId) await useSettingsStore.getState().editLocation(pickerTargetId, { method: key })
  }
  async function applyHighLat(key: HighLatitudeRuleName) {
    if (pickerTargetId)
      await useSettingsStore.getState().editLocation(pickerTargetId, { highLatitudeRule: key })
  }
  async function applyMadhab(key: MadhabName) {
    if (pickerTargetId) await useSettingsStore.getState().editLocation(pickerTargetId, { madhab: key })
  }

  return (
    <ScrollView className="flex-1 bg-base" contentContainerClassName="px-5 pb-16 pt-14">
      <Text className="text-ink text-3xl font-semibold">Settings</Text>

      <SectionLabel>Locations</SectionLabel>
      <View className="gap-2">
        {locations.map((location) => {
          const active = location.id === activeLocationId
          return (
            <View
              key={location.id}
              className="border-hairline bg-surface flex-row items-center rounded-card border px-4 py-3"
            >
              <Pressable className="flex-1" onPress={() => void activateLocation(location.id)}>
                <View className="flex-row items-center gap-2">
                  {active && <View className="h-2 w-2 rounded-full bg-accent" />}
                  <Text className={`text-base ${active ? 'text-accent font-medium' : 'text-ink'}`}>
                    {location.label}
                  </Text>
                </View>
                <Text className="text-ink-faint mt-0.5 text-xs">
                  {location.latitude.toFixed(3)}, {location.longitude.toFixed(3)}
                </Text>
              </Pressable>
              <Pressable onPress={() => openEdit(location.id)} hitSlop={8} className="mr-4">
                <Text className="text-accent text-sm">Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => confirmDeleteLocation(location.id, location.label)}
                hitSlop={8}
              >
                <Text className="text-danger text-sm">Delete</Text>
              </Pressable>
            </View>
          )
        })}
      </View>
      <Button
        label="Add location"
        variant="secondary"
        className="mt-2"
        onPress={openAdd}
      />

      <SectionLabel>Prayer calculation</SectionLabel>
      <View className="gap-2">
        <SettingRow
          label="Calculation method"
          value={
            activeLocation
              ? (METHOD_OPTIONS.find((m) => m.key === activeLocation.method)?.label ?? '')
              : '—'
          }
          onPress={() => {
            if (!activeLocation) return
            setPicker('method')
            setPickerTargetId(activeLocation.id)
          }}
        />
        <SettingRow
          label="High-latitude rule"
          value={
            activeLocation
              ? (HIGH_LATITUDE_OPTIONS.find((o) => o.key === activeLocation.highLatitudeRule)?.label ?? '')
              : '—'
          }
          onPress={() => {
            if (!activeLocation) return
            setPicker('highLat')
            setPickerTargetId(activeLocation.id)
          }}
        />
        <SettingRow
          label="Asr juristic method"
          value={
            activeLocation && activeLocation.madhab
              ? (MADHAB_OPTIONS.find((m) => m.key === activeLocation.madhab)?.label.split(' ')[0] ?? '')
              : 'Standard'
          }
          onPress={() => {
            if (!activeLocation) return
            setPicker('madhab')
            setPickerTargetId(activeLocation.id)
          }}
        />
      </View>

      <SectionLabel>Masjid iqamah</SectionLabel>
      <View className="gap-2">
        {schedules.length === 0 && (
          <Text className="text-ink-muted text-sm leading-relaxed">
            Anchor routines to your masjid&apos;s congregation times instead of calculated adhan.
          </Text>
        )}
        {schedules.map((schedule) => (
          <View
            key={schedule.id}
            className="border-hairline bg-surface rounded-card border px-4 py-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-ink">{schedule.masjidName}</Text>
              <Pressable onPress={() => void removeSchedule(schedule.id)} hitSlop={8}>
                <Text className="text-danger text-sm">Delete</Text>
              </Pressable>
            </View>
            <Text className="text-ink-muted mt-1 text-xs">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const)
                .filter((p) => schedule[p] !== null)
                .map((p) => `${PRAYER_LABELS[p]} ${String(Math.floor(schedule[p]! / 60)).padStart(2, '0')}:${String(schedule[p]! % 60).padStart(2, '0')}`)
                .join(' · ')}
            </Text>
          </View>
        ))}
      </View>
      <Button
        label="Add iqamah schedule"
        variant="secondary"
        className="mt-2"
        onPress={() => setScheduleSheetOpen(true)}
      />

      <SectionLabel>Notifications</SectionLabel>
      <View className="gap-2">
        <View className="border-hairline bg-surface flex-row items-center justify-between rounded-card border px-4 py-3.5">
          <Text className="text-ink mr-4 flex-1">Prayer reminders</Text>
          <Switch
            value={prayerReminders}
            onValueChange={(v) => void setPrayerReminders(v)}
            trackColor={{ false: colors.hairline, true: colors.accent }}
            thumbColor={colors.ink}
          />
        </View>
        <View className="border-hairline bg-surface flex-row items-center justify-between rounded-card border px-4 py-3.5">
          <Text className="text-ink mr-4 flex-1">Qiyam alarm</Text>
          <Switch
            value={qiyamAlarm}
            onValueChange={(v) => void setQiyamAlarm(v)}
            trackColor={{ false: colors.hairline, true: colors.accent }}
            thumbColor={colors.ink}
          />
        </View>
      </View>

      <SectionLabel>Device calendars</SectionLabel>
      {!calendarAccess ? (
        <Button
          label="Grant calendar access"
          variant="secondary"
          onPress={() => void grantCalendar()}
        />
      ) : deviceCalendars.length === 0 ? (
        <Text className="text-ink-muted text-sm">No calendars found on this device.</Text>
      ) : (
        <>
          {deviceCalendars.map((source) => {
            const enabled = enabledCalendarIds.includes(source.id)
            return (
              <View
                key={source.id}
                className="border-hairline bg-surface flex-row items-center justify-between rounded-card border px-4 py-3.5"
              >
                <Text className="text-ink mr-4 flex-1" numberOfLines={1}>
                  {source.title}
                </Text>
                <Switch
                  value={enabled}
                  onValueChange={() => void toggleCalendarSource(source.id)}
                  trackColor={{ false: colors.hairline, true: colors.accent }}
                  thumbColor={colors.ink}
                />
              </View>
            )
          })}
          <Text className="text-ink-faint mt-2 text-xs leading-relaxed">
            Selected calendars appear as fixed events on the waqt grid.
          </Text>
          <View className="border-hairline bg-surface mt-2 flex-row items-center justify-between rounded-card border px-4 py-3.5">
            <View className="mr-4 flex-1">
              <Text className="text-ink">Mirror routines to my calendar</Text>
              <Text className="text-ink-faint mt-0.5 text-xs leading-relaxed">
                Writes the next 7 days into an &quot;AuraCal&quot; calendar; your Google/Apple
                account syncs it everywhere.
              </Text>
            </View>
            <Switch
              value={writebackEnabled}
              onValueChange={(v) => void setWritebackEnabled(v)}
              trackColor={{ false: colors.hairline, true: colors.accent }}
              thumbColor={colors.ink}
            />
          </View>
        </>
      )}

      <SectionLabel>Hijri date</SectionLabel>
      <View className="border-hairline bg-surface items-center rounded-card border px-4 py-4">
        <Text className="text-ink mb-3">{formatHijri(new Date(), hijriOffsetDays)}</Text>
        <View className="flex-row items-center gap-6">
          <Pressable
            disabled={hijriOffsetDays <= -2}
            onPress={() => void setHijriOffset(hijriOffsetDays - 1)}
            className="border-hairline bg-raised h-9 w-9 items-center justify-center rounded-full border"
          >
            <Text className="text-ink text-xl">−</Text>
          </Pressable>
          <Text className="text-ink-muted w-16 text-center text-sm">
            {hijriOffsetDays > 0 ? `+${hijriOffsetDays}` : hijriOffsetDays} day
            {hijriOffsetDays === 1 ? '' : 's'}
          </Text>
          <Pressable
            disabled={hijriOffsetDays >= 2}
            onPress={() => void setHijriOffset(hijriOffsetDays + 1)}
            className="border-hairline bg-raised h-9 w-9 items-center justify-center rounded-full border"
          >
            <Text className="text-ink text-xl">+</Text>
          </Pressable>
        </View>
      </View>

      <LocationFormSheet
        key={editingLocationId ?? 'new-location'}
        visible={locationSheetOpen}
        initial={editingLocation}
        onClose={() => setLocationSheetOpen(false)}
      />
      <ScheduleFormSheet visible={scheduleSheetOpen} onClose={() => setScheduleSheetOpen(false)} />
      {pickerTargetId && (
        <>
          <OptionPickerSheet<MethodKey>
            visible={picker === 'method'}
            title="Calculation method"
            options={METHOD_OPTIONS}
            value={locations.find((l) => l.id === pickerTargetId)?.method ?? null}
            onSelect={(key) => void applyMethod(key)}
            onClose={() => setPicker(null)}
          />
          <OptionPickerSheet<HighLatitudeRuleName>
            visible={picker === 'highLat'}
            title="High-latitude rule"
            options={HIGH_LATITUDE_OPTIONS}
            value={locations.find((l) => l.id === pickerTargetId)?.highLatitudeRule ?? null}
            onSelect={(key) => void applyHighLat(key)}
            onClose={() => setPicker(null)}
          />
          <OptionPickerSheet<MadhabName>
            visible={picker === 'madhab'}
            title="Asr juristic method"
            options={MADHAB_OPTIONS}
            value={locations.find((l) => l.id === pickerTargetId)?.madhab ?? null}
            onSelect={(key) => void applyMadhab(key)}
            onClose={() => setPicker(null)}
          />
        </>
      )}
    </ScrollView>
  )
}

