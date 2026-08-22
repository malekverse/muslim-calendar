import { format } from 'date-fns'

import {
  cancelAllScheduled,
  ensureNotificationPermission,
  scheduleOneShot,
} from '@/core/notifications'
import { PRAYER_LABELS } from '@/core/config'
import type { DayPrayerTimes, PrayerKey } from '@/core/prayer-engine'

export interface NotificationPrayerRow {
  key: PrayerKey
  time: Date
}

/** Today's five congregation-ordered prayers from resolved times. */
export function jamaatRows(times: DayPrayerTimes): NotificationPrayerRow[] {
  return (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const).map((key) => ({
    key,
    time: times[key],
  }))
}

interface NotificationRefreshInput {
  prayers: NotificationPrayerRow[]
  qiyam: { start: Date; end: Date } | null
  prayerReminders: boolean
  qiyamAlarm: boolean
}

/** Rebuilds the local notification set; failures must never crash the app. */
export async function refreshNotifications(input: NotificationRefreshInput): Promise<void> {
  try {
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
  } catch {
    // Notifications are best-effort; never block startup.
  }
}
