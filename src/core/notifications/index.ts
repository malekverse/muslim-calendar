import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  const request = await Notifications.requestPermissionsAsync()
  return request.granted
}

/** Removes every scheduled notification; callers re-add the full desired set afterwards. */
export async function cancelAllScheduled(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function scheduleOneShot(
  at: Date,
  title: string,
  body: string
): Promise<string | null> {
  if (at.getTime() <= Date.now()) return null
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
  })
}
