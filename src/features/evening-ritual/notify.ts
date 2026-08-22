import { format } from 'date-fns'

import {
  cancelAllScheduled,
  ensureNotificationPermission,
  scheduleOneShot,
} from '@/core/notifications'
import { PRAYER_LABELS } from '@/core/config'
import type { PrayerKey } from '@/core/prayer-engine'

interface NotificationRefreshInput {
  prayers: { key: PrayerKey; time: Date }[]
  qiyam: { start: Date; end: Date } | null
  prayerReminders: boolean
  qiyamAlarm: boolean
}

/**
 * Rebuilds the local notification set for the current day.
 * Called on ritual screen mount and whenever prefs or times change.
 */
export async function refreshNotifications(input: NotificationRefreshInput): Promise<void> {
  if (!input.prayerReminders && !input.qiyamAlarm) {
    await cancelAllScheduled()
    return
  }
  const granted = await ensureNotificationPermission()
  if (!granted) return

  await cancelAllScheduled()

  if (input.prayerReminders) {
    for (const prayer of input.prayers) {
      await scheduleOneShot(
        prayer.time,
        PRAYER_LABELS[prayer.key],
        `It's time for ${PRAYER_LABELS[prayer.key]}.`
      )
    }
  }

  if (input.qiyamAlarm && input.qiyam) {
    await scheduleOneShot(
      input.qiyam.start,
      'Qiyam window is open',
      `The last third of the night began at ${format(input.qiyam.start, 'HH:mm')}.`
    )
  }
}
