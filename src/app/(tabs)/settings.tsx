import { SettingsView } from '@/features/settings/components/SettingsView'
import { useSettingsStore } from '@/features/settings/model/settings-store'
import { Loading } from '@/ui/Loading'

export default function SettingsScreen() {
  const hydrated = useSettingsStore((s) => s.hydrated)
  if (!hydrated) return <Loading />
  return <SettingsView />
}
