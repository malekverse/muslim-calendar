import { useMemo } from 'react'

import type { EngineOptions } from '@/core/prayer-engine'

import { useSettingsStore } from '../model/settings-store'

export function useActiveLocation() {
  const locations = useSettingsStore((s) => s.locations)
  const activeLocationId = useSettingsStore((s) => s.activeLocationId)
  return useMemo(
    () => locations.find((l) => l.id === activeLocationId) ?? null,
    [locations, activeLocationId]
  )
}

export function useEngineOptions(): EngineOptions | null {
  const location = useActiveLocation()
  return useMemo(() => {
    if (!location) return null
    return {
      method: location.method,
      highLatitudeRule: location.highLatitudeRule,
      madhab: location.madhab ?? undefined,
    }
  }, [location])
}
