# AuraCal — V0 Plan

Single source of truth for product scope. Agents: read the active milestone before writing any code. Keep progress markers honest.

## 1. Product

**AuraCal** is a prayer-native calendar app. The primary axis of a day is not 24 uniform hours — it is the five prayers (*waqt* windows). The Islamic day starts at **Maghrib**, so planning happens in the evening for the day that has already begun. Built for **diaspora Muslims** who must self-structure their day around prayer in environments that won't do it for them.

Positioning line: *Your calendar, finally in tune with your deen.* A layer over existing calendars via the device calendar store — never a replacement demanding migration.

## 2. Core concepts

| Concept | Meaning |
| --- | --- |
| Waqt window | One of five daily containers: Fajr→Sunrise, Dhuhr→Asr, Asr→Maghrib, Maghrib→Isha, Isha→Fajr |
| Anchor | What a routine is scheduled relative to: calculated prayer time or masjid iqamah time |
| Iqamah anchor | Congregation time at the user's actual masjid. **Precedence over calculated times** |
| Muhasabah ritual | Evening review + next-day confirmation at/after Maghrib. The app's core retention loop |
| Qiyam window | Last third of the night, computed per night; alarm target for tahajjud |
| Soft event | Anchored routine that shifts as prayer times drift |
| Hard event | Fixed clock-time event imported from device calendars |

## 3. Roadmap stages

| Stage | Ships | Value delivered | Status |
| --- | --- | --- | --- |
| M0 | Expo scaffold, theme tokens, navigation shell, prayer-engine core | Foundation | ☑ |
| M1 | Day view (waqt grid), location+method settings, local routines CRUD | Useful standalone app | ☑ |
| M2 | Evening ritual screen, qiyam alarms, muhasabah check-ins, notifications | Daily-open loop | ☑ |
| M3 | Device calendar read → overlay hard events on waqt grid | "It sees my life" | ☑ |
| M4 | Write anchored routines back to device calendar; polish; TestFlight beta | Full loop closed | ☐ |

V0 success test: **10 real users from a local masjid use it daily for 2 weeks via TestFlight.**

## 4. V0 scope

### Screens (three only)

1. **Today / Day view** — vertical waqt grid (5 breathing containers + sunrise divider), now-marker, soft routine blocks scaled inside their window, prayer-time ticks with countdown to next prayer.
2. **Evening ritual (Maghrib+)** — today's gentle review (prayers/routines checked off, no streak-shaming), tomorrow preview recomputed around new times, tonight's qiyam window + alarm setter.
3. **Settings** — locations list (+ use current GPS), calculation method, high-latitude rule, iqamah schedule entry, Hijri offset adjuster.

### In V0

- Offline-first: zero network calls for any core function
- Local routines with anchor syntax (below), stored in SQLite
- Notifications: adhan-time reminders (optional), pre-event nudges, qiyam window opens — all scheduled locally via `expo-notifications`
- Manual iqamah schedules (per-masjid, seasonal rows)

### Explicitly OUT of V0 (do not build)

Accounts/auth, payments, cloud sync, family sharing, mosque timetable crowdsourcing, bidirectional OAuth sync, web version, gamified streaks, jam/qasr auto-travel logic (V0 shows recalculation banner only).

## 5. Data model (Drizzle schema sketch)

```ts
type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

interface Location {
  id: string; label: string;
  lat: number; lng: number; timezone: string;
  method: string;              // adhan-js CalculationMethod key
  highLatitudeRule: 'middleOfTheNight' | 'seventhOfTheNight' | 'twilightAngle';
  isDefault: boolean;
}

interface IqamahSchedule {
  id: string; locationId?: string; masjidName: string;
  effectiveFrom: string;       // ISO date — seasonal updates = new row
  times: Record<PrayerKey, number>; // minutes-from-midnight; null if no jamaah
}

interface Routine {
  id: string; name: string;
  category: 'worship' | 'work' | 'gym' | 'family' | 'custom';
  anchor: { kind: 'prayer'; prayer: PrayerKey }
        | { kind: 'iqamah'; scheduleId: string; prayer: PrayerKey };
  offsetMinutes: number;       // −n before anchor, +n after
  durationMinutes: number;
  days: number[];              // weekday recurrence (0–6)
}

interface Completion {
  id: string; date: string;    // ISO date
  refType: 'routine' | 'prayer'; refId: string;
  status: 'done' | 'missed' | 'skipped';
}
```

Settings are simple key-value (Hijri offset, notification prefs, active location).

## 6. Engine requirements (`src/core/prayer-engine`)

- Wrap `adhan-js`; pure functions only; no React imports
- Inputs: coordinates, date, method, high-lat rule, madhab (asr) → outputs all prayer times + waqt window bounds
- Compute last-third-of-night: `nightEnd = fajr`, `nightStart = maghrib(previous day)`, qiyam start = nightStart + ⅔(night duration)
- Resolution order per prayer: iqamah row valid for today → else calculated time
- DST-safe: recompute on timezone change; never cache across tz boundaries

## 7. Edge cases checklist

- [ ] High latitude: Fajr/Isha may collapse — rule switch UI, never null/crash
- [ ] Travel: location change → full recompute of soft blocks, hard events untouched, banner shown
- [ ] DST transitions: no duplicate/missing hours in grid
- [ ] Hijri drift: manual ±2 day offset stored per user, surfaced in settings
- [ ] Midnight-crossing windows: Isha→Fajr window spans midnight in grid math
- [ ] Empty states: no routines, no calendar permissions, first launch

## 8. Design direction

Dark-mode first. References: Notion Calendar, Things 3, Rise, Linear. One accent color, generous whitespace, tokens-only styling. Typography: IBM Plex Sans Arabic (UI Arabic), Amiri (Quranic). No green-gold clichés, no ornament wallpaper. Details enforced in AGENTS.md §Design law.

Signature visual: the **waqt grid** — five containers whose tint subtly tracks the actual sun position/theme time of day. The app should feel like it knows what time it is outside.

## 9. Stack lock

Expo latest stable SDK · expo-router · TypeScript strict · NativeWind v4 · expo-sqlite + Drizzle · adhan-js · Zustand · expo-notifications · expo-calendar (M3/M4). Verify current APIs via Context7 MCP, not memory.
