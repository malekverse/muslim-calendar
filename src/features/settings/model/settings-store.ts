import { create } from 'zustand'

import { initDatabase } from '@/core/db/client'
import * as repo from '@/core/db/repos'
import type { IqamahScheduleRow, LocationRow } from '@/core/db/schema'
import type { HighLatitudeRuleName, MadhabName, MethodKey } from '@/core/prayer-engine'

export interface NewLocationInput {
  label: string
  latitude: number
  longitude: number
  timezone: string
  method?: MethodKey
  highLatitudeRule?: HighLatitudeRuleName
  madhab?: MadhabName | null
}

interface SettingsState {
  hydrated: boolean
  locations: LocationRow[]
  schedules: IqamahScheduleRow[]
  activeLocationId: string | null
  hijriOffsetDays: number
  prayerReminders: boolean
  qiyamAlarm: boolean
  init: () => Promise<void>
  addLocation: (input: NewLocationInput) => Promise<void>
  editLocation: (id: string, patch: Partial<NewLocationInput>) => Promise<void>
  removeLocation: (id: string) => Promise<void>
  activateLocation: (id: string) => Promise<void>
  upsertSchedule: (row: IqamahScheduleRow) => Promise<void>
  removeSchedule: (id: string) => Promise<void>
  setHijriOffset: (days: number) => Promise<void>
  setPrayerReminders: (enabled: boolean) => Promise<void>
  setQiyamAlarm: (enabled: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  hydrated: false,
  locations: [],
  schedules: [],
  activeLocationId: null,
  hijriOffsetDays: 0,
  prayerReminders: false,
  qiyamAlarm: false,

  init: async () => {
    await initDatabase()
    const [locations, schedules] = await Promise.all([repo.listLocations(), repo.listSchedules()])
    const storedActive = await repo.getSetting<string>('activeLocationId')
    const offset = (await repo.getSetting<number>('hijriOffsetDays')) ?? 0
    const prayerReminders = (await repo.getSetting<boolean>('prayerReminders')) ?? false
    const qiyamAlarm = (await repo.getSetting<boolean>('qiyamAlarm')) ?? false

    let activeLocationId = storedActive ?? null
    if (!activeLocationId || !locations.some((l) => l.id === activeLocationId)) {
      activeLocationId = locations.find((l) => l.isDefault)?.id ?? locations[0]?.id ?? null
    }

    set({
      locations,
      schedules,
      activeLocationId,
      hijriOffsetDays: offset,
      prayerReminders,
      qiyamAlarm,
      hydrated: true,
    })
  },

  addLocation: async (input) => {
    const isFirst = get().locations.length === 0
    const row = {
      id: repo.newId(),
      method: input.method ?? 'muslimWorldLeague',
      highLatitudeRule: input.highLatitudeRule ?? 'middleOfTheNight',
      madhab: input.madhab ?? null,
      isDefault: false,
      ...input,
    }
    await repo.insertLocation(row)
    if (isFirst) {
      await repo.setActiveLocation(row.id)
      await repo.setSetting('activeLocationId', row.id)
    }
    set({ locations: await repo.listLocations(), activeLocationId: isFirst ? row.id : get().activeLocationId })
  },

  editLocation: async (id, patch) => {
    await repo.updateLocation(id, patch)
    set({ locations: await repo.listLocations() })
  },

  removeLocation: async (id) => {
    await repo.deleteLocation(id)
    const remaining = await repo.listLocations()
    const wasActive = get().activeLocationId === id
    if (wasActive && remaining.length > 0) {
      await repo.setActiveLocation(remaining[0].id)
      await repo.setSetting('activeLocationId', remaining[0].id)
      set({ activeLocationId: remaining[0].id })
    }
    set({ locations: remaining, activeLocationId: wasActive && remaining.length === 0 ? null : get().activeLocationId })
  },

  activateLocation: async (id) => {
    await repo.setActiveLocation(id)
    await repo.setSetting('activeLocationId', id)
    set({
      activeLocationId: id,
      locations: get().locations.map((l) => ({ ...l, isDefault: l.id === id })),
    })
  },

  upsertSchedule: async (row) => {
    await repo.upsertSchedule(row)
    set({ schedules: await repo.listSchedules() })
  },

  removeSchedule: async (id) => {
    await repo.deleteSchedule(id)
    set({ schedules: await repo.listSchedules() })
  },

  setHijriOffset: async (days) => {
    await repo.setSetting('hijriOffsetDays', days)
    set({ hijriOffsetDays: days })
  },

  setPrayerReminders: async (enabled) => {
    await repo.setSetting('prayerReminders', enabled)
    set({ prayerReminders: enabled })
  },

  setQiyamAlarm: async (enabled) => {
    await repo.setSetting('qiyamAlarm', enabled)
    set({ qiyamAlarm: enabled })
  },
}))
